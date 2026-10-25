const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { randomUUID } = crypto;
const students = require("../data/students");

async function registerStudent({ name, email, password, department }) {
  const normalizedEmail = email.trim().toLowerCase();

  const existingStudent = students.find(
    (student) => student.email === normalizedEmail
  );

  if (existingStudent) {
    const error = new Error("Email is already registered");
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const student = {
    id: randomUUID(),
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    department: department.trim(),
    createdAt: new Date().toISOString(),
  };

  students.push(student);

  // Never return the password hash.
  return {
    id: student.id,
    name: student.name,
    email: student.email,
    department: student.department,
    createdAt: student.createdAt,
  };
}

async function loginStudent({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase();

  const student = students.find((item) => item.email === normalizedEmail);

  if (!student) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  const passwordMatches = await bcrypt.compare(password, student.passwordHash);

  if (!passwordMatches) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  return {
    id: student.id,
    name: student.name,
    email: student.email,
    department: student.department,
  };
}

// Compare two strings without leaking timing information.
function safeEqual(a, b) {
  const hashA = crypto.createHash("sha256").update(String(a)).digest();
  const hashB = crypto.createHash("sha256").update(String(b)).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

// Admin credentials come from the .env file (ADMIN_EMAIL / ADMIN_PASSWORD).
async function loginAdmin({ email, password }) {
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
    throw new Error("Admin credentials are not configured");
  }

  const emailMatches = safeEqual(
    email.trim().toLowerCase(),
    process.env.ADMIN_EMAIL.trim().toLowerCase()
  );
  const passwordMatches = safeEqual(password, process.env.ADMIN_PASSWORD);

  if (!emailMatches || !passwordMatches) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  return {
    id: "admin",
    name: "Admin",
    email: process.env.ADMIN_EMAIL.trim().toLowerCase(),
  };
}

module.exports = {
  registerStudent,
  loginStudent,
  loginAdmin,
};
