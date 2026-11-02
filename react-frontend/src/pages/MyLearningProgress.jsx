import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageShell from "../components/PageShell";
import apiClient from "../api/apiClient";

// Student-only page: GET /api/v1/progress/my-progress
function MyLearningProgress() {
    const [progress, setProgress] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        apiClient
            .get("/progress/my-progress")
            .then((res) => setProgress(res.data.progress))
            .catch((err) =>
                setError(err.response?.data?.message || "Could not load progress. Please log in as a student.")
            )
            .finally(() => setLoading(false));
    }, []);

    const completedCount = progress.filter((p) => p.progressPercentage === 100).length;
    const average = progress.length
        ? Math.round(progress.reduce((sum, p) => sum + p.progressPercentage, 0) / progress.length)
        : 0;

    return (
        <PageShell variant="student3">
            <section className="progress-page">
                <h2>My Learning Progress</h2>
                {loading && <p>Loading...</p>}
                {error && <p style={{ color: "#b91c1c" }}>{error}</p>}

                {!loading && !error && (
                    <>
                        <div className="summary-cards">
                            <div className="summary-card"><h3>{progress.length}</h3><p>Courses Tracked</p></div>
                            <div className="summary-card"><h3>{completedCount}</h3><p>Completed</p></div>
                            <div className="summary-card"><h3>{average}%</h3><p>Average Progress</p></div>
                        </div>

                        {progress.length === 0 && (
                            <p>
                                No progress yet. Open a course from <Link to="/my-courses">My Courses</Link> and
                                mark lessons as done.
                            </p>
                        )}

                        {progress.map((item) => (
                            <div className="progress-item" key={item._id}>
                                <div className="progress-item-head">
                                    <strong>{item.course.title}</strong>
                                    <span>
                                        {item.progressPercentage === 100 ? "Completed" : "In Progress"} ·{" "}
                                        {item.completedLessons}/{item.totalLessons} lessons
                                    </span>
                                </div>
                                <div className="progress-bar">
                                    <div className="progress-bar-fill" style={{ width: `${item.progressPercentage}%` }} />
                                </div>
                                <small>
                                    {item.progressPercentage}% · last accessed {new Date(item.lastAccessedAt).toLocaleString()}
                                </small>
                            </div>
                        ))}
                    </>
                )}
            </section>
        </PageShell>
    );
}

export default MyLearningProgress;
