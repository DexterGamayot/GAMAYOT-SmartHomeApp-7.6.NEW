const path = require('node:path');

// Load backend/.env if it exists (built into Node, no "dotenv" package needed).
try {
  process.loadEnvFile(path.join(__dirname, '..', '.env'));
} catch {
  // No .env file — defaults below are used.
}

module.exports = {
  port: Number(process.env.PORT) || 3000,
  databaseFile: path.resolve(
    __dirname,
    '..',
    process.env.DATABASE_FILE || './data/smart-home.db'
  ),
  corsOrigin: process.env.CORS_ORIGIN || '*',
};
