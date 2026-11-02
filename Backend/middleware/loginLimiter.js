const { rateLimit } = require("express-rate-limit");

// Max 10 login attempts per IP every 15 minutes.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message: "Too many login attempts. Try again later."
  }
});

module.exports = loginLimiter;