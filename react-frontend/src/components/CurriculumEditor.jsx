import "../styles/curriculum.css";
import { emptyLesson, emptyModule, newId, splitTopics } from "../data/curriculum";

// Admin editor for a course's modules and lessons. Fully controlled:
//   <CurriculumEditor modules={modules} onChange={setModules} topics={form.topics} />
// Used by both Add Course and Edit Course so a brand-new course gets the same
// content structure as an existing one.

function move(list, from, to) {
    if (to < 0 || to >= list.length) return list;
    const next = [...list];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    return next;
}

export default function CurriculumEditor({ modules, onChange, topics }) {
    const updateModule = (mi, patch) => onChange(modules.map((m, i) => (i === mi ? { ...m, ...patch } : m)));
    const updateLesson = (mi, li, patch) =>
        updateModule(mi, { lessons: modules[mi].lessons.map((l, i) => (i === li ? { ...l, ...patch } : l)) });

    function removeModule(mi) {
        const m = modules[mi];
        const hasContent = m.lessons.some((l) => l.title.trim() || l.content.trim());
        if (hasContent && !window.confirm(`Delete "${m.title || "this module"}" and its ${m.lessons.length} lesson(s)?`)) return;
        onChange(modules.filter((_, i) => i !== mi));
    }

    function removeLesson(mi, li) {
        const l = modules[mi].lessons[li];
        if ((l.title.trim() || l.content.trim()) && !window.confirm(`Delete lesson "${l.title || "Untitled"}"?`)) return;
        updateModule(mi, { lessons: modules[mi].lessons.filter((_, i) => i !== li) });
    }

    function generateFromTopics() {
        const existing = new Set(modules.map((m) => m.title.trim().toLowerCase()));
        const fresh = splitTopics(topics)
            .filter((t) => !existing.has(t.toLowerCase()))
            .map((t) => ({ id: newId("m"), title: t, description: "", lessons: [{ ...emptyLesson(), title: t }] }));
        if (fresh.length === 0) return;
        // Drop a still-blank starter module so it doesn't sit above the generated ones.
        const kept = modules.filter((m) => m.title.trim() || m.lessons.some((l) => l.title.trim() || l.content.trim()));
        onChange([...kept, ...fresh]);
    }

    const lessonCount = modules.reduce((n, m) => n + m.lessons.length, 0);
    const canGenerate = splitTopics(topics).length > 0;

    return (
        <div className="cur-editor">
            <div className="cur-toolbar">
                <span className="cur-count">{modules.length} module{modules.length === 1 ? "" : "s"} · {lessonCount} lesson{lessonCount === 1 ? "" : "s"}</span>
                {canGenerate && (
                    <button type="button" className="cur-btn cur-btn-ghost" onClick={generateFromTopics}>
                        <i className="fa-solid fa-wand-magic-sparkles"></i> Create modules from topics
                    </button>
                )}
            </div>

            {modules.length === 0 && (
                <p className="cur-empty">No modules yet. Add one below — students will complete every lesson in it before they can finish the course.</p>
            )}

            {modules.map((m, mi) => (
                <div className="cur-module" key={m.id}>
                    <div className="cur-module-head">
                        <span className="cur-badge">Module {mi + 1}</span>
                        <input
                            type="text"
                            className="cur-input cur-grow"
                            placeholder="Module / unit title, e.g. Search Algorithms"
                            value={m.title}
                            onChange={(e) => updateModule(mi, { title: e.target.value })}
                        />
                        <div className="cur-actions">
                            <button type="button" className="cur-icon" title="Move up" disabled={mi === 0} onClick={() => onChange(move(modules, mi, mi - 1))}><i className="fa-solid fa-arrow-up"></i></button>
                            <button type="button" className="cur-icon" title="Move down" disabled={mi === modules.length - 1} onClick={() => onChange(move(modules, mi, mi + 1))}><i className="fa-solid fa-arrow-down"></i></button>
                            <button type="button" className="cur-icon cur-danger" title="Delete module" onClick={() => removeModule(mi)}><i className="fa-solid fa-trash"></i></button>
                        </div>
                    </div>
                    <input
                        type="text"
                        className="cur-input"
                        placeholder="Short module description (optional)"
                        value={m.description}
                        onChange={(e) => updateModule(mi, { description: e.target.value })}
                    />

                    {m.lessons.map((l, li) => (
                        <div className="cur-lesson" key={l.id}>
                            <div className="cur-lesson-head">
                                <span className="cur-lesson-num">{mi + 1}.{li + 1}</span>
                                <input
                                    type="text"
                                    className="cur-input cur-grow"
                                    placeholder="Lesson title"
                                    value={l.title}
                                    onChange={(e) => updateLesson(mi, li, { title: e.target.value })}
                                />
                                <input
                                    type="number"
                                    min="0"
                                    className="cur-input cur-mins"
                                    placeholder="Min"
                                    title="Estimated minutes"
                                    value={l.duration}
                                    onChange={(e) => updateLesson(mi, li, { duration: e.target.value })}
                                />
                                <div className="cur-actions">
                                    <button type="button" className="cur-icon" title="Move up" disabled={li === 0} onClick={() => updateModule(mi, { lessons: move(m.lessons, li, li - 1) })}><i className="fa-solid fa-arrow-up"></i></button>
                                    <button type="button" className="cur-icon" title="Move down" disabled={li === m.lessons.length - 1} onClick={() => updateModule(mi, { lessons: move(m.lessons, li, li + 1) })}><i className="fa-solid fa-arrow-down"></i></button>
                                    <button type="button" className="cur-icon cur-danger" title="Delete lesson" onClick={() => removeLesson(mi, li)}><i className="fa-solid fa-xmark"></i></button>
                                </div>
                            </div>
                            <textarea
                                className="cur-input cur-text"
                                rows="7"
                                placeholder={"Lesson text. Tips: '## Heading', '- bullet', '**bold**', blank line for a new paragraph, ``` for code."}
                                value={l.content}
                                onChange={(e) => updateLesson(mi, li, { content: e.target.value })}
                            />
                        </div>
                    ))}

                    <button type="button" className="cur-btn cur-btn-ghost" onClick={() => updateModule(mi, { lessons: [...m.lessons, emptyLesson()] })}>
                        <i className="fa-solid fa-plus"></i> Add lesson
                    </button>
                </div>
            ))}

            <button type="button" className="cur-btn cur-btn-primary" onClick={() => onChange([...modules, emptyModule()])}>
                <i className="fa-solid fa-layer-group"></i> Add module
            </button>
        </div>
    );
}