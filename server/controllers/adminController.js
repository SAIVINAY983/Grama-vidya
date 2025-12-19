const User = require('../models/User');
const Course = require('../models/Course');
const Progress = require('../models/Progress');

// @desc    Get all users (admin only)
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getUsers = async (req, res) => {
    try {
        const { role, search } = req.query;
        let query = {};

        if (role) query.role = role;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await User.find(query)
            .select('-password')
            .sort({ createdAt: -1 });

        res.json({ success: true, users });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private (Admin)
exports.updateUserRole = async (req, res) => {
    try {
        const { role } = req.body;

        if (!['student', 'teacher', 'admin'].includes(role)) {
            return res.status(400).json({ success: false, message: 'Invalid role' });
        }

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        await user.deleteOne();

        res.json({ success: true, message: 'User deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get system analytics
// @route   GET /api/admin/analytics
// @access  Private (Admin)
exports.getAnalytics = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalStudents = await User.countDocuments({ role: 'student' });
        const totalTeachers = await User.countDocuments({ role: 'teacher' });
        const totalCourses = await Course.countDocuments();
        const publishedCourses = await Course.countDocuments({ isPublished: true });

        const totalEnrollments = await Course.aggregate([
            { $project: { enrollmentCount: { $size: '$enrolledStudents' } } },
            { $group: { _id: null, total: { $sum: '$enrollmentCount' } } }
        ]);

        const completedLessons = await Progress.countDocuments({ status: 'completed' });

        // Recent activity
        const recentUsers = await User.find()
            .select('name email role createdAt')
            .sort({ createdAt: -1 })
            .limit(5);

        const recentCourses = await Course.find()
            .select('title teacher createdAt')
            .populate('teacher', 'name')
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({
            success: true,
            analytics: {
                users: {
                    total: totalUsers,
                    students: totalStudents,
                    teachers: totalTeachers
                },
                courses: {
                    total: totalCourses,
                    published: publishedCourses
                },
                enrollments: totalEnrollments[0]?.total || 0,
                completedLessons,
                recentUsers,
                recentCourses
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get all courses (admin)
// @route   GET /api/admin/courses
// @access  Private (Admin)
exports.getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find()
            .populate('teacher', 'name email')
            .sort({ createdAt: -1 });

        res.json({ success: true, courses });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
