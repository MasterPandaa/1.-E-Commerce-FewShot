const { validationResult } = require('express-validator');
const userService = require('../services/user.service');

exports.register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password, name } = req.body;
    const user = await userService.createUser({ email, password, name });

    res.status(201).json({ success: true, message: 'User registered successfully', data: user });
  } catch (error) {
    if (error.code === 'USER_EXISTS') {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    const result = await userService.authenticate({ email, password });
    res.json({ success: true, message: 'Login successful', data: result });
  } catch (error) {
    if (error.code === 'AUTH_FAILED') {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const profile = await userService.getProfile(req.user.id);
    res.json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const profile = await userService.updateProfile(req.user.id, { name: req.body.name });
    res.json({ success: true, message: 'Profile updated', data: profile });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.requestPasswordReset = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email } = req.body;
    await userService.requestPasswordReset(email);
    res.json({ success: true, message: 'If the email exists, a reset link has been sent' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { token, password } = req.body;
    await userService.resetPassword(token, password);
    res.json({ success: true, message: 'Password has been reset' });
  } catch (error) {
    if (error.code === 'TOKEN_INVALID') {
      return res.status(400).json({ success: false, message: 'Invalid or expired token' });
    }
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
