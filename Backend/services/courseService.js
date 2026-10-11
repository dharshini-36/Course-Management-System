const courses = require("../data/courses");

// Get all courses
const getAllCourses = () => {
    return courses;
};

// Get one course
const getCourseById = (id) => {
    return courses.find(course => course.id === id);
};

// Create course
const createCourse = (courseData) => {
    const newCourse = {
        id: Date.now().toString(),
        ...courseData
    };
    courses.push(newCourse);
    return newCourse;
};

// Update course
const updateCourse = (id, courseData) => {
    const index = courses.findIndex(course => course.id === id);
    if (index === -1) {
        return null;
    }
    courses[index] = {
        ...courses[index],
        ...courseData,
        id
    };
    return courses[index];
};

// Delete course
const deleteCourse = (id) => {
    const index = courses.findIndex(course => course.id === id);
    if (index === -1) {
        return false;
    }
    courses.splice(index, 1);
    return true;
};

module.exports = {
    getAllCourses,
    getCourseById,
    createCourse,
    updateCourse,
    deleteCourse
};
