const bcrypt = require('bcryptjs');
const { db, makeId, addAudit, now } = require('./db');

const DEMO_EMAIL = 'demo@example.com';
const DEMO_PASSWORD = 'demo123';

const main = async () => {
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(DEMO_EMAIL);
  if (existing) {
    // eslint-disable-next-line no-console
    console.log('Demo user already exists.');
    return;
  }

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const user = {
    id: makeId('u'),
    name: 'Demo User',
    email: DEMO_EMAIL,
    password_hash: passwordHash,
    role: 'admin',
    created_at: now()
  };

  db.prepare(
    'INSERT INTO users (id, name, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(user.id, user.name, user.email, user.password_hash, user.role, user.created_at);

  addAudit('user.seeded', user.id, { email: user.email });

  // eslint-disable-next-line no-console
  console.log('Demo user created:', user.email);
};

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
