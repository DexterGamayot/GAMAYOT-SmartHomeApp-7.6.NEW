// Fills the database with the same 3 sample devices the app used to have,
// plus 24 hours of sensor readings for each.
//   npm run seed        -> only seeds if there are no devices yet
//   npm run db:reset    -> wipes all data first, then seeds
const config = require('../src/config');
const { openDatabase } = require('../src/db/database');
const { createDeviceModel } = require('../src/models/deviceModel');
const { createSensorModel } = require('../src/models/sensorModel');

const SAMPLE_DEVICES = [
  { name: 'Living Room Light', type: 'Smart Light', icon: 'bulb-outline', status: true },
  { name: 'Bedroom Fan', type: 'Smart Fan', icon: 'sync-outline', status: false },
  { name: 'Front Door Lock', type: 'Smart Lock', icon: 'lock-closed-outline', status: true },
];

function seed(db) {
  const devices = createDeviceModel(db);
  const sensors = createSensorModel(db);
  const now = Date.now();

  db.exec('BEGIN');
  try {
    for (const input of SAMPLE_DEVICES) {
      const device = devices.create(input);
      for (let hoursAgo = 23; hoursAgo >= 0; hoursAgo--) {
        sensors.create({
          device_id: device.id,
          temperature: Math.round((20 + Math.random() * 10) * 10) / 10,
          light_level: Math.round(100 + Math.random() * 900),
          record_at: new Date(now - hoursAgo * 3600 * 1000).toISOString(),
        });
      }
    }
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

function main() {
  const db = openDatabase(config.databaseFile);
  if (process.argv.includes('--reset')) {
    db.exec('DELETE FROM Sensor; DELETE FROM Device;');
    db.exec("DELETE FROM sqlite_sequence WHERE name IN ('Sensor', 'Device')");
    console.log('Existing data removed.');
  }
  const { count } = db.prepare('SELECT COUNT(*) AS count FROM Device').get();
  if (count > 0) {
    console.log(`Database already has ${count} device(s) — nothing to seed. Use "npm run db:reset" to start over.`);
  } else {
    seed(db);
    console.log(`Seeded ${SAMPLE_DEVICES.length} devices with 24 readings each.`);
  }
  db.close();
}

if (require.main === module) main();

module.exports = { seed, SAMPLE_DEVICES };
