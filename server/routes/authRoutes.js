const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const {
    register,
    login,
    getMe,
    updateProfile,
    toggleWishlist,
    getWishlist,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendOTP,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Validation rules
const registerValidation = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('phone').matches(/^[6789][0-9]{9}$/).withMessage('Please provide a valid 10-digit mobile number (e.g., 9876543210)'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['student', 'teacher']).withMessage('Invalid role')
];

const loginValidation = [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required')
];

// Routes
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.post('/forgot-password', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
router.post('/verify-email', verifyEmail);
router.post('/resend-otp', resendOTP);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/wishlist/:courseId', protect, toggleWishlist);
router.get('/wishlist', protect, getWishlist);

module.exports = router;
