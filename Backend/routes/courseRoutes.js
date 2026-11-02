const express = require("express");
const {
    getCourses,
    getCourse,
    addCourse,
    editCourse,
    removeCourse
} = require("../controllers/courseController");
const authMiddleware = require("../middleware/authMiddleware");
const requireAdmin = require("../middleware/adminMiddleware");
const validateRequest = require("../middleware/validateRequest");
const {
    createCourseValidation,
    updateCourseValidation,
    courseIdValidation
} = require("../validators/courseValidators");

const router = express.Router();

// PUBLIC - anyone can browse courses
router.get("/", getCourses);                                                              // GET all courses
router.get("/:id", courseIdValidation, validateRequest, getCourse);                        // GET one course

// PROTECTED - a valid JWT *and* the admin role are required
router.post("/", authMiddleware, requireAdmin, createCourseValidation, validateRequest, addCourse);       // CREATE
router.put("/:id", authMiddleware, requireAdmin, updateCourseValidation, validateRequest, editCourse);    // UPDATE
router.delete("/:id", authMiddleware, requireAdmin, courseIdValidation, validateRequest, removeCourse);   // DELETE

module.exports = router;