// Enrollments now live in MongoDB and are reached through the secured API:
//   GET    /api/v1/enrollments/my-courses   (student)
//   POST   /api/v1/enrollments              (student)
//   DELETE /api/v1/enrollments/:courseId    (student)
//   PUT    /api/v1/progress                 (student)
//   GET    /api/v1/enrollments/all          (admin)
//   DELETE /api/v1/enrollments/all          (admin)
//
// The JWT is attached automatically by apiClient. The backend works out WHO
// the student is from the token, so the `student` arguments below are kept
// only so the existing pages don't need to change.
//
// Every record is converted to the same shape the pages already use
// (courseName, studentName, rollNo, status "In Progress"/"Completed", ...).

import apiClient from "../api/apiClient";
import { addCertificate, getCertificateById, restoreCertificate } from "./certificatesStore";
import { addCourseCompletedNotification } from "./notificationsStore";

function idOf(value) {
    if (!value) return "";
    if (typeof value === "string") return value;
    return value.id || value._id || "";
}

function countLessons(course) {
    const topics = (course?.topics || "").split(",").map((t) => t.trim()).filter(Boolean);
    return Math.max(1, topics.length);
}

/**
 * The logged-in student's name + email. The backend's my-courses list does not
 * include them (the JWT identifies the student), so read them from the saved
 * login, and fall back to GET /profile.
 */
async function getCurrentStudent(student) {
    let name = student?.fullName || student?.name || student?.username || "";
    let email = student?.email || "";

    if (!name || !email) {
        try {
            const saved = JSON.parse(localStorage.getItem("loggedInStudent") || "null");
            name = name || saved?.fullName || saved?.name || saved?.username || "";
            email = email || saved?.email || "";
        } catch {
            /* ignore a broken saved value */
        }
    }

    if (!name || !email) {
        const res = await apiClient.get("/profile");
        name = name || res.data.user.name || "";
        email = email || res.data.user.email || "";
    }

    return { name, email };
}

/** Backend enrollment -> the shape the React pages expect. */
function toEntry(e) {
    const course = typeof e.course === "object" ? e.course : null;
    const student = typeof e.student === "object" ? e.student : null;
    return {
        id: e._id,
        courseId: idOf(e.course),
        courseName: course?.title || "",
        totalLessons: countLessons(course),
        studentName: student?.name || "",
        email: student?.email || "",
        rollNo: e.rollNo || "",
        status: e.status === "completed" ? "Completed" : "In Progress",
        date: new Date(e.enrolledAt).toLocaleDateString(),
        completedAt: e.updatedAt,
        certificateId: e.certificateId || "",
    };
}

/** Every enrollment (admin view). */
export async function getAllEnrollments() {
    const res = await apiClient.get("/enrollments/all");
    return res.data.enrollments.filter((e) => e.course && e.student).map(toEntry);
}

/** The logged-in student's enrollments (GET /enrollments/my-courses). */
export async function getEnrollmentsForStudent(student) {
    const res = await apiClient.get("/enrollments/my-courses");
    const me = await getCurrentStudent(student);

    // Fill in the student's own name/email so certificates show the right name.
    return res.data.enrollments.map((e) => {
        const entry = { ...toEntry(e), studentName: me.name, email: me.email };

        // Completed in another browser? Rebuild the certificate here so the link works.
        if (entry.status === "Completed" && entry.certificateId) {
            restoreCertificate({
                id: entry.certificateId,
                courseId: entry.courseId,
                courseName: entry.courseName,
                studentName: entry.studentName,
                rollNo: entry.rollNo,
                email: entry.email,
                issuedAt: entry.completedAt,
            });
        }

        return entry;
    });
}

/** The logged-in student's enrollment for one course, or null. */
export async function findEnrollment(courseId, courseTitle, student) {
    const list = await getEnrollmentsForStudent(student);
    return list.find((entry) => entry.courseId === courseId) || null;
}

/** Enrol in a course (POST /enrollments) and return it in page shape. */
export async function addEnrollment({ courseId, courseName, studentName, rollNo, email }) {
    const res = await apiClient.post("/enrollments", { courseId, rollNo });
    return {
        ...toEntry(res.data.enrollment),
        courseId,
        courseName,
        studentName,
        email,
        rollNo,
    };
}

/** Leave a course (DELETE /enrollments/:courseId). */
export async function unenrollCourse(courseId) {
    await apiClient.delete(`/enrollments/${courseId}`);
}

/**
 * Marks a course complete by saving 100% progress (PUT /progress).
 * The backend then flips the enrollment to "completed".
 * A certificate and notification are created as before.
 */
export async function markEnrollmentComplete(target) {
    if (!target?.courseId) return null;

    // Never create a certificate with an empty name.
    if (!target.studentName || !target.email) {
        const me = await getCurrentStudent();
        target = { ...target, studentName: target.studentName || me.name, email: target.email || me.email };
    }

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

    const total = target.totalLessons || 1;
    const res = await apiClient.put("/progress", {
        courseId: target.courseId,
        completedLessons: total,
        totalLessons: total,
        certificateId: certRecord.id,
    });

    addCourseCompletedNotification({
        courseName: target.courseName,
        email: target.email,
        certId: certRecord.id,
    });

    return {
        ...target,
        status: res.data.enrollment.status === "completed" ? "Completed" : "In Progress",
        certificateId: res.data.enrollment.certificateId || certRecord.id,
    };
}

/** Admin "clear all" (DELETE /enrollments/all). */
export async function clearAllEnrollments() {
    await apiClient.delete("/enrollments/all");
}