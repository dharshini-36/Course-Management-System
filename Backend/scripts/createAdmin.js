// Run once:  node scripts/createAdmin.js
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

async function main() {
  const { MONGO_URI, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME } = process.env;

  if (!MONGO_URI || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
    throw new Error("MONGO_URI, ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env");
  }
  if (ADMIN_PASSWORD.length < 12) {
    throw new Error("ADMIN_PASSWORD must be at least 12 characters long");
  }

  await mongoose.connect(MONGO_URI);

  const email = ADMIN_EMAIL.trim().toLowerCase();
  if (await User.findOne({ email })) {
    throw new Error("A user with this email already exists. Nothing was changed.");
  }

  await User.create({
    name: ADMIN_NAME || "Admin",
    email,
    passwordHash: await bcrypt.hash(ADMIN_PASSWORD, 12),
    department: "Administration",
    role: "admin",
  });

  console.log("Admin created:", email);
}

main()
  .catch((error) => {
    console.error("Error:", error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
