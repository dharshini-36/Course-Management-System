// One list of trusted frontend origins, shared by Express CORS and Socket.IO.
// CLIENT_URL can hold several origins separated by commas.
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
    // No Origin header = Postman / server-to-server calls
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(Object.assign(new Error("Origin not allowed by CORS"), { status: 403 }));
  }
};

module.exports = { allowedOrigins, corsOptions };