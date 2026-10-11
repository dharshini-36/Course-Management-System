const express = require("express");
const {
    getEnrollments,
    addEnrollment,
    editEnrollment,
    removeEnrollment
} = require("../controllers/enrollmentController");

const router = express.Router();

router.get("/", getEnrollments);
router.post("/", addEnrollment);
router.patch("/:id", editEnrollment);
router.delete("/:id", removeEnrollment);

module.exports = router;
