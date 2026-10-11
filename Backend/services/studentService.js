const { readDB, writeDB, makeId } = require("../utils/db");

const getAllStudents = () => readDB().students;

const createStudent = (data) => {
    const db = readDB();
    const student = { ...data, id: data.id || makeId() };
    db.students.push(student);
    writeDB(db);
    return student;
};

module.exports = { getAllStudents, createStudent };
