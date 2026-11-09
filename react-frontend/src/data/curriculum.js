// Course curriculum model: a course has MODULES (units), each with LESSONS.
//
//   course.modules = [
//     { id, title, description, lessons: [ { id, title, duration, content } ] }
//   ]
//
// `content` is the lesson text the admin types. It supports a light markup
// (see components/LessonContent.jsx): "# / ## headings", "- bullets",
// "**bold**" and ``` code blocks.
//
// Courses created before modules existed only have a comma-separated
// `topics` string. getModules() turns those topics into modules on the fly
// (one starter lesson each) so EVERY course always has a structure that
// students can complete and admins can start filling in. Ids of these
// generated modules are stable, so a student's progress survives the day an
// admin saves real content over them.

export function newId(prefix) {
    return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

export function emptyLesson() {
    return { id: newId("l"), title: "", duration: "", content: "" };
}

export function emptyModule() {
    return { id: newId("m"), title: "", description: "", lessons: [emptyLesson()] };
}

export function splitTopics(topics) {
    return (topics || "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
}

function starterText(topic, course) {
    const parts = [`## ${topic}`, `This unit covers ${topic} as part of "${course?.title || "this course"}".`];
    if (course?.outcome) parts.push(`**Goal of the course:** ${course.outcome}`);
    parts.push("Your instructor has not added detailed notes for this unit yet. Read the topic overview above, then mark the lesson complete to continue.");
    return parts.join("\n\n");
}

export function modulesFromTopics(course) {
    return splitTopics(course?.topics).map((topic, i) => ({
        id: `topic-${i}`,
        title: topic,
        description: "",
        lessons: [{ id: `topic-${i}-l1`, title: topic, duration: "", content: starterText(topic, course) }],
    }));
}

/** The modules students see / admins edit: saved ones, else generated from topics. */
export function getModules(course) {
    if (Array.isArray(course?.modules) && course.modules.length > 0) return course.modules;
    return modulesFromTopics(course);
}

export function flattenLessons(modules) {
    const out = [];
    modules.forEach((m, mi) => {
        (m.lessons || []).forEach((l, li) => out.push({ ...l, moduleId: m.id, moduleTitle: m.title, moduleIndex: mi, lessonIndex: li }));
    });
    return out;
}

/** Total lessons in a course (never 0 — the backend needs a positive total). */
export function countLessons(course) {
    return Math.max(1, flattenLessons(getModules(course)).length);
}

/** Tidies what the admin typed before it is saved: trims, drops blank rows, fills default titles. */
export function cleanModules(modules) {
    const out = [];
    (modules || []).forEach((m) => {
        const lessons = [];
        (m.lessons || []).forEach((l) => {
            const title = (l.title || "").trim();
            const content = (l.content || "").replace(/\s+$/, "");
            if (!title && !content.trim()) return;
            lessons.push({
                id: l.id || newId("l"),
                title: title || `Lesson ${lessons.length + 1}`,
                duration: String(l.duration ?? "").trim(),
                content,
            });
        });
        const title = (m.title || "").trim();
        if (!title && lessons.length === 0) return;
        out.push({
            id: m.id || newId("m"),
            title: title || `Module ${out.length + 1}`,
            description: (m.description || "").trim(),
            lessons,
        });
    });
    return out;
}

// ---------- Student lesson progress ----------
// The backend only stores a "completed lessons" COUNT, so the list of which
// lessons were finished is kept here, per student + course.

function progressKey(email, courseId) {
    return `lessonProgress:${(email || "guest").toLowerCase()}:${courseId}`;
}

export function loadCompletedLessons(email, courseId) {
    try {
        const raw = JSON.parse(localStorage.getItem(progressKey(email, courseId)) || "[]");
        return Array.isArray(raw) ? raw : [];
    } catch {
        return [];
    }
}

export function saveCompletedLessons(email, courseId, ids) {
    try {
        localStorage.setItem(progressKey(email, courseId), JSON.stringify(ids));
    } catch {
        /* storage full or blocked — progress just won't persist locally */
    }
}