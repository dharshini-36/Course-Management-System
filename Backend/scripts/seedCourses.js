// Copies the 9 starter courses from data/courses.js into MongoDB.
// Run once:  node scripts/seedCourses.js   (does nothing if courses already exist)
require("dotenv").config();
const mongoose = require("mongoose");
const Course = require("../models/Course");
const starterCourses = require("../data/courses");

async function main() {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is not set in .env");
  await mongoose.connect(process.env.MONGO_URI);

  if ((await Course.countDocuments()) > 0) {
    console.log("Courses already exist - nothing seeded.");
    return;
  }

  const docs = starterCourses.map(({ id, ...rest }) => rest);
  await Course.insertMany(docs);
  console.log(`Seeded ${docs.length} courses`);
}

main()
  .catch((error) => {
    console.error("Error:", error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
