// Global error handler - needs all four parameters to be recognised by Express.
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    // Use the error's own status (e.g. 400 for bad JSON), else 500.
    // Mongoose validation / bad-id errors are the client's fault (400).
    if (err.name === "ValidationError" || err.name === "CastError") {
        return res.status(400).json({ success: false, message: err.message });
    }

    const statusCode = err.status || err.statusCode ||
        (res.statusCode === 200 ? 500 : res.statusCode);

    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error"
    });
};

module.exports = errorHandler;
