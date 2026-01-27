const express = require('express');
const router = express.Router();
const {
    addReview,
    getCourseReviews,
    deleteReview
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.get('/:courseId', getCourseReviews);
router.post('/:courseId', protect, addReview);
router.delete('/:id', protect, deleteReview);

module.exports = router;
