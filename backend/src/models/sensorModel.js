// All SQL for the Sensor table lives here.

const COLUMNS = ['temperature', 'light_level', 'device_id', 'record_at'];

function createSensorModel(db) {
  const model = {
    /** Filters: deviceId, from, to (ISO dates), limit. Newest readings first. */
    list({ deviceId, from, to, limit = 100 } = {}) {
      const where = [];
      const params = [];
      if (deviceId !== undefined) { where.push('device_id = ?'); params.push(deviceId); }
      if (from !== undefined) { where.push('record_at >= ?'); params.push(from); }
      if (to !== undefined) { where.push('record_at <= ?'); params.push(to); }
      const sql =
        'SELECT * FROM Sensor' +
        (where.length ? ` WHERE ${where.join(' AND ')}` : '') +
        ' ORDER BY record_at DESC, id DESC LIMIT ?';
      return db.prepare(sql).all(...params, limit);
    },

    /** Most recent reading (optionally for one device). */
    latest(deviceId) {
      return model.list({ deviceId, limit: 1 })[0];
    },

    get: (id) => db.prepare('SELECT * FROM Sensor WHERE id = ?').get(id),

    create({ temperature, light_level, device_id, record_at }) {
      const result = db
        .prepare(
          'INSERT INTO Sensor (temperature, light_level, device_id, record_at) VALUES (?, ?, ?, ?)'
        )
        .run(temperature, light_level, device_id, record_at ?? new Date().toISOString());
      return model.get(Number(result.lastInsertRowid));
    },

    update(id, fields) {
      const keys = Object.keys(fields).filter((key) => COLUMNS.includes(key)); // whitelist
      if (keys.length > 0) {
        const setClause = keys.map((key) => `${key} = ?`).join(', ');
        db.prepare(`UPDATE Sensor SET ${setClause} WHERE id = ?`).run(
          ...keys.map((key) => fields[key]),
          id
        );
      }
      return model.get(id);
    },

    remove: (id) => db.prepare('DELETE FROM Sensor WHERE id = ?').run(id).changes > 0,
  };
  return model;
}

module.exports = { createSensorModel };
