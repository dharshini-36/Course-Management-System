const mongoose = require("mongoose");
const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");
const LearningProgress = require("../models/LearningProgress");

// POST /api/v1/enrollments   body: { courseId, rollNo? }   (student only)
async function enrollCourse(req, res, next) {
  try {
    const studentId = req.user.sub;
    const { courseId, rollNo } = req.body || {};

    if (!mongoose.isValidObjectId(studentId) || !mongoose.isValidObjectId(courseId)) {
      return res.status(400).json({ message: "A valid courseId is required" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    const existing = await Enrollment.findOne({ student: studentId, course: courseId });

    if (existing) {
      // Already enrolled (active or completed)
      if (existing.status !== "withdrawn") {
        return res.status(409).json({ message: "You are already enrolled in this course" });
      }

      // Re-enrolling after withdrawing: reactivate the SAME record,
      // otherwise the unique index would block a second insert.
      const progress = await LearningProgress.findOne({ student: studentId, course: courseId });
      existing.status = progress && progress.progressPercentage === 100 ? "completed" : "active";
      existing.enrolledAt = new Date();
      if (typeof rollNo === "string" && rollNo.trim()) existing.rollNo = rollNo.trim();
      await existing.save();

      return res.status(201).json({ message: "Re-enrolled successfully", enrollment: existing });
    }

    const enrollment = await Enrollment.create({
      student: studentId,
      course: courseId,
      rollNo: typeof rollNo === "string" ? rollNo.trim() : ""
    });

    return res.status(201).json({ message: "Enrolled successfully", enrollment });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "You are already enrolled in this course" });
    }
    next(error);
  }
}

// GET /api/v1/enrollments/my-courses   (student only)
async function getMyCourses(req, res, next) {
  try {
    const enrollments = await Enrollment.find({
      student: req.user.sub,
      status: { $ne: "withdrawn" }
    })
      .populate("course")
      .sort({ enrolledAt: -1 });

    // Hide enrolments whose course was deleted by an admin.
    const valid = enrollments.filter((e) => e.course);

    return res.status(200).json({
      message: "Enrolled courses fetched successfully",
      totalEnrollments: valid.length,
      enrollments: valid
    });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/v1/enrollments/:courseId   (student only)
// Marks the enrollment "withdrawn" (history is kept, nothing is deleted).
async function unenrollCourse(req, res, next) {
  try {
    const { courseId } = req.params;
    if (!mongoose.isValidObjectId(courseId)) {
      return res.status(400).json({ message: "A valid courseId is required" });
    }

    const enrollment = await Enrollment.findOneAndUpdate(
      { student: req.user.sub, course: courseId, status: { $ne: "withdrawn" } },
      { $set: { status: "withdrawn" } },
      { returnDocument: "after" }
    );

    if (!enrollment) {
      return res.status(404).json({ message: "You are not enrolled in this course" });
    }

    return res.status(200).json({ message: "Unenrolled successfully" });
  } catch (error) {
    next(error);
  }
}

// GET /api/v1/enrollments/all   (admin only) - used by the admin dashboard
async function getAllEnrollments(req, res, next) {
  try {
    const enrollments = await Enrollment.find({ status: { $ne: "withdrawn" } })
      .populate("student", "name email department")
      .populate("course", "title category")
      .sort({ enrolledAt: -1 });

    return res.status(200).json({
      message: "All enrollments fetched successfully",
      totalEnrollments: enrollments.length,
      enrollments
    });
  } catch (error) {
    next(error);
  }
}

// DELETE /api/v1/enrollments/all   (admin only)
async function clearAllEnrollments(req, res, next) {
  try {
    const result = await Enrollment.deleteMany({});
    await LearningProgress.deleteMany({});
    return res.status(200).json({ message: "All enrollments cleared", deleted: result.deletedCount });
  } catch (error) {
    next(error);
  }
}

module.exports = { enrollCourse, getMyCourses, unenrollCourse, getAllEnrollments, clearAllEnrollments };