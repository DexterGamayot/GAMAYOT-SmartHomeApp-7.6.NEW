// All SQL for the Device table lives here.

const COLUMNS = ['name', 'type', 'icon', 'status'];

// SQLite stores status as 0/1; the API (and the app) use true/false.
const toApi = (row) => (row ? { ...row, status: row.status === 1 } : undefined);
const toDb = (field, value) => (field === 'status' ? (value ? 1 : 0) : value);

function createDeviceModel(db) {
  const model = {
    list: () => db.prepare('SELECT * FROM Device ORDER BY id').all().map(toApi),

    get: (id) => toApi(db.prepare('SELECT * FROM Device WHERE id = ?').get(id)),

    create({ name, type, icon, status = false }) {
      const result = db
        .prepare('INSERT INTO Device (name, type, icon, status) VALUES (?, ?, ?, ?)')
        .run(name, type, icon, status ? 1 : 0);
      return model.get(Number(result.lastInsertRowid));
    },

    /** Updates only the given fields. Returns undefined if the device doesn't exist. */
    update(id, fields) {
      const keys = Object.keys(fields).filter((key) => COLUMNS.includes(key)); // whitelist
      if (keys.length > 0) {
        const setClause = keys.map((key) => `${key} = ?`).join(', ');
        db.prepare(`UPDATE Device SET ${setClause} WHERE id = ?`).run(
          ...keys.map((key) => toDb(key, fields[key])),
          id
        );
      }
      return model.get(id);
    },

    /** Deletes the device (its sensor readings are removed by ON DELETE CASCADE). */
    remove: (id) => db.prepare('DELETE FROM Device WHERE id = ?').run(id).changes > 0,
  };
  return model;
}

module.exports = { createDeviceModel };
