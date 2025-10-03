const rateLimit = require("express-rate-limit");
const { rateLimit: cfg } = require("../config/config");

const apiLimiter = rateLimit({
  windowMs: cfg.windowMinutes * 60 * 1000,
  max: cfg.maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
});

module.exports = apiLimiter;
