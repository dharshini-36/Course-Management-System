const bcrypt = require("bcryptjs");
const User = require("../models/User");

function publicUser(user) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    department: user.department,
    role: user.role,
  };
}

function httpError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

async function registerStudent({ name, email, password, department }) {
  const normalizedEmail = email.trim().toLowerCase();

  if (await User.findOne({ email: normalizedEmail })) {
    throw httpError("Email is already registered", 409);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  try {
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      department: department.trim(),
      role: "student", // public registration can NEVER create an admin
    });
    return { ...publicUser(user), createdAt: user.createdAt };
  } catch (error) {
    if (error.code === 11000) throw httpError("Email is already registered", 409);
    throw error;
  }
}

async function loginWithRole({ email, password }, role) {
  const user = await User.findOne({ email: email.trim().toLowerCase(), role });
  // Same message for "no user" and "wrong password" so emails can't be probed.
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw httpError("Invalid email or password", 401);
  }
  return publicUser(user);
}

const loginStudent = (credentials) => loginWithRole(credentials, "student");
const loginAdmin = (credentials) => loginWithRole(credentials, "admin");

module.exports = { registerStudent, loginStudent, loginAdmin };
