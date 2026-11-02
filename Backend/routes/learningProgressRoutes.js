const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const { updateProgress, getMyProgress } = require("../controllers/learningProgressController");

const router = express.Router();

router.get("/my-progress", authMiddleware, authorizeRoles("student"), getMyProgress);
router.put("/", authMiddleware, authorizeRoles("student"), updateProgress);

module.exports = router;
