const jwt = require("jsonwebtoken");

// Checks the "Authorization: Bearer <token>" header before a protected route runs.
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Authentication token is required"
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        message: "JWT configuration is missing"
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Who is logged in (available to later middleware / controllers).
    req.user = { id: decoded.sub, email: decoded.email, role: decoded.role };

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
}

module.exports = authMiddleware;
