// Central error handler - must be the LAST middleware in server.js.
function errorHandler(err, req, res, next) {
  console.error(err);

  // Duplicate key (e.g. same email twice)
  if (err.code === 11000) {
    return res.status(409).json({ message: "Duplicate value already exists" });
  }

  // Mongoose schema validation failed
  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: "Validation failed",
      errors: Object.values(err.errors).map((item) => item.message)
    });
  }

  // Bad ObjectId, e.g. /courses/abc
  if (err.name === "CastError") {
    return res.status(400).json({ message: "Invalid identifier" });
  }

  const status =
    Number.isInteger(err.status || err.statusCode) &&
    (err.status || err.statusCode) >= 400 &&
    (err.status || err.statusCode) < 600
      ? err.status || err.statusCode
      : 500;

  res.status(status).json({
    // Never leak internal error details to the client.
    message: status === 500 ? "Internal server error" : err.message
  });
}

module.exports = errorHandler;