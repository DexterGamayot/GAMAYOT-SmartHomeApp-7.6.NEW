const {
  fail, requireBody, checkString, checkNumber, checkBoolean, checkPositiveInt, checkDate,
} = require('./utils/validate');
const { HttpError } = require('./utils/http');

// mode: 'create' / 'replace' (PUT) = required fields must be present
//       'patch'                    = any subset of fields, at least one

const DEVICE_RULES = {
  name: (e, v) => checkString(e, 'name', v, { max: 100 }),
  type: (e, v) => checkString(e, 'type', v, { max: 50 }),
  icon: (e, v) =>
    checkString(e, 'icon', v, {
      max: 50,
      pattern: /^[a-z0-9-]+$/i,
      patternHint: 'must be an icon name such as "bulb-outline"',
    }),
  status: (e, v) => checkBoolean(e, 'status', v),
};

const SENSOR_RULES = {
  temperature: (e, v) => checkNumber(e, 'temperature', v, { min: -100, max: 200 }),
  light_level: (e, v) => checkNumber(e, 'light_level', v, { min: 0, max: 200000 }),
  device_id: (e, v) => checkPositiveInt(e, 'device_id', v),
  record_at: (e, v) => checkDate(e, 'record_at', v),
};

function validate(body, rules, required, mode) {
  requireBody(body);
  const errors = [];
  const clean = {};

  for (const [field, check] of Object.entries(rules)) {
    if (body[field] === undefined) {
      if (mode !== 'patch' && required.includes(field)) errors.push(`${field} is required.`);
      continue;
    }
    const value = check(errors, body[field]);
    if (value !== undefined) clean[field] = value;
  }

  fail(errors);
  if (mode === 'patch' && Object.keys(clean).length === 0) {
    throw new HttpError(400, `Provide at least one of: ${Object.keys(rules).join(', ')}.`);
  }
  return clean;
}

const validateDevice = (body, mode) =>
  validate(body, DEVICE_RULES, ['name', 'type', 'icon'], mode);

/** `deviceIdFromUrl` is passed for nested routes (/devices/:id/sensors). */
function validateSensor(body, mode, deviceIdFromUrl) {
  const input = deviceIdFromUrl ? { ...body, device_id: deviceIdFromUrl } : body;
  return validate(input, SENSOR_RULES, ['temperature', 'light_level', 'device_id'], mode);
}

module.exports = { validateDevice, validateSensor };
