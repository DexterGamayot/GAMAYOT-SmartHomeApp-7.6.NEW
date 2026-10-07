const config = require('./config');
const { openDatabase } = require('./db/database');
const { createApp } = require('./app');

const db = openDatabase(config.databaseFile);
const server = createApp(db);

server.listen(config.port, '0.0.0.0', () => {
  console.log(`Smart Home API running at http://localhost:${config.port}/api`);
  console.log(`Database file: ${config.databaseFile}`);
});

// Close the database cleanly on Ctrl+C.
process.on('SIGINT', () => {
  server.close();
  db.close();
  process.exit(0);
});
