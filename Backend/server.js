const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");

const courseRoutes = require("./routes/courseRoutes");
const studentRoutes = require("./routes/studentRoutes");
const enrollmentRoutes = require("./routes/enrollmentRoutes");
const notFound = require("./middleware/notFoundMiddleware");
const errorHandler = require("./middleware/errorMiddleware");

dotenv.config();

const app = express();

// -------------------------
// Middleware
// -------------------------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// -------------------------
// Test Route
// -------------------------
app.get("/", (req, res) => {
    res.json({
        message: "Student Course Management API is running"
    });
});

// -------------------------
// Health Check
// -------------------------
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Backend is healthy",
        timestamp: new Date().toISOString()
    });
});

// -------------------------
// API Routes (versioned)
// -------------------------
app.use("/api/v1/courses", courseRoutes);
app.use("/api/v1/students", studentRoutes);
app.use("/api/v1/enrollments", enrollmentRoutes);

// -------------------------
// 404 + Error middleware  (MUST be last, in this order)
// -------------------------
app.use(notFound);
app.use(errorHandler);

// -------------------------
// Server
// -------------------------
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
