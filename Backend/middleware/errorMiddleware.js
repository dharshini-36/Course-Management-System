// Global error handler - needs all four parameters to be recognised by Express.
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);

    // Use the error's own status (e.g. 400 for bad JSON), else 500.
    const statusCode = err.status || err.statusCode ||
        (res.statusCode === 200 ? 500 : res.statusCode);

    res.status(statusCode).json({
        success: false,
        message: err.message || "Internal Server Error"
    });
};

module.exports = errorHandler;
