const Review = require('../models/Review');
const Course = require('../models/Course');

// @desc    Add review
// @route   POST /api/reviews/:courseId
// @access  Private
exports.addReview = async (req, res) => {
    try {
        req.body.course = req.params.courseId;
        req.body.user = req.user.id;

        const course = await Course.findById(req.params.courseId);

        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        // Check if user already reviewed this course
        const existingReview = await Review.findOne({
            course: req.params.courseId,
            user: req.user.id
        });

        if (existingReview) {
            return res.status(400).json({ success: false, message: 'You have already reviewed this course' });
        }

        const review = await Review.create(req.body);

        res.status(201).json({
            success: true,
            review
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get course reviews
// @route   GET /api/reviews/:courseId
// @access  Public
exports.getCourseReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ course: req.params.courseId })
            .populate('user', 'name avatar')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: reviews.length,
            reviews
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ success: false, message: 'Review not found' });
        }

        // Make sure review belongs to user or user is admin
        if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        await Review.findOneAndDelete({ _id: req.params.id });

        res.json({
            success: true,
            message: 'Review deleted'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
