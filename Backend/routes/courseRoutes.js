const express = require("express");
const {
    getCourses,
    getCourse,
    addCourse,
    editCourse,
    removeCourse
} = require("../controllers/courseController");
const validateCourse = require("../middleware/courseValidation");

const router = express.Router();

router.get("/", getCourses);                       // GET all courses
router.get("/:id", getCourse);                     // GET one course
router.post("/", validateCourse, addCourse);       // CREATE course (validated)
router.put("/:id", editCourse);                    // UPDATE course
router.delete("/:id", removeCourse);               // DELETE course

module.exports = router;
