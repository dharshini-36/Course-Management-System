const express = require("express");
const controller = require("../controllers/studentController");
const authMiddleware = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// Every student-management route is ADMIN ONLY.
router.use(authMiddleware, authorizeRoles("admin"));

router.get("/", controller.getStudents);
router.get("/:id", controller.getStudentById);
router.post("/", controller.createStudent);
router.put("/:id", controller.updateStudent);
router.delete("/:id", controller.deleteStudent);

module.exports = router;