const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const authRoutes = require('./routes/auth');
const clientsRoutes = require('./routes/clients');
const leadsRoutes = require('./routes/leads');
const tasksRoutes = require('./routes/tasks');
const dashboardRoutes = require('./routes/dashboard');
const auditRoutes = require('./routes/audit');
const { authRequired, requireRole } = require('./middleware/auth');

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN ?? '*', credentials: true }));
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/auth', authRoutes);

app.use('/dashboard', authRequired, dashboardRoutes);
app.use('/clients', authRequired, clientsRoutes);
app.use('/leads', authRequired, leadsRoutes);
app.use('/tasks', authRequired, tasksRoutes);
app.use('/audit', authRequired, requireRole('admin'), auditRoutes);

const distPath = path.resolve(__dirname, '..', '..', 'build');
app.use(express.static(distPath));
app.get('*', (req, res, next) => {
  if (req.accepts('html')) {
    return res.sendFile(path.join(distPath, 'index.html'));
  }
  return next();
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

module.exports = app;
