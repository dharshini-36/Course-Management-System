const mongoose = require("mongoose");
const Course = require("../models/Course");

const isValidId = (id) => mongoose.isValidObjectId(id);

// Only these fields can ever be written from a request body.
const EDITABLE_FIELDS = [
    "title", "category", "instructor", "level",
    "weeks", "hours", "rating", "topics", "outcome"
];

function pickFields(data = {}) {
    const clean = {};
    for (const field of EDITABLE_FIELDS) {
        if (data[field] !== undefined) clean[field] = data[field];
    }
    return clean;
}

// .lean() returns plain objects (faster) - add the "id" the React app reads.
const withId = (course) => {
    const { _id, __v, ...rest } = course;
    return { ...rest, id: String(_id) };
};

// Without ?page the full list is returned (the React app needs every course).
// With ?page=2&limit=10 the list is paginated (limit is capped at 100).
const getAllCourses = async ({ page, limit } = {}) => {
    const query = Course.find().sort({ createdAt: 1 });

    if (page !== undefined) {
        const safePage = Math.max(1, Number.parseInt(page, 10) || 1);
        const safeLimit = Math.min(100, Math.max(1, Number.parseInt(limit, 10) || 20));
        query.skip((safePage - 1) * safeLimit).limit(safeLimit);
    }

    const [courses, total] = await Promise.all([
        query.lean(),
        Course.countDocuments()
    ]);

    return { courses: courses.map(withId), total };
};

const getCourseById = async (id) => {
    if (!isValidId(id)) return null;
    const course = await Course.findById(id).lean();
    return course ? withId(course) : null;
};

const createCourse = (courseData) => Course.create(pickFields(courseData));

const updateCourse = async (id, courseData) => {
    if (!isValidId(id)) return null;
    return Course.findByIdAndUpdate(id, { $set: pickFields(courseData) }, {
        returnDocument: "after",
        runValidators: true
    });
};

const deleteCourse = async (id) => {
    if (!isValidId(id)) return false;
    const deleted = await Course.findByIdAndDelete(id);
    return Boolean(deleted);
};

module.exports = { getAllCourses, getCourseById, createCourse, updateCourse, deleteCourse };