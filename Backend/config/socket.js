const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const User = require("../models/User");
const Message = require("../models/Message");
const Notification = require("../models/Notification");
const { allowedOrigins } = require("./cors");

// Max 20 messages per 10 seconds per connection (basic abuse protection).
const RATE_LIMIT = { max: 20, windowMs: 10 * 1000 };

function initializeSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST"]
    },
    // Also refuse connections that send an Origin header we don't trust
    // (CORS alone only stops browsers; this stops everything that declares an origin).
    allowRequest: (req, callback) => {
      const origin = req.headers.origin;
      callback(null, !origin || allowedOrigins.includes(origin));
    }
  });

  // Authenticate the socket connection
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth && socket.handshake.auth.token;

      if (!token) {
        return next(new Error("Authentication required"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET, {
        algorithms: ["HS256"]
      });

      const user = await User.findById(decoded.sub).select("_id name role");

      if (!user) {
        return next(new Error("User not found"));
      }

      socket.user = {
        id: String(user._id),
        name: user.name,
        role: user.role
      };

      next();
    } catch (error) {
      next(new Error("Invalid authentication token"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.user.id;

    // Each authenticated user has a private room
    socket.join(`user:${userId}`);
    console.log("Socket connected:", userId);

    let windowStart = Date.now();
    let sentInWindow = 0;

    socket.on("send_message", async (data, ack) => {
      try {
        // Rate limit
        if (Date.now() - windowStart > RATE_LIMIT.windowMs) {
          windowStart = Date.now();
          sentInWindow = 0;
        }
        sentInWindow += 1;
        if (sentInWindow > RATE_LIMIT.max) {
          throw new Error("You are sending messages too fast");
        }

        const { recipientId, text } = data || {};

        if (
          !mongoose.isValidObjectId(recipientId) ||
          typeof text !== "string" ||
          !text.trim() ||
          text.trim().length > 2000
        ) {
          throw new Error("Invalid message data");
        }

        if (String(recipientId) === userId) {
          throw new Error("You cannot message yourself");
        }

        const recipient = await User.findById(recipientId).select("_id");
        if (!recipient) {
          throw new Error("Recipient not found");
        }

        // The sender is ALWAYS the authenticated user - the client cannot fake it.
        const message = await Message.create({
          sender: userId,
          recipient: recipientId,
          text: text.trim()
        });

        const payload = {
          _id: message._id,
          sender: userId,
          recipient: String(recipientId),
          text: message.text,
          createdAt: message.createdAt
        };

        io.to(`user:${userId}`)
          .to(`user:${recipientId}`)
          .emit("receive_message", payload);

        const notification = await Notification.create({
          recipient: recipientId,
          message: `New message from ${socket.user.name}`
        });

        io.to(`user:${recipientId}`).emit("new_notification", notification);

        if (typeof ack === "function") {
          ack({ success: true });
        }
      } catch (error) {
        if (typeof ack === "function") {
          ack({ success: false, message: error.message });
        }
      }
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", userId);
    });
  });

  return io;
}

module.exports = initializeSocket;