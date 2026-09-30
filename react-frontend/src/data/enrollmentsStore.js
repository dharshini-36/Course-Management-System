// Enrollment records, now stored in the mock API (db.json -> /enrollments)
// instead of localStorage. Every function that talks to the API is async,
// so callers must `await` them.
//
// Certificates and notifications still use localStorage (unchanged).

import api from "../services/api";
import { addCertificate, getCertificateById } from "./certificatesStore";
import { addCourseCompletedNotification } from "./notificationsStore";

function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
}

function isSameStudent(entry, student) {
    const email = normalize(student?.email);
    const name = normalize(student?.fullName || student?.username);
    if (email && entry.email) return normalize(entry.email) === email;
    return normalize(entry.studentName) === name;
}

function isSameCourse(entry, courseId, courseTitle) {
    if (entry.courseId && courseId) return entry.courseId === courseId;
    return normalize(entry.courseName) === normalize(courseTitle);
}

/** Every enrollment (admin view). */
export async function getAllEnrollments() {
    const res = await api.get("/enrollments");
    return res.data;
}

/** Enrollments belonging to one student. */
export async function getEnrollmentsForStudent(student) {
    const all = await getAllEnrollments();
    return all.filter((entry) => isSameStudent(entry, student));
}

/** This student's enrollment for a course, or null. */
export async function findEnrollment(courseId, courseTitle, student) {
    const list = await getEnrollmentsForStudent(student);
    return list.find((entry) => isSameCourse(entry, courseId, courseTitle)) || null;
}

/** Saves a new enrollment (POST /enrollments) and returns it. */
export async function addEnrollment({ courseId, courseName, studentName, rollNo, email }) {
    const entry = {
        courseId,
        courseName,
        studentName,
        rollNo,
        email: email || "student@learnhub.com",
        status: "In Progress",
        date: new Date().toLocaleDateString(),
    };
    const res = await api.post("/enrollments", entry);
    return res.data;
}

/**
 * Marks an enrollment complete (PATCH /enrollments/:id), creating a
 * certificate and a "course completed" notification.
 */
export async function markEnrollmentComplete(target) {
    if (!target?.id) return null;

    let certRecord = target.certificateId ? getCertificateById(target.certificateId) : null;
    if (!certRecord) {
        certRecord = addCertificate({
            courseId: target.courseId,
            courseName: target.courseName,
            studentName: target.studentName,
            rollNo: target.rollNo,
            email: target.email,
        });
    }

    const res = await api.patch(`/enrollments/${target.id}`, {
        status: "Completed",
        certificateId: certRecord.id,
    });

    addCourseCompletedNotification({
        courseName: target.courseName,
        email: target.email,
        certId: certRecord.id,
    });
    return res.data;
}

/** Deletes every enrollment record (admin "clear all"). */
export async function clearAllEnrollments() {
    const all = await getAllEnrollments();
    await Promise.all(all.map((entry) => api.delete(`/enrollments/${entry.id}`)));
}