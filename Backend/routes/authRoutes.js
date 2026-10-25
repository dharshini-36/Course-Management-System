const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");

const {
  validateRegistration,
  validateLogin,
} = require("../middleware/authValidation");

router.post("/register", validateRegistration, authController.register);

router.post("/login", validateLogin, authController.login);

// Admin login (credentials are checked on the backend, not in React)
router.post("/admin/login", validateLogin, authController.adminLogin);

module.exports = router;
