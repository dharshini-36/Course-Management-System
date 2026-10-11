// Checks required fields before a course is created.
// Fields match your course data: title, category, instructor, level, weeks...
const validateCourse = (req, res, next) => {
    const { title, category, instructor } = req.body;

    if (!title) {
        return res.status(400).json({ success: false, message: "Course title is required" });
    }
    if (!category) {
        return res.status(400).json({ success: false, message: "Category is required" });
    }
    if (!instructor) {
        return res.status(400).json({ success: false, message: "Instructor is required" });
    }

    next();
};

module.exports = validateCourse;
