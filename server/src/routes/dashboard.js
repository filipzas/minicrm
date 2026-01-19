const express = require('express');
const { db } = require('../db');

const router = express.Router();

router.get('/', (req, res) => {
  const leadRows = db.prepare('SELECT stage, COUNT(*) as count FROM leads GROUP BY stage').all();
  const clientRows = db.prepare('SELECT status, COUNT(*) as count FROM clients GROUP BY status').all();
  const taskRows = db.prepare('SELECT status, COUNT(*) as count FROM tasks GROUP BY status').all();

  const leadCounts = leadRows.reduce(
    (acc, row) => {
      acc.total += row.count;
      acc.byStage[row.stage] = row.count;
      return acc;
    },
    { total: 0, byStage: {} }
  );

  const clientCounts = clientRows.reduce(
    (acc, row) => {
      acc.total += row.count;
      acc.byStatus[row.status] = row.count;
      return acc;
    },
    { total: 0, byStatus: {} }
  );

  const taskCounts = taskRows.reduce(
    (acc, row) => {
      acc.total += row.count;
      acc.byStatus[row.status] = row.count;
      return acc;
    },
    { total: 0, byStatus: {} }
  );

  return res.json({
    clients: clientCounts,
    leads: leadCounts,
    tasks: taskCounts
  });
});

module.exports = router;
