// Run with: npm test
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { openDatabase } = require('../src/db/database');
const { createApp } = require('../src/app');

let server, db, base;

before(async () => {
  db = openDatabase(':memory:');
  server = createApp(db);
  await new Promise((resolve) => server.listen(0, resolve));
  base = `http://localhost:${server.address().port}/api`;
});
after(() => { server.close(); db.close(); });

async function call(method, path, body) {
  const res = await fetch(base + path, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body),
  });
  const text = await res.text();
  return { status: res.status, json: text ? JSON.parse(text) : undefined };
}

const lamp = { name: 'Lamp', type: 'Smart Light', icon: 'bulb-outline' };
const reading = { temperature: 24.5, light_level: 300 };

test('health + gateway', async () => {
  assert.equal((await call('GET', '/health')).json.status, 'ok');
  assert.deepEqual((await call('POST', '/gateway/connect')).json, { connected: true });
});

test('device CRUD', async () => {
  const created = await call('POST', '/devices', lamp);
  assert.equal(created.status, 201);
  assert.equal(created.json.status, false); // boolean, default off
  const id = created.json.id;

  assert.equal((await call('GET', `/devices/${id}`)).json.name, 'Lamp');
  assert.ok((await call('GET', '/devices')).json.some((d) => d.id === id));

  const toggled = await call('PATCH', `/devices/${id}`, { status: true });
  assert.equal(toggled.json.status, true);
  assert.equal(toggled.json.name, 'Lamp'); // untouched

  const replaced = await call('PUT', `/devices/${id}`, { ...lamp, name: 'Desk Lamp' });
  assert.equal(replaced.json.name, 'Desk Lamp');
  assert.equal(replaced.json.status, false); // PUT resets omitted status

  assert.equal((await call('DELETE', `/devices/${id}`)).status, 204);
  assert.equal((await call('GET', `/devices/${id}`)).status, 404);
});

test('device validation', async () => {
  const bad = await call('POST', '/devices', { name: '  ', type: 5 });
  assert.equal(bad.status, 400);
  assert.equal(bad.json.error.details.length, 3); // name, type, icon
  assert.equal((await call('PATCH', '/devices/1', {})).status, 404); // no such device
  assert.equal((await call('POST', '/devices', { ...lamp, status: 'yes' })).status, 400);
  assert.equal((await call('POST', '/devices', '{oops')).status, 400);
  assert.equal((await call('GET', '/devices/abc')).status, 400);
  assert.equal((await call('GET', '/nope')).status, 404);
  assert.equal((await call('PUT', '/devices')).status, 405);
});

test('sensors belong to a device; cascade delete', async () => {
  const { json: device } = await call('POST', '/devices', lamp);

  const nested = await call('POST', `/devices/${device.id}/sensors`, reading);
  assert.equal(nested.status, 201);
  assert.equal(nested.json.device_id, device.id);

  const flat = await call('POST', '/sensors', {
    ...reading, device_id: device.id, record_at: '2030-01-01T00:00:00Z',
  });
  assert.equal(flat.status, 201);
  assert.equal(flat.json.record_at, '2030-01-01T00:00:00.000Z');

  assert.equal((await call('GET', `/devices/${device.id}/sensors`)).json.length, 2);
  assert.equal((await call('GET', '/sensors/latest')).json.id, flat.json.id); // newest record_at
  assert.equal((await call('GET', `/devices/${device.id}/sensors/latest`)).json.id, flat.json.id);

  assert.equal((await call('PATCH', `/sensors/${flat.json.id}`, { temperature: 30 })).json.temperature, 30);
  assert.equal((await call('PUT', `/sensors/${nested.json.id}`, { ...reading, device_id: device.id, temperature: 1 })).json.temperature, 1);

  // deleting the device removes its readings
  await call('DELETE', `/devices/${device.id}`);
  assert.equal((await call('GET', `/sensors/${flat.json.id}`)).status, 404);
});

test('sensor validation and foreign key', async () => {
  assert.equal((await call('POST', '/sensors', { ...reading, device_id: 9999 })).status, 404);
  assert.equal((await call('POST', '/devices/9999/sensors', reading)).status, 404);
  const bad = await call('POST', '/sensors', { temperature: 'hot', light_level: -5, device_id: 0 });
  assert.equal(bad.status, 400);
  assert.equal(bad.json.error.details.length, 3);
  assert.equal((await call('GET', '/sensors?limit=0')).status, 400);
  assert.equal((await call('GET', '/sensors?from=yesterday')).status, 400);
  assert.equal((await call('GET', '/sensors?device_id=9999')).status, 200);
  assert.equal((await call('GET', '/sensors/latest?device_id=9999')).status, 404);
});

test('latest returns 404 when empty, filters work', async () => {
  const { json: device } = await call('POST', '/devices', lamp);
  assert.equal((await call('GET', `/devices/${device.id}/sensors/latest`)).status, 404);
  for (const t of [1, 2, 3]) await call('POST', `/devices/${device.id}/sensors`, { ...reading, temperature: t });
  assert.equal((await call('GET', `/sensors?device_id=${device.id}&limit=2`)).json.length, 2);
});
