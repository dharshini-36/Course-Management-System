const express = require("express");
const mongoose = require("mongoose");
const Notification = require("../models/Notification");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// GET /api/v1/notifications  - my latest 50 notifications
router.get("/", authMiddleware, async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user.sub })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.json({ notifications });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/notifications/:id/read  - only the owner can mark it read
router.patch("/:id/read", authMiddleware, async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: "Invalid notification ID" });
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.sub },
      { $set: { isRead: true } },
      { returnDocument: "after" }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({ notification });
  } catch (error) {
    next(error);
  }
});

module.exports = router;