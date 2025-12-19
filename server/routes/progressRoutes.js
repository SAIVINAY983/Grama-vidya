const express = require('express');
const router = express.Router();
const {
    getCourseProgress,
    updateProgress,
    getMyProgress
} = require('../controllers/progressController');
const { protect } = require('../middleware/auth');

router.get('/course/:courseId', protect, getCourseProgress);
router.get('/my-progress', protect, getMyProgress);
router.post('/lesson/:lessonId', protect, updateProgress);

module.exports = router;
