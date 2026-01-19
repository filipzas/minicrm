const express = require('express');
const { db, makeId, addAudit, now } = require('../db');

const router = express.Router();

router.get('/', (req, res) => {
  const { q, stage, owner } = req.query;
  const filters = [];
  const params = [];

  if (q) {
    filters.push('LOWER(name) LIKE ?');
    params.push(`%${String(q).toLowerCase()}%`);
  }

  if (stage) {
    filters.push('stage = ?');
    params.push(stage);
  }

  if (owner) {
    filters.push('owner = ?');
    params.push(owner);
  }

  const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
  const rows = db.prepare(`SELECT * FROM leads ${whereClause}`).all(...params);

  return res.json(rows);
});

router.post('/', (req, res) => {
  const { name, stage, value, owner } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Lead name is required.' });
  }

  const newLead = {
    id: makeId('l'),
    name,
    stage: stage ?? 'discovery',
    value: value ?? 0,
    owner: owner ?? 'Unassigned',
    created_at: now()
  };

  db.prepare('INSERT INTO leads (id, name, stage, value, owner, created_at) VALUES (?, ?, ?, ?, ?, ?)').run(
    newLead.id,
    newLead.name,
    newLead.stage,
    newLead.value,
    newLead.owner,
    newLead.created_at
  );

  addAudit('lead.created', newLead.id, { name: newLead.name });

  return res.status(201).json(newLead);
});

router.get('/:id', (req, res) => {
  const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(req.params.id);
  if (!lead) {
    return res.status(404).json({ error: 'Lead not found.' });
  }
  return res.json(lead);
});

router.put('/:id', (req, res) => {
  const lead = db.prepare('SELECT * FROM leads WHERE id = ?').get(req.params.id);
  if (!lead) {
    return res.status(404).json({ error: 'Lead not found.' });
  }

  const { name, stage, value, owner } = req.body;
  const updated = {
    ...lead,
    name: name ?? lead.name,
    stage: stage ?? lead.stage,
    value: value ?? lead.value,
    owner: owner ?? lead.owner
  };

  db.prepare('UPDATE leads SET name = ?, stage = ?, value = ?, owner = ? WHERE id = ?').run(
    updated.name,
    updated.stage,
    updated.value,
    updated.owner,
    lead.id
  );

  addAudit('lead.updated', lead.id, { name: updated.name });

  return res.json(updated);
});

router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM leads WHERE id = ?').run(req.params.id);
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Lead not found.' });
  }

  addAudit('lead.deleted', req.params.id, {});

  return res.status(204).send();
});

module.exports = router;
