const express = require('express');
const { db, makeId, addAudit, now } = require('../db');
const { isValidEuDate } = require('../validators/date');

const router = express.Router();

router.get('/', (req, res) => {
  const { status, clientId } = req.query;
  const filters = [];
  const params = [];

  if (status) {
    filters.push('status = ?');
    params.push(status);
  }

  if (clientId) {
    filters.push('client_id = ?');
    params.push(clientId);
  }

  const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
  const rows = db.prepare(`SELECT * FROM tasks ${whereClause}`).all(...params);

  const mapped = rows.map((task) => ({
    id: task.id,
    title: task.title,
    clientId: task.client_id,
    due: task.due,
    status: task.status
  }));

  return res.json(mapped);
});

router.post('/', (req, res) => {
  const { title, clientId, due, status } = req.body;
  if (!title) {
    return res.status(400).json({ error: 'Task title is required.' });
  }
  if (due && !isValidEuDate(due)) {
    return res.status(400).json({ error: 'Invalid date format. Use dd/mm/yyyy.' });
  }

  const newTask = {
    id: makeId('t'),
    title,
    client_id: clientId ?? null,
    due: due ?? null,
    status: status ?? 'todo',
    created_at: now()
  };

  db.prepare('INSERT INTO tasks (id, title, client_id, due, status, created_at) VALUES (?, ?, ?, ?, ?, ?)').run(
    newTask.id,
    newTask.title,
    newTask.client_id,
    newTask.due,
    newTask.status,
    newTask.created_at
  );

  addAudit('task.created', newTask.id, { title: newTask.title });

  return res.status(201).json({
    id: newTask.id,
    title: newTask.title,
    clientId: newTask.client_id,
    due: newTask.due,
    status: newTask.status
  });
});

router.get('/:id', (req, res) => {
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found.' });
  }

  return res.json({
    id: task.id,
    title: task.title,
    clientId: task.client_id,
    due: task.due,
    status: task.status
  });
});

router.put('/:id', (req, res) => {
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  if (!task) {
    return res.status(404).json({ error: 'Task not found.' });
  }

  const { title, clientId, due, status } = req.body;
  if (due && !isValidEuDate(due)) {
    return res.status(400).json({ error: 'Invalid date format. Use dd/mm/yyyy.' });
  }
  const updated = {
    ...task,
    title: title ?? task.title,
    client_id: clientId ?? task.client_id,
    due: due ?? task.due,
    status: status ?? task.status
  };

  db.prepare('UPDATE tasks SET title = ?, client_id = ?, due = ?, status = ? WHERE id = ?').run(
    updated.title,
    updated.client_id,
    updated.due,
    updated.status,
    task.id
  );

  addAudit('task.updated', task.id, { title: updated.title });

  return res.json({
    id: updated.id,
    title: updated.title,
    clientId: updated.client_id,
    due: updated.due,
    status: updated.status
  });
});

router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Task not found.' });
  }

  addAudit('task.deleted', req.params.id, {});

  return res.status(204).send();
});

module.exports = router;
