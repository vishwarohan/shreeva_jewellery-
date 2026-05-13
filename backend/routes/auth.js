const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  register, login, getMe, updateProfile, uploadAvatar, changePassword,
  forgotPassword, verifyOtp, resetPassword,
  getAllUsers, getUser, adminUpdateUser, toggleUserStatus,
} = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public
router.post('/register', [
  body('name').notEmpty().trim(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min:6 }),
], register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);

// Protected
router.get('/me', protect, getMe);
router.put('/me', protect, updateProfile);
router.put('/me/avatar', protect, upload.single('avatar'), uploadAvatar);
router.put('/change-password', protect, changePassword);

// Admin
router.get('/users', protect, adminOnly, getAllUsers);
router.get('/users/:id', protect, adminOnly, getUser);
router.put('/users/:id', protect, adminOnly, adminUpdateUser);
router.patch('/users/:id/toggle', protect, adminOnly, toggleUserStatus);

module.exports = router;
