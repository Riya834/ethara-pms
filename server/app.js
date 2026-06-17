require('./config/env'); // validate env first
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');
const { clientUrl } = require('./config/env');

const app = express();

// Security & logging
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(morgan('dev'));
app.use(cors({
  origin: clientUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/v1/auth', require('./modules/auth/auth.routes'));
app.use('/api/v1/users', require('./modules/user/user.routes'));
app.use('/api/v1/projects', require('./modules/project/project.routes'));
app.use('/api/v1/tasks', require('./modules/task/task.routes'));
app.use('/api/v1/teams', require('./modules/team/team.routes'));
app.use('/api/v1/notifications', require('./modules/notification/notification.routes'));
app.use('/api/v1/dashboard', require('./modules/dashboard/dashboard.routes'));

app.get('/api/v1/health', (req, res) => res.json({ status: 'ok', time: new Date() }));
app.get('/', (req, res) => {
  res.json({
    message: 'Ethara PMS API is running',
    version: 'v1'
  });
});
// Global error handler
app.use(require('./middleware/errorHandler'));

module.exports = app;
