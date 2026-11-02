const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const {
  enrollCourse,
  getMyCourses,
  unenrollCourse,
  getAllEnrollments,
  clearAllEnrollments,
} = require("../controllers/enrollmentController");

const router = express.Router();

// Admin-only (must be declared BEFORE "/:courseId")
router.get("/all", authMiddleware, authorizeRoles("admin"), getAllEnrollments);
router.delete("/all", authMiddleware, authorizeRoles("admin"), clearAllEnrollments);

// Student-only
router.get("/my-courses", authMiddleware, authorizeRoles("student"), getMyCourses);
router.post("/", authMiddleware, authorizeRoles("student"), enrollCourse);
router.delete("/:courseId", authMiddleware, authorizeRoles("student"), unenrollCourse);

module.exports = router;
