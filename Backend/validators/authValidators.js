const { body } = require("express-validator");

// NOTE: we lower-case the email instead of using normalizeEmail(), because
// normalizeEmail() REMOVES DOTS from Gmail addresses and your existing
// users (e.g. first.last@gmail.com) would no longer be found at login.
const emailRule = body("email")
  .isString()
  .withMessage("Valid email is required")
  .bail()
  .trim()
  .toLowerCase()
  .isEmail()
  .withMessage("Valid email is required");

const registerValidation = [
  body("name")
    .isString()
    .withMessage("Name is required")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ max: 100 })
    .withMessage("Name must be at most 100 characters"),

  emailRule,

  body("password")
    .isString()
    .withMessage("Password is required")
    .bail()
    .isLength({ min: 12, max: 72 })
    .withMessage("Password must contain 12 to 72 characters"),

  body("department")
    .isString()
    .withMessage("Department is required")
    .bail()
    .trim()
    .notEmpty()
    .withMessage("Department is required")
    .isLength({ max: 100 })
    .withMessage("Department must be at most 100 characters")
];

const loginValidation = [
  emailRule,
  body("password")
    .isString()
    .withMessage("Password is required")
    .bail()
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ max: 72 })
    .withMessage("Password is too long")
];

module.exports = { registerValidation, loginValidation };