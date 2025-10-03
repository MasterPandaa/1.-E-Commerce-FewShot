require("dotenv").config();
const path = require("path");

module.exports = {
  env: process.env.NODE_ENV || "development",
  port: process.env.PORT || 3000,
  baseUrl: process.env.BASE_URL || "http://localhost:3000",
  database: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 10,
    waitForConnections: true,
    queueLimit: 0,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: "24h",
  },
  email: {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT ? parseInt(process.env.EMAIL_PORT, 10) : 587,
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
    from: process.env.EMAIL_FROM || "no-reply@example.com",
  },
  rateLimit: {
    windowMinutes: process.env.RATE_LIMIT_WINDOW
      ? parseInt(process.env.RATE_LIMIT_WINDOW, 10)
      : 15,
    maxRequests: process.env.RATE_LIMIT_MAX
      ? parseInt(process.env.RATE_LIMIT_MAX, 10)
      : 100,
  },
  upload: {
    dir: path.join(__dirname, "..", "..", "public", "uploads"),
    invoicesDir: path.join(__dirname, "..", "..", "public", "invoices"),
    maxSizeBytes:
      (process.env.UPLOAD_MAX_SIZE_MB
        ? parseInt(process.env.UPLOAD_MAX_SIZE_MB, 10)
        : 5) *
      1024 *
      1024,
  },
};
