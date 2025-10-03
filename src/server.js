const fs = require("fs");
const path = require("path");
const app = require("./app");
const config = require("./config/config");
const logger = require("./config/logger");
const pool = require("./config/database");

// Ensure public directories exist
const ensureDirs = [
  path.join(__dirname, "..", "public"),
  config.upload.dir,
  config.upload.invoicesDir,
];
ensureDirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const PORT = config.port;

async function start() {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    logger.info("Database connected");
  } catch (err) {
    logger.error("Database connection failed", { message: err.message });
  }

  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
}

start();
