const { HttpError } = require('./http');

// Small hand-written validators. Each one pushes a message into `errors`
// when a value is wrong; `fail()` then throws one 400 error listing them all.

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function fail(errors) {
  if (errors.length) throw new HttpError(400, 'Validation failed.', errors);
}

function requireBody(body) {
  if (!isPlainObject(body)) throw new HttpError(400, 'Request body must be a JSON object.');
}

/** Checks a string field; returns the trimmed value (or undefined if invalid). */
function checkString(errors, field, value, { max, pattern, patternHint }) {
  if (typeof value !== 'string' || value.trim() === '') {
    errors.push(`${field} must be a non-empty string.`);
    return undefined;
  }
  const trimmed = value.trim();
  if (trimmed.length > max) {
    errors.push(`${field} must be at most ${max} characters.`);
    return undefined;
  }
  if (pattern && !pattern.test(trimmed)) {
    errors.push(`${field} ${patternHint}.`);
    return undefined;
  }
  return trimmed;
}

function checkNumber(errors, field, value, { min, max }) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    errors.push(`${field} must be a number.`);
    return undefined;
  }
  if (value < min || value > max) {
    errors.push(`${field} must be between ${min} and ${max}.`);
    return undefined;
  }
  return value;
}

function checkBoolean(errors, field, value) {
  if (typeof value !== 'boolean') {
    errors.push(`${field} must be true or false.`);
    return undefined;
  }
  return value;
}

function checkPositiveInt(errors, field, value) {
  if (!Number.isInteger(value) || value < 1) {
    errors.push(`${field} must be a positive whole number.`);
    return undefined;
  }
  return value;
}

/** Validates a date string and returns it as a normalised ISO-8601 UTC string. */
function checkDate(errors, field, value) {
  const time = typeof value === 'string' ? Date.parse(value) : NaN;
  if (Number.isNaN(time)) {
    errors.push(`${field} must be a valid ISO-8601 date, e.g. 2026-10-07T11:00:00Z.`);
    return undefined;
  }
  return new Date(time).toISOString();
}

/** Parses a ":id" URL segment. */
function parseId(value, label = 'id') {
  if (!/^[1-9]\d*$/.test(value)) {
    throw new HttpError(400, `${label} must be a positive whole number.`);
  }
  return Number(value);
}

module.exports = {
  isPlainObject, fail, requireBody,
  checkString, checkNumber, checkBoolean, checkPositiveInt, checkDate, parseId,
};
