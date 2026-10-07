const http = require('node:http');
const config = require('./config');
const { Router } = require('./router');
const { HttpError, readJsonBody } = require('./utils/http');
const { createDeviceModel } = require('./models/deviceModel');
const { createSensorModel } = require('./models/sensorModel');
const { registerDeviceRoutes } = require('./routes/deviceRoutes');
const { registerSensorRoutes } = require('./routes/sensorRoutes');

/** Builds the HTTP server. `db` is an open database from openDatabase(). */
function createApp(db) {
  const models = { devices: createDeviceModel(db), sensors: createSensorModel(db) };
  const router = new Router();

  router.get('/api/health', () => {
    db.prepare('SELECT 1').get(); // proves the database is reachable
    return { body: { status: 'ok', time: new Date().toISOString() } };
  });
  // The app's "Connect to IoT gateway" button calls this.
  router.post('/api/gateway/connect', () => {
    db.prepare('SELECT 1').get();
    return { body: { connected: true } };
  });
  registerDeviceRoutes(router, models);
  registerSensorRoutes(router, models);

  function send(res, status, body) {
    const payload = body === undefined ? '' : JSON.stringify(body);
    res.writeHead(status, {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': config.corsOrigin,
      'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end(status === 204 ? undefined : payload);
  }

  return http.createServer(async (req, res) => {
    try {
      if (req.method === 'OPTIONS') return send(res, 204); // CORS pre-flight

      const url = new URL(req.url, 'http://localhost');
      const { handler, params } = router.match(req.method, url.pathname);
      const body = ['POST', 'PUT', 'PATCH'].includes(req.method) ? await readJsonBody(req) : {};
      const result = await handler({ params, query: url.searchParams, body });
      send(res, result.status ?? 200, result.body);
    } catch (error) {
      if (error instanceof HttpError) {
        return send(res, error.status, {
          error: { message: error.message, ...(error.details && { details: error.details }) },
        });
      }
      console.error(error); // unexpected bug: log it, hide internals from the client
      send(res, 500, { error: { message: 'Internal server error.' } });
    }
  });
}

module.exports = { createApp };
