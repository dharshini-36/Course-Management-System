const { getAllStudents, createStudent } = require("../services/studentService");

const getStudents = (req, res) => {
    const students = getAllStudents();
    res.status(200).json({ success: true, count: students.length, data: students });
};

const addStudent = (req, res) => {
    const student = createStudent(req.body);
    res.status(201).json({ success: true, message: "Student created successfully", data: student });
};

module.exports = { getStudents, addStudent };
