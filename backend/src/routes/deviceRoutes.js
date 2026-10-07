const { HttpError } = require('../utils/http');
const { parseId } = require('../utils/validate');
const { validateDevice, validateSensor } = require('../validators');
const { parseSensorQuery } = require('./sensorQuery');

/** Looks up a device or throws 404. */
function findDevice(devices, rawId) {
  const device = devices.get(parseId(rawId, 'Device id'));
  if (!device) throw new HttpError(404, `Device ${rawId} not found.`);
  return device;
}

function registerDeviceRoutes(router, { devices, sensors }) {
  router.get('/api/devices', () => ({ body: devices.list() }));

  router.post('/api/devices', ({ body }) => ({
    status: 201,
    body: devices.create(validateDevice(body, 'create')),
  }));

  router.get('/api/devices/:id', ({ params }) => ({ body: findDevice(devices, params.id) }));

  // PUT = replace every field, PATCH = change only the fields you send.
  router.put('/api/devices/:id', ({ params, body }) => {
    const device = findDevice(devices, params.id);
    const fields = validateDevice(body, 'replace');
    return { body: devices.update(device.id, { status: false, ...fields }) };
  });

  router.patch('/api/devices/:id', ({ params, body }) => {
    const device = findDevice(devices, params.id);
    return { body: devices.update(device.id, validateDevice(body, 'patch')) };
  });

  router.delete('/api/devices/:id', ({ params }) => {
    const device = findDevice(devices, params.id);
    devices.remove(device.id); // sensor readings are deleted too (cascade)
    return { status: 204 };
  });

  // ── Device → Sensor relationship ──
  router.get('/api/devices/:id/sensors', ({ params, query }) => {
    const device = findDevice(devices, params.id);
    return { body: sensors.list({ ...parseSensorQuery(query), deviceId: device.id }) };
  });

  router.get('/api/devices/:id/sensors/latest', ({ params }) => {
    const device = findDevice(devices, params.id);
    const reading = sensors.latest(device.id);
    if (!reading) throw new HttpError(404, `Device ${device.id} has no sensor readings yet.`);
    return { body: reading };
  });

  router.post('/api/devices/:id/sensors', ({ params, body }) => {
    const device = findDevice(devices, params.id);
    return { status: 201, body: sensors.create(validateSensor(body, 'create', device.id)) };
  });
}

module.exports = { registerDeviceRoutes };
