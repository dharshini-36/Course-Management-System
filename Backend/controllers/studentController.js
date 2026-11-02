const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Enrollment = require("../models/Enrollment");
const LearningProgress = require("../models/LearningProgress");
const Message = require("../models/Message");
const Notification = require("../models/Notification");

const publicFields = "name email department role createdAt updatedAt";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// GET /api/v1/students   (admin only)
async function getStudents(req, res, next) {
  try {
    const students = await User.find({ role: "student" })
      .select(publicFields)
      .sort({ createdAt: -1 })
      .lean();

    res.json({ count: students.length, students });
  } catch (error) {
    next(error);
  }
}

// GET /api/v1/students/:id   (admin only)
async function getStudentById(req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid student ID" });
    }

    const student = await User.findOne({ _id: req.params.id, role: "student" })
      .select(publicFields)
      .lean();

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({ student });
  } catch (error) {
    next(error);
  }
}

// POST /api/v1/students   (admin only)
async function createStudent(req, res, next) {
  try {
    const { name, email, password, department } = req.body || {};

    if (
      typeof name !== "string" ||
      !name.trim() ||
      typeof email !== "string" ||
      !EMAIL_REGEX.test(email.trim()) ||
      typeof password !== "string" ||
      password.length < 12 ||
      password.length > 72
    ) {
      return res.status(400).json({
        message: "Valid name, email and a password of 12-72 characters are required"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (await User.exists({ email: normalizedEmail })) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const student = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash: await bcrypt.hash(password, 12),
      department: typeof department === "string" ? department.trim() : "",
      role: "student"
    });

    res.status(201).json({
      message: "Student created",
      student: {
        id: student.id,
        name: student.name,
        email: student.email,
        department: student.department,
        role: student.role
      }
    });
  } catch (error) {
    next(error);
  }
}

// PUT /api/v1/students/:id   (admin only)
async function updateStudent(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid student ID" });
    }

    const updates = {};
    const body = req.body || {};

    if (body.name !== undefined) {
      if (typeof body.name !== "string" || !body.name.trim()) {
        return res.status(400).json({ message: "Invalid name" });
      }
      updates.name = body.name.trim();
    }

    if (body.email !== undefined) {
      if (typeof body.email !== "string" || !EMAIL_REGEX.test(body.email.trim())) {
        return res.status(400).json({ message: "Invalid email" });
      }
      updates.email = body.email.trim().toLowerCase();
    }

    if (body.department !== undefined) {
      if (typeof body.department !== "string") {
        return res.status(400).json({ message: "Invalid department" });
      }
      updates.department = body.department.trim();
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No valid fields supplied" });
    }

    const student = await User.findOneAndUpdate(
      { _id: id, role: "student" },
      { $set: updates },
      { returnDocument: "after", runValidators: true }
    );

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.json({
      message: "Student updated",
      student: {
        _id: student._id,
        name: student.name,
        email: student.email,
        department: student.department,
        role: student.role,
        updatedAt: student.updatedAt
      }
    });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/v1/students/:id   (admin only)
// Removes the student AND everything that belongs to them, so no orphaned
// enrollments, progress, messages or notifications are left behind.
async function deleteStudent(req, res, next) {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid student ID" });
    }

    const student = await User.findOne({ _id: id, role: "student" }).select("_id");
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    await Promise.all([
      Enrollment.deleteMany({ student: id }),
      LearningProgress.deleteMany({ student: id }),
      Message.deleteMany({ $or: [{ sender: id }, { recipient: id }] }),
      Notification.deleteMany({ recipient: id })
    ]);
    await User.deleteOne({ _id: id });

    res.json({ message: "Student and related records deleted" });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent
};