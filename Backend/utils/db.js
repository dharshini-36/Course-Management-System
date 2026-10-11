const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "..", "data", "db.json");

const readDB = () => JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
const writeDB = (db) => fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
const makeId = () => Math.random().toString(36).slice(2, 10);

module.exports = { readDB, writeDB, makeId };
