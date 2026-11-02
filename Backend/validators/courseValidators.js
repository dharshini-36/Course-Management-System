const { body, param } = require("express-validator");

const idParam = param("id").isMongoId().withMessage("Invalid course ID");

const text = (field, max) =>
  body(field)
    .optional({ values: "null" })
    .customSanitizer((value) => (typeof value === "number" ? String(value) : value))
    .isString()
    .withMessage(`${field} must be text`)
    .trim()
    .isLength({ max })
    .withMessage(`${field} must be at most ${max} characters`);

const required = (field, max) =>
  body(field)
    .isString()
    .withMessage(`${field} is required`)
    .bail()
    .trim()
    .notEmpty()
    .withMessage(`${field} is required`)
    .isLength({ max })
    .withMessage(`${field} must be at most ${max} characters`);

const optionalFields = [
  text("level", 50),
  text("weeks", 10),
  text("hours", 10),
  text("rating", 10),
  text("topics", 2000),
  text("outcome", 2000)
];

const createCourseValidation = [
  required("title", 150),
  required("category", 100),
  required("instructor", 100),
  ...optionalFields
];

// For updates every field is optional, but if present it must be valid.
const updateCourseValidation = [
  idParam,
  body("title").optional().isString().trim().notEmpty().isLength({ max: 150 }).withMessage("Invalid title"),
  body("category").optional().isString().trim().notEmpty().isLength({ max: 100 }).withMessage("Invalid category"),
  body("instructor").optional().isString().trim().notEmpty().isLength({ max: 100 }).withMessage("Invalid instructor"),
  ...optionalFields
];

const courseIdValidation = [idParam];

module.exports = { createCourseValidation, updateCourseValidation, courseIdValidation };