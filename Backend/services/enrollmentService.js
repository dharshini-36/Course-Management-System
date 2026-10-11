const { readDB, writeDB, makeId } = require("../utils/db");

const getAllEnrollments = () => readDB().enrollments;

const createEnrollment = (data) => {
    const db = readDB();
    const enrollment = { ...data, id: data.id || makeId() };
    db.enrollments.push(enrollment);
    writeDB(db);
    return enrollment;
};

const updateEnrollment = (id, data) => {
    const db = readDB();
    const index = db.enrollments.findIndex(e => e.id === id);
    if (index === -1) return null;
    db.enrollments[index] = { ...db.enrollments[index], ...data, id };
    writeDB(db);
    return db.enrollments[index];
};

const deleteEnrollment = (id) => {
    const db = readDB();
    const index = db.enrollments.findIndex(e => e.id === id);
    if (index === -1) return false;
    db.enrollments.splice(index, 1);
    writeDB(db);
    return true;
};

module.exports = { getAllEnrollments, createEnrollment, updateEnrollment, deleteEnrollment };
