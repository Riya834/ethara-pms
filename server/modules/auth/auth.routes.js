const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const controller = require('./auth.controller');
const { registerRules, loginRules, forgotPasswordRules, resetPasswordRules } = require('./auth.validation');
const validate = require('../../middleware/validate');
const verifyToken = require('../../middleware/auth');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many login attempts. Try again in 15 minutes.' },
});

router.post('/register', registerRules, validate, controller.register);
router.post('/login', loginLimiter, loginRules, validate, controller.login);
router.post('/logout', verifyToken, controller.logout);
router.post('/refresh-token', controller.refreshToken);
router.post('/forgot-password', forgotPasswordRules, validate, controller.forgotPassword);
router.post('/reset-password', resetPasswordRules, validate, controller.resetPassword);
router.get('/me', verifyToken, controller.getMe);

module.exports = router;
