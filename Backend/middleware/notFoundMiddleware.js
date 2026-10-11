// Runs only when NO route above it matched the request.
const notFound = (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route not found: ${req.originalUrl}`
    });
};

module.exports = notFound;
