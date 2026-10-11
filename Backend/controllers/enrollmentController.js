const {
    getAllEnrollments,
    createEnrollment,
    updateEnrollment,
    deleteEnrollment
} = require("../services/enrollmentService");

const getEnrollments = (req, res) => {
    const enrollments = getAllEnrollments();
    res.status(200).json({ success: true, count: enrollments.length, data: enrollments });
};

const addEnrollment = (req, res) => {
    const enrollment = createEnrollment(req.body);
    res.status(201).json({ success: true, message: "Enrollment created successfully", data: enrollment });
};

const editEnrollment = (req, res) => {
    const enrollment = updateEnrollment(req.params.id, req.body);
    if (!enrollment) {
        return res.status(404).json({ success: false, message: "Enrollment not found" });
    }
    res.status(200).json({ success: true, message: "Enrollment updated successfully", data: enrollment });
};

const removeEnrollment = (req, res) => {
    if (!deleteEnrollment(req.params.id)) {
        return res.status(404).json({ success: false, message: "Enrollment not found" });
    }
    res.status(200).json({ success: true, message: "Enrollment deleted successfully" });
};

module.exports = { getEnrollments, addEnrollment, editEnrollment, removeEnrollment };
