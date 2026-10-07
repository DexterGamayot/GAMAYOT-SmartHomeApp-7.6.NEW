const { HttpError } = require('../utils/http');
const { parseId } = require('../utils/validate');
const { validateSensor } = require('../validators');
const { parseSensorQuery } = require('./sensorQuery');

function registerSensorRoutes(router, { devices, sensors }) {
  const findReading = (rawId) => {
    const reading = sensors.get(parseId(rawId, 'Sensor id'));
    if (!reading) throw new HttpError(404, `Sensor reading ${rawId} not found.`);
    return reading;
  };

  // A reading must belong to a device that exists.
  const requireDevice = (deviceId) => {
    if (!devices.get(deviceId)) throw new HttpError(404, `Device ${deviceId} not found.`);
  };

  router.get('/api/sensors', ({ query }) => ({ body: sensors.list(parseSensorQuery(query)) }));

  // Must be registered before '/api/sensors/:id'. The app uses this one.
  router.get('/api/sensors/latest', ({ query }) => {
    const { deviceId } = parseSensorQuery(query);
    if (deviceId !== undefined) requireDevice(deviceId);
    const reading = sensors.latest(deviceId);
    if (!reading) throw new HttpError(404, 'No sensor readings have been recorded yet.');
    return { body: reading };
  });

  router.post('/api/sensors', ({ body }) => {
    const fields = validateSensor(body, 'create');
    requireDevice(fields.device_id);
    return { status: 201, body: sensors.create(fields) };
  });

  router.get('/api/sensors/:id', ({ params }) => ({ body: findReading(params.id) }));

  router.put('/api/sensors/:id', ({ params, body }) => {
    const reading = findReading(params.id);
    const fields = validateSensor(body, 'replace');
    requireDevice(fields.device_id);
    return {
      body: sensors.update(reading.id, { record_at: new Date().toISOString(), ...fields }),
    };
  });

  router.patch('/api/sensors/:id', ({ params, body }) => {
    const reading = findReading(params.id);
    const fields = validateSensor(body, 'patch');
    if (fields.device_id !== undefined) requireDevice(fields.device_id);
    return { body: sensors.update(reading.id, fields) };
  });

  router.delete('/api/sensors/:id', ({ params }) => {
    sensors.remove(findReading(params.id).id);
    return { status: 204 };
  });
}

module.exports = { registerSensorRoutes };
