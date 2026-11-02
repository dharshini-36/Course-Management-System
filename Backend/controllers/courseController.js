const {
    getAllCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse
} = require("../services/courseService");

// GET /api/v1/courses            (all courses)
// GET /api/v1/courses?page=1&limit=10   (paginated)
const getCourses = async (req, res, next) => {
    try {
        const { courses, total } = await getAllCourses({
            page: req.query.page,
            limit: req.query.limit
        });
        res.status(200).json({ success: true, count: courses.length, total, data: courses });
    } catch (error) { next(error); }
};

// GET /api/v1/courses/:id
const getCourse = async (req, res, next) => {
    try {
        const course = await getCourseById(req.params.id);
        if (!course) {
            return res.status(404).json({ success: false, message: "Course not found" });
        }
        res.status(200).json({ success: true, data: course });
    } catch (error) { next(error); }
};

// POST /api/v1/courses
const addCourse = async (req, res, next) => {
    try {
        const newCourse = await createCourse(req.body);
        res.status(201).json({ success: true, message: "Course created successfully", data: newCourse });
    } catch (error) { next(error); }
};

// PUT /api/v1/courses/:id
const editCourse = async (req, res, next) => {
    try {
        const updatedCourse = await updateCourse(req.params.id, req.body);
        if (!updatedCourse) {
            return res.status(404).json({ success: false, message: "Course not found" });
        }
        res.status(200).json({ success: true, message: "Course updated successfully", data: updatedCourse });
    } catch (error) { next(error); }
};

// DELETE /api/v1/courses/:id
const removeCourse = async (req, res, next) => {
    try {
        const deleted = await deleteCourse(req.params.id);
        if (!deleted) {
            return res.status(404).json({ success: false, message: "Course not found" });
        }
        res.status(200).json({ success: true, message: "Course deleted successfully" });
    } catch (error) { next(error); }
};

module.exports = { getCourses, getCourse, addCourse, editCourse, removeCourse };