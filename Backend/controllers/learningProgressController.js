const crypto = require("crypto");
const mongoose = require("mongoose");
const Enrollment = require("../models/Enrollment");
const LearningProgress = require("../models/LearningProgress");

// PUT /api/v1/progress   body: { courseId, completedLessons, totalLessons }   (student only)
async function updateProgress(req, res, next) {
  try {
    const studentId = req.user.sub;
    const { courseId, completedLessons, totalLessons, certificateId } = req.body || {};

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ message: "A valid courseId is required" });
    }
    if (!Number.isInteger(completedLessons) || !Number.isInteger(totalLessons)) {
      return res.status(400).json({ message: "completedLessons and totalLessons must be whole numbers" });
    }
    if (totalLessons < 1 || completedLessons < 0 || completedLessons > totalLessons) {
      return res.status(400).json({
        message: "totalLessons must be at least 1 and completedLessons must be between 0 and totalLessons",
      });
    }

    // Only students enrolled in the course can track progress for it.
    const enrollment = await Enrollment.findOne({ student: studentId, course: courseId });
    if (!enrollment || enrollment.status === "withdrawn") {
      return res.status(403).json({ message: "You must be enrolled in this course to update progress" });
    }

    let progress = await LearningProgress.findOne({ student: studentId, course: courseId });
    if (progress) {
      progress.completedLessons = completedLessons;
      progress.totalLessons = totalLessons;
    } else {
      progress = new LearningProgress({ student: studentId, course: courseId, completedLessons, totalLessons });
    }
    await progress.save(); // pre-save hook recalculates progressPercentage

    if (progress.progressPercentage === 100 && enrollment.status !== "completed") {
      enrollment.status = "completed";
      // The React app may send its own certificate id; otherwise make one.
      const clientCertId = typeof certificateId === "string" && /^[\w-]{1,64}$/.test(certificateId) ? certificateId : "";
      enrollment.certificateId =
        enrollment.certificateId || clientCertId || "CERT-" + crypto.randomBytes(5).toString("hex").toUpperCase();
      await enrollment.save();
    } else if (progress.progressPercentage < 100 && enrollment.status === "completed") {
      enrollment.status = "active";
      await enrollment.save();
    }

    return res.status(200).json({ message: "Progress updated successfully", progress, enrollment });
  } catch (error) {
    next(error);
  }
}

// GET /api/v1/progress/my-progress   (student only)
async function getMyProgress(req, res, next) {
  try {
    const studentId = req.user.sub;

    const enrollments = await Enrollment.find({ student: studentId, status: { $in: ["active", "completed"] } });
    const courseIds = enrollments.map((e) => e.course);

    const progress = await LearningProgress.find({ student: studentId, course: { $in: courseIds } })
      .populate("course", "title")
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      message: "Learning progress fetched successfully",
      totalCourses: progress.length,
      progress: progress.filter((p) => p.course),
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { updateProgress, getMyProgress };