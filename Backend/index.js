const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const DB_PATH = path.join(__dirname, "data", "db.json");

function readDB() {
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(raw);
}

function writeDB(db) {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
}

function makeId() {
    return Math.random().toString(36).slice(2, 10);
}

// Sends JSON already indented, so it looks formatted in the browser
// even without ticking "Pretty-print" (matches how json-server looked).
function sendJSON(res, data, status = 200) {
    res.status(status).type("application/json").send(JSON.stringify(data, null, 2));
}

// Home page: lists every resource in db.json, like json-server did.
app.get("/", (req, res) => {
    const db = readDB();
    const resources = Object.keys(db).map(
        (key) => `<li><a href="/${key}">/${key}</a> &mdash; ${db[key].length} items</li>`
    ).join("");

    res.send(`
        <html>
        <head>
            <title>Backend Server</title>
            <style>
                body { font-family: Arial, sans-serif; max-width: 600px; margin: 60px auto; color: #222; }
                h1 { border-bottom: 1px solid #ddd; padding-bottom: 10px; }
                ul { line-height: 2; }
                a { color: #1a73e8; text-decoration: none; }
                a:hover { text-decoration: underline; }
            </style>
        </head>
        <body>
            <h1>Backend server is running</h1>
            <p>Available resources from db.json:</p>
            <ul>${resources}</ul>
        </body>
        </html>
    `);
});

/* ---------------- Courses ---------------- */

app.get("/courses", (req, res) => {
    const db = readDB();
    sendJSON(res, db.courses);
});

app.get("/courses/:id", (req, res) => {
    const db = readDB();
    const course = db.courses.find((c) => c.id === req.params.id);
    if (!course) return sendJSON(res, { error: "Course not found" }, 404);
    sendJSON(res, course);
});

app.post("/courses", (req, res) => {
    const db = readDB();
    const newCourse = { ...req.body, id: req.body.id || makeId() };
    db.courses.push(newCourse);
    writeDB(db);
    sendJSON(res, newCourse, 201);
});

app.put("/courses/:id", (req, res) => {
    const db = readDB();
    const index = db.courses.findIndex((c) => c.id === req.params.id);
    if (index === -1) return sendJSON(res, { error: "Course not found" }, 404);
    db.courses[index] = { ...req.body, id: req.params.id };
    writeDB(db);
    sendJSON(res, db.courses[index]);
});

app.delete("/courses/:id", (req, res) => {
    const db = readDB();
    db.courses = db.courses.filter((c) => c.id !== req.params.id);
    writeDB(db);
    res.status(204).end();
});

/* ---------------- Students ---------------- */

app.get("/students", (req, res) => {
    const db = readDB();
    sendJSON(res, db.students);
});

app.post("/students", (req, res) => {
    const db = readDB();
    const newStudent = { ...req.body, id: req.body.id || makeId() };
    db.students.push(newStudent);
    writeDB(db);
    sendJSON(res, newStudent, 201);
});

/* ---------------- Enrollments ---------------- */

app.get("/enrollments", (req, res) => {
    const db = readDB();
    sendJSON(res, db.enrollments);
});

app.post("/enrollments", (req, res) => {
    const db = readDB();
    const newEnrollment = { ...req.body, id: req.body.id || makeId() };
    db.enrollments.push(newEnrollment);
    writeDB(db);
    sendJSON(res, newEnrollment, 201);
});

app.patch("/enrollments/:id", (req, res) => {
    const db = readDB();
    const index = db.enrollments.findIndex((e) => e.id === req.params.id);
    if (index === -1) return sendJSON(res, { error: "Enrollment not found" }, 404);
    db.enrollments[index] = { ...db.enrollments[index], ...req.body };
    writeDB(db);
    sendJSON(res, db.enrollments[index]);
});

app.delete("/enrollments/:id", (req, res) => {
    const db = readDB();
    db.enrollments = db.enrollments.filter((e) => e.id !== req.params.id);
    writeDB(db);
    res.status(204).end();
});

const PORT = 4000;
app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
});
