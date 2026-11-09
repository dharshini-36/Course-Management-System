import { Fragment } from "react";

// Renders lesson text safely (no raw HTML). Supported:
//   # Heading, ## Subheading, - bullet / * bullet, 1. numbered,
//   **bold**, `inline code`, ``` fenced code blocks, blank line = new paragraph.

function inline(text) {
    return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**") && part.length > 4) return <strong key={i}>{part.slice(2, -2)}</strong>;
        if (part.startsWith("`") && part.endsWith("`") && part.length > 2) return <code key={i}>{part.slice(1, -1)}</code>;
        return <Fragment key={i}>{part}</Fragment>;
    });
}

function parse(text) {
    const lines = (text || "").replace(/\r\n/g, "\n").split("\n");
    const blocks = [];
    let i = 0;
    while (i < lines.length) {
        const line = lines[i];
        if (!line.trim()) { i++; continue; }

        if (line.trim().startsWith("```")) {
            const code = [];
            i++;
            while (i < lines.length && !lines[i].trim().startsWith("```")) code.push(lines[i++]);
            i++;
            blocks.push({ type: "code", text: code.join("\n") });
        } else if (/^##\s+/.test(line)) {
            blocks.push({ type: "h3", text: line.replace(/^##\s+/, "") }); i++;
        } else if (/^#\s+/.test(line)) {
            blocks.push({ type: "h2", text: line.replace(/^#\s+/, "") }); i++;
        } else if (/^\s*[-*]\s+/.test(line)) {
            const items = [];
            while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) items.push(lines[i++].replace(/^\s*[-*]\s+/, ""));
            blocks.push({ type: "ul", items });
        } else if (/^\s*\d+[.)]\s+/.test(line)) {
            const items = [];
            while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) items.push(lines[i++].replace(/^\s*\d+[.)]\s+/, ""));
            blocks.push({ type: "ol", items });
        } else {
            const para = [];
            while (i < lines.length && lines[i].trim() && !/^(#{1,2}\s|\s*[-*]\s|\s*\d+[.)]\s|```)/.test(lines[i])) para.push(lines[i++]);
            blocks.push({ type: "p", text: para.join(" ") });
        }
    }
    return blocks;
}

export default function LessonContent({ text }) {
    const blocks = parse(text);
    if (blocks.length === 0) return <p className="lesson-empty">No content has been added to this lesson yet.</p>;
    return (
        <div className="lesson-body">
            {blocks.map((b, i) => {
                switch (b.type) {
                    case "h2": return <h2 key={i}>{inline(b.text)}</h2>;
                    case "h3": return <h3 key={i}>{inline(b.text)}</h3>;
                    case "ul": return <ul key={i}>{b.items.map((t, j) => <li key={j}>{inline(t)}</li>)}</ul>;
                    case "ol": return <ol key={i}>{b.items.map((t, j) => <li key={j}>{inline(t)}</li>)}</ol>;
                    case "code": return <pre key={i}><code>{b.text}</code></pre>;
                    default: return <p key={i}>{inline(b.text)}</p>;
                }
            })}
        </div>
    );
}