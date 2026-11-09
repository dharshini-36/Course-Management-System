import PageShell from "../components/PageShell";
import { Link, useSearchParams } from "react-router-dom";
import PageCss from "../components/PageCss";
import { useCourses } from "../context/CourseContext";
import { getModules } from "../data/curriculum";
import "../styles/curriculum.css";

export default function CourseDetails() {
    const [searchParams] = useSearchParams();
    const courseId = searchParams.get("course") || searchParams.get("id");
    const { courses, loading } = useCourses();
    const course = courses.find((c) => c.id === courseId) || null;

    if (loading) {
        return (
            <PageShell variant="student3">
                <PageCss href="/css/course_details.css" />
                <div className="db-empty-state" style={{ margin: "60px auto" }}>
                    <h3>Loading course...</h3>
                </div>
            </PageShell>
        );
    }

    if (!course) {
        return (
            <PageShell variant="student3">
                <PageCss href="/css/course_details.css" />
                <div className="db-empty-state" style={{ margin: "60px auto" }}>
                    <div className="db-empty-icon">
                        <i className="fa-solid fa-circle-question"></i>
                    </div>
                    <h3>Course not found</h3>
                    <p>We couldn't find that course. It may have been removed by an admin.</p>
                    <Link to="/courses" className="db-empty-btn">Browse Courses</Link>
                </div>
            </PageShell>
        );
    }

    const topics = (course.topics || "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
    const modules = getModules(course);

    return (
        <PageShell variant="student3">
            <PageCss href="/css/course_details.css" />
            <section className="course-page-hero">
                <Link to="/courses" className="course-back-link">
                    <i className="fa-solid fa-arrow-left"></i>
                    Back to Courses
                </Link>
                <span className="course-page-category">{course.category}</span>
                <h1>{course.title}</h1>
                <p>{course.instructor} &middot; {course.weeks} Weeks &middot; {course.hours} Hours</p>
            </section>

            <div className="course-page-grid">
                <div className="course-page-content">
                    <div className="course-overview-text">{course.outcome}</div>

                    <h2 className="course-section-title">
                        <i className="fa-solid fa-list-ol"></i>
                        Course Content
                    </h2>
                    {modules.length === 0 ? (
                        <p style={{ color: "var(--text-muted)" }}>No modules listed for this course yet.</p>
                    ) : (
                        <div className="unit-accordion">
                            {modules.map((m, i) => (
                                <details className="c-details" key={m.id} open={i === 0} style={{ marginBottom: "10px" }}>
                                    <summary className="view-details-btn">
                                        <i className="fa-solid fa-chevron-down"></i>
                                        Module {i + 1}: {m.title}
                                    </summary>
                                    <div className="c-details-body">
                                        {m.description && <p>{m.description}</p>}
                                        <ul className="syl-lessons">
                                            {m.lessons.map((l) => (
                                                <li key={l.id}>
                                                    <i className="fa-regular fa-file-lines"></i>
                                                    {l.title}{l.duration ? ` · ${l.duration} min` : ""}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </details>
                            ))}
                        </div>
                    )}

                    <div className="video-complete-card" style={{ marginTop: "24px" }}>
                        <div className="video-complete-left">
                            <i className="fa-solid fa-graduation-cap"></i>
                            Ready to start learning?
                        </div>
                        <Link to={`/learn?course=${course.id}`} className="db-complete-btn">
                            <i className="fa-solid fa-play"></i> Start Course
                        </Link>
                    </div>
                </div>

                <aside className="course-sidebar">
                    <div className="course-info-card">
                        <h3>
                            <i className="fa-solid fa-circle-info"></i>
                            Course Details
                        </h3>
                        <div className="course-info-row">
                            <i className="fa-regular fa-clock"></i>
                            Duration
                            <strong>{course.weeks} Weeks</strong>
                        </div>
                        <div className="course-info-row">
                            <i className="fa-solid fa-signal"></i>
                            Level
                            <strong>{course.level}</strong>
                        </div>
                        <div className="course-info-row">
                            <i className="fa-solid fa-tag"></i>
                            Category
                            <strong>{course.category}</strong>
                        </div>
                        <div className="course-info-row">
                            <i className="fa-solid fa-user"></i>
                            Instructor
                            <strong>{course.instructor}</strong>
                        </div>
                    </div>
                    {topics.length > 0 && (
                        <div className="course-info-card">
                            <h3>
                                <i className="fa-solid fa-graduation-cap"></i>
                                What You'll Learn
                            </h3>
                            <ul className="course-topics-list">
                                {topics.map((topic) => (
                                    <li key={topic}>{topic}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {course.prerequisites && (
                        <div className="course-info-card">
                            <h3>
                                <i className="fa-solid fa-circle-check"></i>
                                Prerequisites
                            </h3>
                            <p style={{ margin: 0 }}>{course.prerequisites}</p>
                        </div>
                    )}
                </aside>
            </div>
        </PageShell>
    );
}