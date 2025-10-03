const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const userController = require('../controllers/user.controller');
const {
  registerValidation,
  loginValidation,
  profileUpdateValidation,
  passwordResetRequestValidation,
  passwordResetConfirmValidation
} = require('../middleware/validation');

// Public
router.post('/register', registerValidation, userController.register);
router.post('/login', loginValidation, userController.login);
router.post('/password/reset-request', passwordResetRequestValidation, userController.requestPasswordReset);
router.post('/password/reset-confirm', passwordResetConfirmValidation, userController.resetPassword);

// Protected
router.get('/profile', authenticateToken, userController.getProfile);
router.put('/profile', authenticateToken, profileUpdateValidation, userController.updateProfile);

module.exports = router;
