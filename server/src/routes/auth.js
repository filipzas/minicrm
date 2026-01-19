const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db, makeId, addAudit, now } = require('../db');

const router = express.Router();

const createToken = (user) =>
  jwt.sign({ sub: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });

router.post('/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    return res.status(409).json({ error: 'Email already registered.' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const countRow = db.prepare('SELECT COUNT(*) as count FROM users').get();
  const firstUser = countRow.count === 0;
  const finalRole = firstUser ? role ?? 'admin' : 'user';

  const newUser = {
    id: makeId('u'),
    name,
    email,
    password_hash: passwordHash,
    role: finalRole,
    created_at: now()
  };

  db.prepare(
    'INSERT INTO users (id, name, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(newUser.id, newUser.name, newUser.email, newUser.password_hash, newUser.role, newUser.created_at);

  addAudit('user.registered', newUser.id, { email });

  const token = createToken({ id: newUser.id, role: newUser.role });
  return res.status(201).json({
    user: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
    token
  });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  addAudit('user.logged_in', user.id, { email });
  const token = createToken(user);

  return res.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    token
  });
});

module.exports = router;
