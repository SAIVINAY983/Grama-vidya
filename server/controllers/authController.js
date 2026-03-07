const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { name, email, phone, password, role } = req.body;

        // Check if user exists
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({
                success: false,
                message: 'This email is already registered. Please go to the Login page and sign in.'
            });
        }

        const existingPhone = await User.findOne({ phone });
        if (existingPhone) {
            return res.status(400).json({
                success: false,
                message: 'This mobile number is already registered. Please use a different number or sign in.'
            });
        }

        // Create user
        const user = await User.create({
            name,
            email,
            phone,
            password,
            role: role || 'student'
        });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = crypto.createHash('sha256').update(otp).digest('hex');
        user.otpExpire = Date.now() + 10 * 60 * 1000;
        await user.save();

        try {
            await sendEmail({
                email: user.email,
                subject: 'Verify your email address',
                message: `Your verification code is: ${otp}\nIt expires in 10 minutes.`
            });
            res.status(201).json({
                success: true,
                requiresOTP: true,
                userId: user._id,
                email: user.email
            });
        } catch (err) {
            console.error(err);
            user.otp = undefined;
            user.otpExpire = undefined;
            await user.save();
            return res.status(500).json({ success: false, message: 'Email could not be sent' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

exports.verifyEmail = async (req, res) => {
    try {
        const { userId, otp } = req.body;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');


        if (user.otp !== hashedOTP) return res.status(400).json({ success: false, message: 'Invalid verification code' });
        if (user.otpExpire < Date.now()) return res.status(400).json({ success: false, message: 'Verification code has expired' });

        user.isEmailVerified = true;
        user.isPhoneVerified = true;
        user.otp = undefined;
        user.otpExpire = undefined;
        await user.save({ validateBeforeSave: false });

        const token = generateToken(user._id);
        res.json({
            success: true,
            token,
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.resendOTP = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = crypto.createHash('sha256').update(otp).digest('hex');
        user.otpExpire = Date.now() + 10 * 60 * 1000;
        await user.save({ validateBeforeSave: false });

        try {
            await sendEmail({
                email: user.email,
                subject: 'Verify your email address',
                message: `Your new verification code is: ${otp}\nIt expires in 10 minutes.`
            });
            res.status(200).json({ success: true, message: 'OTP resent successfully' });
        } catch (err) {
            return res.status(500).json({ success: false, message: 'Email could not be sent' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { email, password } = req.body;

        // Check for user
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check password
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        if (!user.isEmailVerified || !user.isPhoneVerified) {
            const otp = Math.floor(100000 + Math.random() * 900000).toString();
            user.otp = crypto.createHash('sha256').update(otp).digest('hex');
            user.otpExpire = Date.now() + 10 * 60 * 1000;
            await user.save({ validateBeforeSave: false });

            try {
                await sendEmail({
                    email: user.email,
                    subject: 'Verify your email address',
                    message: `Your verification code is: ${otp}\nIt expires in 10 minutes.`
                });
                return res.status(200).json({
                    success: true,
                    requiresOTP: true,
                    userId: user._id,
                    email: user.email,
                    message: 'Please verify your email. A new code has been sent.'
                });
            } catch (err) {
                console.error('Login OTP Email Error:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Email could not be sent'
                });
            }
        }

        // Previously teachers required an OTP to login. OTP flow removed: continue with normal login.

        const token = generateToken(user._id);

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('enrolledCourses');
        res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
    try {
        const { name, phone } = req.body;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { name, phone },
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Toggle course in wishlist
// @route   POST /api/auth/wishlist/:courseId
// @access  Private
exports.toggleWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const courseId = req.params.courseId;

        const index = user.wishlist.indexOf(courseId);
        if (index > -1) {
            // Remove from wishlist
            user.wishlist.splice(index, 1);
            await user.save();
            res.json({ success: true, message: 'Removed from wishlist', isWishlisted: false });
        } else {
            // Add to wishlist
            user.wishlist.push(courseId);
            await user.save();
            res.json({ success: true, message: 'Added to wishlist', isWishlisted: true });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get user wishlist
// @route   GET /api/auth/wishlist
// @access  Private
exports.getWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate({
            path: 'wishlist',
            populate: { path: 'teacher', select: 'name' }
        });

        res.json({
            success: true,
            wishlist: user.wishlist
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return res.status(404).json({ success: false, message: 'There is no user with that email' });
        }

        // Get reset token
        const resetToken = user.getResetPasswordToken();

        await user.save({ validateBeforeSave: false });

        // Create reset URL targeting the frontend client
        const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
        const resetUrl = `${clientUrl}/reset-password/${resetToken}`;

        const message = `You are receiving this email because you (or someone else) has requested the reset of a password.\n\nPlease click on the following link, or paste this into your browser to complete the process:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.\n`;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Password Reset Token',
                message
            });

            res.status(200).json({ success: true, data: 'Email sent' });
        } catch (err) {
            console.log(err);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;

            await user.save({ validateBeforeSave: false });

            return res.status(500).json({ success: false, message: 'Email could not be sent' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
exports.resetPassword = async (req, res) => {
    try {
        // Get hashed token
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.resettoken)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid token' });
        }

        // Set new password
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        const token = generateToken(user._id);

        res.status(200).json({
            success: true,
            token,
            message: 'Password updated successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// OTP verify route removed; login now handles all roles without OTP.
