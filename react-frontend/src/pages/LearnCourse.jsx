import { useEffect, useMemo, useState } from "react";
import PageShell from "../components/PageShell";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import PageCss from "../components/PageCss";
import { useAuth } from "../auth/AuthContext";
import { useCourses } from "../context/CourseContext";
import { findEnrollment, markEnrollmentComplete, saveLessonProgress } from "../data/enrollmentsStore";
import { flattenLessons, getModules, loadCompletedLessons, saveCompletedLessons } from "../data/curriculum";
import LessonContent from "../components/LessonContent";
import "../styles/curriculum.css";

export default function LearnCourse() {
    const { student } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const courseId = searchParams.get("course");

    // Course comes from the mock API (GET /courses) via CourseContext
    const { courses, loading: coursesLoading } = useCourses();
    const course = courses.find((c) => c.id === courseId) || null;

    // This student's enrollment for the course (GET /enrollments)
    const [enrollment, setEnrollment] = useState(null);
    const [enrollmentLoaded, setEnrollmentLoaded] = useState(false);

    useEffect(() => {
        if (coursesLoading) return;
        if (!course || !student) {
            setEnrollmentLoaded(true);
            return;
        }
        let cancelled = false;
        findEnrollment(course.id, course.title, student)
            .then((found) => {
                if (cancelled) return;
                setEnrollment(found);
                setEnrollmentLoaded(true);
            })
            .catch((err) => {
                console.error("Failed to load enrollment:", err);
                if (!cancelled) setEnrollmentLoaded(true);
            });
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [coursesLoading, course?.id, student?.email]);

    const isCompleted = enrollment?.status === "Completed";

    const modules = useMemo(() => getModules(course), [course]);
    const lessons = useMemo(() => flattenLessons(modules), [modules]);

    // Which lessons this student has finished (kept per student + course).
    const [savedIds, setSavedIds] = useState(null);
    const [activeId, setActiveId] = useState(null);
    const [finishing, setFinishing] = useState(false);
    const doneIds = savedIds ?? (course && student ? loadCompletedLessons(student.email, course.id) : []);

    // Only count lessons that still exist (an admin may have removed some).
    const validIds = new Set(lessons.map((l) => l.id));
    const completedSet = new Set(isCompleted ? lessons.map((l) => l.id) : doneIds.filter((id) => validIds.has(id)));
    const completedCount = completedSet.size;
    const total = lessons.length;
    const percent = total ? Math.round((completedCount / total) * 100) : 0;
    const allDone = total > 0 && completedCount === total;

    const activeLesson = lessons.find((l) => l.id === activeId) || lessons.find((l) => !completedSet.has(l.id)) || lessons[0] || null;
    const activeIndex = activeLesson ? lessons.findIndex((l) => l.id === activeLesson.id) : -1;

    function persist(nextIds) {
        setSavedIds(nextIds);
        saveCompletedLessons(student.email, course.id, nextIds);
        if (!isCompleted) {
            saveLessonProgress({
                courseId: course.id,
                completed: nextIds.filter((id) => validIds.has(id)).length,
                total: Math.max(1, total),
            }).catch((err) => console.error("Could not sync progress:", err));
        }
    }

    function toggleLesson(lesson, goNext) {
        if (isCompleted) {
            if (goNext && lessons[activeIndex + 1]) setActiveId(lessons[activeIndex + 1].id);
            return;
        }
        const already = completedSet.has(lesson.id);
        const nextIds = already && !goNext
            ? doneIds.filter((id) => id !== lesson.id)
            : Array.from(new Set([...doneIds, lesson.id]));
        persist(nextIds);
        if (goNext && lessons[activeIndex + 1]) setActiveId(lessons[activeIndex + 1].id);
    }

    async function handleFinish() {
        if (!enrollment || !allDone || finishing) return;
        setFinishing(true);
        try {
            const updated = await markEnrollmentComplete({ ...enrollment, totalLessons: Math.max(1, total) });
            if (!updated) return;
            setEnrollment(updated);
            if (updated.certificateId) navigate(`/certificate?id=${updated.certificateId}`);
        } catch (err) {
            console.error("Failed to complete course:", err);
            alert("Could not save your progress. Please check your connection and try again.");
        } finally {
            setFinishing(false);
        }
    }

    // ----- Guard states -----
    if (coursesLoading || !enrollmentLoaded) {
        return (
            <PageShell variant="student3">
                <PageCss href="/css/course_details.css" />
                <div className="db-empty-state" style={{ margin: "60px auto" }}>
                    <h3>Loading...</h3>
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

    if (!student) {
        return (
            <PageShell variant="student3">
                <PageCss href="/css/course_details.css" />
                <div className="db-empty-state" style={{ margin: "60px auto" }}>
                    <div className="db-empty-icon">
                        <i className="fa-solid fa-lock"></i>
                    </div>
                    <h3>Please log in to continue</h3>
                    <p>Log in as a student to access "{course.title}".</p>
                    <Link to="/login" className="db-empty-btn">Log In</Link>
                </div>
            </PageShell>
        );
    }

    if (!enrollment) {
        return (
            <PageShell variant="student3">
                <PageCss href="/css/course_details.css" />
                <div className="db-empty-state" style={{ margin: "60px auto" }}>
                    <div className="db-empty-icon">
                        <i className="fa-solid fa-graduation-cap"></i>
                    </div>
                    <h3>You're not enrolled in this course yet</h3>
                    <p>Enroll in "{course.title}" from the Courses page to start learning.</p>
                    <Link to="/courses" className="db-empty-btn">Go to Courses</Link>
                </div>
            </PageShell>
        );
    }

    // ----- Main learning view -----
    return (
        <PageShell variant="student3">
            <PageCss href="/css/course_details.css" />
            <section className="course-page-hero">
                <Link to="/dashboard" className="course-back-link">
                    <i className="fa-solid fa-arrow-left"></i>
                    Back to Dashboard
                </Link>
                <span className="course-page-category">{course.category}</span>
                <h1>{course.title}</h1>
                <p>{course.instructor} &middot; {course.weeks} Weeks &middot; {course.hours} Hours</p>
            </section>

            <div className="lp-wrap">
                <div className="lp-progress">
                    <div className="lp-progress-top">
                        <span>{isCompleted ? "Course completed" : "Your progress"}</span>
                        <span>{completedCount} of {total} lessons · {percent}%</span>
                    </div>
                    <div className="lp-bar"><div style={{ width: `${percent}%` }} /></div>
                </div>

                {lessons.length === 0 ? (
                    <div className="lp-main">
                        <p className="lesson-empty">No lessons have been added to this course yet. Please check back soon.</p>
                    </div>
                ) : (
                    <div className="lp-grid">
                        <aside className="lp-side" aria-label="Course modules">
                            {modules.map((m, mi) => {
                                const done = m.lessons.filter((l) => completedSet.has(l.id)).length;
                                return (
                                    <div className="lp-mod" key={m.id}>
                                        <div className="lp-mod-title">
                                            <span>Module {mi + 1}: {m.title}</span>
                                            <small>{done}/{m.lessons.length}</small>
                                        </div>
                                        {m.lessons.map((l) => (
                                            <button
                                                type="button"
                                                key={l.id}
                                                className={`lp-lesson${l.id === activeLesson.id ? " active" : ""}${completedSet.has(l.id) ? " done" : ""}`}
                                                onClick={() => setActiveId(l.id)}
                                            >
                                                <i className={completedSet.has(l.id) ? "fa-solid fa-circle-check" : "fa-regular fa-circle"}></i>
                                                <span>{l.title}</span>
                                            </button>
                                        ))}
                                    </div>
                                );
                            })}
                        </aside>

                        <article className="lp-main">
                            <div className="lp-crumb">Module {activeLesson.moduleIndex + 1}: {activeLesson.moduleTitle}</div>
                            <h1>{activeLesson.title}</h1>
                            <div className="lp-meta">
                                Lesson {activeIndex + 1} of {total}
                                {activeLesson.duration ? ` · ${activeLesson.duration} min` : ""}
                            </div>

                            <LessonContent text={activeLesson.content} />

                            <div className="lp-nav">
                                <button type="button" className="lp-btn" disabled={activeIndex <= 0} onClick={() => setActiveId(lessons[activeIndex - 1].id)}>
                                    <i className="fa-solid fa-arrow-left"></i> Previous
                                </button>
                                {isCompleted ? (
                                    <button type="button" className="lp-btn" disabled={activeIndex >= total - 1} onClick={() => toggleLesson(activeLesson, true)}>
                                        Next <i className="fa-solid fa-arrow-right"></i>
                                    </button>
                                ) : (
                                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                                        {completedSet.has(activeLesson.id) && (
                                            <button type="button" className="lp-btn lp-btn-done" onClick={() => toggleLesson(activeLesson, false)} title="Click to undo">
                                                <i className="fa-solid fa-check"></i> Completed
                                            </button>
                                        )}
                                        <button type="button" className="lp-btn lp-btn-primary" onClick={() => toggleLesson(activeLesson, true)}>
                                            {activeIndex < total - 1
                                                ? <>{completedSet.has(activeLesson.id) ? "Next" : "Mark complete & next"} <i className="fa-solid fa-arrow-right"></i></>
                                                : <><i className="fa-solid fa-check"></i> {completedSet.has(activeLesson.id) ? "Done" : "Mark complete"}</>}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </article>
                    </div>
                )}

                <div className={`lp-finish${isCompleted ? " complete" : allDone ? " ready" : ""}`}>
                    <div>
                        <i className={isCompleted ? "fa-solid fa-circle-check" : "fa-solid fa-flag-checkered"}></i>{" "}
                        {isCompleted
                            ? "You've completed this course. Great work!"
                            : allDone
                                ? "All lessons complete — claim your certificate."
                                : `Complete all ${total} lessons to finish the course (${total - completedCount} left).`}
                    </div>
                    {isCompleted ? (
                        <Link to={enrollment.certificateId ? `/certificate?id=${enrollment.certificateId}` : "/certificate"} className="db-complete-btn">
                            <i className="fa-solid fa-certificate"></i> View Certificate
                        </Link>
                    ) : (
                        <button type="button" className="db-complete-btn" disabled={!allDone || finishing} onClick={handleFinish} style={!allDone ? { opacity: 0.5, cursor: "not-allowed" } : undefined}>
                            <i className="fa-solid fa-check"></i> {finishing ? "Saving..." : "Finish Course"}
                        </button>
                    )}
                </div>

            </div>
        </PageShell>
    );
}