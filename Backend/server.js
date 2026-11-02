require("dotenv").config(); // must be first so config files can read process.env

const http = require("http");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const mongoose = require("mongoose");

const connectDB = require("./config/db");
const initializeSocket = require("./config/socket");
const { corsOptions } = require("./config/cors");
const errorHandler = require("./middleware/errorHandler");

const authRoutes = require("./routes/authRoutes");
const courseRoutes = require("./routes/courseRoutes");
const studentRoutes = require("./routes/studentRoutes");
const profileRoutes = require("./routes/profileRoutes");
const enrollmentRoutes = require("./routes/enrollmentRoutes");
const learningProgressRoutes = require("./routes/learningProgressRoutes");
const messageRoutes = require("./routes/messageRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const contactRoutes = require("./routes/contactRoutes");

const app = express();

// Render / Vercel-style hosts sit behind a proxy: needed for correct client IPs
// (rate limiting) in production.
if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
}

// -------------------------
// Security, CORS, logging, body parsing  (before the routes)
// -------------------------
app.use(helmet());
app.use(cors(corsOptions));
app.use(morgan("combined"));
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));

// -------------------------
// Test + health routes
// -------------------------
app.get("/", (req, res) => {
    res.json({ message: "Student Course Management API is running" });
});

app.get("/api/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        message: "API is running"
    });
});

// -------------------------
// API routes (versioned)
// -------------------------
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/courses", courseRoutes);
app.use("/api/v1/students", studentRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/enrollments", enrollmentRoutes);
app.use("/api/v1/progress", learningProgressRoutes);
app.use("/api/v1/messages", messageRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/contacts", contactRoutes);

// -------------------------
// Unknown route -> 404, then the central error handler (MUST be last)
// -------------------------
app.use((req, res) => {
    res.status(404).json({ message: "API endpoint not found" });
});

app.use(errorHandler);

// -------------------------
// Server (HTTP + Socket.IO share ONE port)
// -------------------------
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
initializeSocket(server);

async function startServer() {
    try {
        await connectDB();

        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Unable to start server:", error.message);
        process.exit(1);
    }
}

// Graceful shutdown: stop accepting requests, close MongoDB, then exit.
function shutdown(signal) {
    console.log(`${signal} received - shutting down`);
    server.close(async () => {
        await mongoose.connection.close();
        process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

process.on("unhandledRejection", (error) => {
    console.error("Unhandled rejection:", error);
    process.exit(1);
});

process.on("uncaughtException", (error) => {
    console.error("Uncaught exception:", error);
    process.exit(1);
});

startServer();