const { nodeEnv } = require('../config/env');

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;

  // Only log unexpected server errors with full stack — 4xx are expected operational errors
  if (statusCode >= 500) {
    console.error('❌ Server Error:', err);
  } else if (nodeEnv === 'development') {
    console.warn(`⚠️  ${statusCode} ${req.method} ${req.path} — ${err.message}`);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return res.status(400).json({ success: false, message: 'Validation failed', errors });
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      message: `${field} already exists`,
      errors: [{ field, message: `${field} already exists` }],
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }

  const message = err.message || 'Internal server error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(nodeEnv === 'development' && statusCode >= 500 && { stack: err.stack }),
  });
};

module.exports = errorHandler;
