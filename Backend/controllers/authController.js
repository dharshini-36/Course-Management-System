const jwt = require("jsonwebtoken");
const authService = require("../services/authService");

async function register(req, res, next) {
  try {
    const student = await authService.registerStudent(req.body);

    return res.status(201).json({
      message: "Student registered successfully",
      student,
    });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const student = await authService.loginStudent(req.body);

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured");
    }

    const expiresIn = process.env.JWT_EXPIRES_IN || "1h";

    const token = jwt.sign(
      { email: student.email, role: "student" },
      process.env.JWT_SECRET,
      {
        subject: String(student.id),
        expiresIn: expiresIn,
      }
    );

    return res.status(200).json({
      message: "Login successful",
      token: token,
      tokenType: "Bearer",
      expiresIn: expiresIn,
      student: student,
    });
  } catch (error) {
    next(error);
  }
}

async function adminLogin(req, res, next) {
  try {
    const admin = await authService.loginAdmin(req.body);

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured");
    }

    const expiresIn = process.env.JWT_EXPIRES_IN || "1h";

    const token = jwt.sign(
      { email: admin.email, role: "admin" },
      process.env.JWT_SECRET,
      {
        subject: String(admin.id),
        expiresIn: expiresIn,
      }
    );

    return res.status(200).json({
      message: "Admin login successful",
      token: token,
      tokenType: "Bearer",
      expiresIn: expiresIn,
      admin: admin,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  adminLogin,
};
