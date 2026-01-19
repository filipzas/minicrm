const express = require('express');
const { db } = require('../db');

const router = express.Router();

router.get('/', (req, res) => {
  const rows = db.prepare('SELECT * FROM audit ORDER BY id DESC').all();
  const mapped = rows.map((row) => ({
    id: row.id,
    action: row.action,
    subjectId: row.subject_id,
    meta: row.meta ? JSON.parse(row.meta) : null,
    timestamp: row.created_at
  }));

  return res.json(mapped);
});

module.exports = router;
