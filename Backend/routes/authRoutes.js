const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const { registerValidation, loginValidation } = require("../validators/authValidators");
const validateRequest = require("../middleware/validateRequest");
const loginLimiter = require("../middleware/loginLimiter");

router.post("/register", registerValidation, validateRequest, authController.register);

router.post("/login", loginLimiter, loginValidation, validateRequest, authController.login);

// Admin login (credentials are checked on the backend, not in React)
router.post("/admin/login", loginLimiter, loginValidation, validateRequest, authController.adminLogin);

module.exports = router;