const express = require('express');
const { db, makeId, addAudit, now } = require('../db');
const { isValidEuDate } = require('../validators/date');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/', (req, res) => {
  const { q, status, owner } = req.query;
  const filters = [];
  const params = [];

  if (q) {
    filters.push('LOWER(name) LIKE ?');
    params.push(`%${String(q).toLowerCase()}%`);
  }

  if (status) {
    filters.push('status = ?');
    params.push(status);
  }

  if (owner) {
    filters.push('owner = ?');
    params.push(owner);
  }

  const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
  const rows = db.prepare(`SELECT * FROM clients ${whereClause}`).all(...params);
  const mapped = rows.map((client) => ({
    id: client.id,
    name: client.name,
    industry: client.industry,
    owner: client.owner,
    status: client.status,
    lastTouch: client.last_touch
  }));

  return res.json(mapped);
});

router.post('/', (req, res) => {
  const { name, industry, owner, status, lastTouch } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Client name is required.' });
  }
  if (lastTouch && !isValidEuDate(lastTouch)) {
    return res.status(400).json({ error: 'Invalid date format. Use dd/mm/yyyy.' });
  }

  const newClient = {
    id: makeId('c'),
    name,
    industry: industry ?? 'General',
    owner: owner ?? 'Unassigned',
    status: status ?? 'lead',
    last_touch: lastTouch ?? 'Today',
    created_at: now()
  };

  db.prepare(
    'INSERT INTO clients (id, name, industry, owner, status, last_touch, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(
    newClient.id,
    newClient.name,
    newClient.industry,
    newClient.owner,
    newClient.status,
    newClient.last_touch,
    newClient.created_at
  );

  addAudit('client.created', newClient.id, { name: newClient.name });

  return res.status(201).json({
    id: newClient.id,
    name: newClient.name,
    industry: newClient.industry,
    owner: newClient.owner,
    status: newClient.status,
    lastTouch: newClient.last_touch
  });
});

router.get('/:id', (req, res) => {
  const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(req.params.id);
  if (!client) {
    return res.status(404).json({ error: 'Client not found.' });
  }

  return res.json({
    id: client.id,
    name: client.name,
    industry: client.industry,
    owner: client.owner,
    status: client.status,
    lastTouch: client.last_touch
  });
});

router.put('/:id', (req, res) => {
  const client = db.prepare('SELECT * FROM clients WHERE id = ?').get(req.params.id);
  if (!client) {
    return res.status(404).json({ error: 'Client not found.' });
  }

  const { name, industry, owner, status, lastTouch } = req.body;
  if (lastTouch && !isValidEuDate(lastTouch)) {
    return res.status(400).json({ error: 'Invalid date format. Use dd/mm/yyyy.' });
  }
  const updated = {
    ...client,
    name: name ?? client.name,
    industry: industry ?? client.industry,
    owner: owner ?? client.owner,
    status: status ?? client.status,
    last_touch: lastTouch ?? client.last_touch
  };

  db.prepare(
    'UPDATE clients SET name = ?, industry = ?, owner = ?, status = ?, last_touch = ? WHERE id = ?'
  ).run(updated.name, updated.industry, updated.owner, updated.status, updated.last_touch, client.id);

  addAudit('client.updated', client.id, { name: updated.name });

  return res.json({
    id: updated.id,
    name: updated.name,
    industry: updated.industry,
    owner: updated.owner,
    status: updated.status,
    lastTouch: updated.last_touch
  });
});

router.delete('/:id', requireRole('admin'), (req, res) => {
  const result = db.prepare('DELETE FROM clients WHERE id = ?').run(req.params.id);
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Client not found.' });
  }

  addAudit('client.deleted', req.params.id, {});

  return res.status(204).send();
});

module.exports = router;
