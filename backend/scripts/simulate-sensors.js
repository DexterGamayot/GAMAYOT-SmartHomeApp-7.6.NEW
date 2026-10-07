// Pretends to be your home's sensors: every few seconds it POSTs a new
// reading for each device through the REST API, so you can watch the app's
// Sensors screen change when you press "Refresh Sensors".
//   Start the API first (npm start), then in a second terminal: npm run simulate
const config = require('../src/config');

const API = process.env.API_URL || `http://localhost:${config.port}/api`;
const INTERVAL_MS = 5000;

const random = (min, max) => Math.round((min + Math.random() * (max - min)) * 10) / 10;

async function tick() {
  const devices = await (await fetch(`${API}/devices`)).json();
  for (const device of devices) {
    const response = await fetch(`${API}/devices/${device.id}/sensors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ temperature: random(18, 32), light_level: Math.round(random(100, 1000)) }),
    });
    const reading = await response.json();
    console.log(`${device.name}: ${reading.temperature} °C, ${reading.light_level} lux`);
  }
}

console.log(`Sending readings to ${API} every ${INTERVAL_MS / 1000}s — press Ctrl+C to stop.`);
setInterval(() => tick().catch((e) => console.error('Failed:', e.message)), INTERVAL_MS);
tick().catch((e) => console.error('Failed:', e.message));
