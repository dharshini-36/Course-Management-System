const express = require("express");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// GET /api/v1/contacts
// Students get the list of admins. Admins get the list of students.
router.get("/", authMiddleware, async (req, res, next) => {
  try {
    const myId = req.user.sub;

    // Read my role from the database, not from the token.
    const me = await User.findById(myId).select("role").lean();
    if (!me) {
      return res.status(404).json({ message: "User not found" });
    }

    const wantedRole = me.role === "admin" ? "student" : "admin";

    const users = await User.find({ role: wantedRole, _id: { $ne: myId } })
      .select("name email role")
      .sort({ name: 1 })
      .lean();

    const contacts = users.map((user) => ({
      _id: String(user._id),
      name: user.name || user.email,
      role: user.role,
    }));

    res.json({ contacts });
  } catch (error) {
    next(error);
  }
});

module.exports = router;