const { fail, checkDate, parseId } = require('../utils/validate');

const DEFAULT_LIMIT = 100;
const MAX_LIMIT = 1000;

/** Reads ?device_id=&from=&to=&limit= from the URL query string. */
function parseSensorQuery(query) {
  const errors = [];
  const result = { limit: DEFAULT_LIMIT };

  if (query.get('device_id') !== null) {
    result.deviceId = parseId(query.get('device_id'), 'device_id');
  }
  if (query.get('from') !== null) result.from = checkDate(errors, 'from', query.get('from'));
  if (query.get('to') !== null) result.to = checkDate(errors, 'to', query.get('to'));
  if (query.get('limit') !== null) {
    const limit = Number(query.get('limit'));
    if (!Number.isInteger(limit) || limit < 1 || limit > MAX_LIMIT) {
      errors.push(`limit must be a whole number between 1 and ${MAX_LIMIT}.`);
    } else {
      result.limit = limit;
    }
  }
  fail(errors);
  return result;
}

module.exports = { parseSensorQuery };
