const express = require("express");
const {
    getCourses,
    getCourse,
    addCourse,
    editCourse,
    removeCourse
} = require("../controllers/courseController");
const validateCourse = require("../middleware/courseValidation");
const authMiddleware = require("../middleware/authMiddleware");
const requireAdmin = require("../middleware/adminMiddleware");

const router = express.Router();

// PUBLIC - anyone can browse courses
router.get("/", getCourses);                                          // GET all courses
router.get("/:id", getCourse);                                        // GET one course

// PROTECTED - a valid JWT *and* the admin role are required
router.post("/", authMiddleware, requireAdmin, validateCourse, addCourse); // CREATE course
router.put("/:id", authMiddleware, requireAdmin, editCourse);              // UPDATE course
router.delete("/:id", authMiddleware, requireAdmin, removeCourse);         // DELETE course

module.exports = router;
