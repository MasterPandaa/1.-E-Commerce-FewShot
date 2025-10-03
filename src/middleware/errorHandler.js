const logger = require("../config/logger");

function notFound(req, res, next) {
  res.status(404).json({ success: false, message: "Route not found" });
}

function errorHandler(err, req, res, next) {
  // eslint-disable-line no-unused-vars
  logger.error("Unhandled error", { message: err.message, stack: err.stack });
  const status = err.status || 500;
  const payload = {
    success: false,
    message: status === 500 ? "Internal server error" : err.message,
  };
  if (process.env.NODE_ENV !== "production") {
    payload.error = { name: err.name, stack: err.stack };
  }
  res.status(status).json(payload);
}

module.exports = { notFound, errorHandler };
