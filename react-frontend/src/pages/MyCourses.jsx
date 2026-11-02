import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageShell from "../components/PageShell";
import { getEnrollmentsForStudent, unenrollCourse } from "../data/enrollmentsStore";

// Student-only page: lists the logged-in student's enrolled courses
// (GET /api/v1/enrollments/my-courses) and lets them unenroll.
function MyCourses() {
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        getEnrollmentsForStudent()
            .then(setEnrollments)
            .catch((err) =>
                setError(err.response?.data?.message || "Could not load your courses. Please log in as a student.")
            )
            .finally(() => setLoading(false));
    }, []);

    async function handleUnenroll(entry) {
        if (!window.confirm(`Unenroll from "${entry.courseName}"?`)) return;
        try {
            await unenrollCourse(entry.courseId);
            setEnrollments((prev) => prev.filter((e) => e.courseId !== entry.courseId));
        } catch (err) {
            alert(err.response?.data?.message || "Could not unenroll. Please try again.");
        }
    }

    return (
        <PageShell variant="student3">
            <section className="features" style={{ maxWidth: 900, margin: "40px auto", padding: "0 16px" }}>
                <h2>My Enrolled Courses</h2>
                {loading && <p>Loading...</p>}
                {error && <p style={{ color: "#b91c1c" }}>{error}</p>}
                {!loading && !error && enrollments.length === 0 && (
                    <div className="db-empty-state" style={{ margin: "30px auto" }}>
                        <h3>No enrolled courses yet</h3>
                        <p>Enroll in a course to see it here.</p>
                        <Link to="/courses" className="db-empty-btn">Browse Courses</Link>
                    </div>
                )}
                {enrollments.map((entry) => (
                    <div className="db-course-item" key={entry.id}>
                        <div className="db-course-item-info">
                            <div className="db-course-item-name">{entry.courseName}</div>
                            <div className="db-course-item-meta">Enrolled {entry.date}</div>
                        </div>
                        <span className={`db-course-status ${entry.status === "Completed" ? "db-status--done" : "db-status--progress"}`}>
                            {entry.status}
                        </span>
                        <Link to={`/learn?course=${entry.courseId}`} className="db-complete-btn" style={{ marginLeft: 10 }}>
                            Open
                        </Link>
                        <button type="button" className="db-complete-btn" style={{ marginLeft: 10, background: "#dc2626" }} onClick={() => handleUnenroll(entry)}>
                            Unenroll
                        </button>
                    </div>
                ))}
            </section>
        </PageShell>
    );
}

export default MyCourses;
