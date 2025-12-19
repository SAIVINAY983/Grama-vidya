const express = require('express');
const router = express.Router();
const {
    createQuiz,
    getQuizzesByCourse,
    getQuiz,
    deleteQuiz,
    submitQuiz,
    getQuizResults
} = require('../controllers/quizController');
const { protect, authorize } = require('../middleware/auth');

// Public/Student routes
router.get('/course/:courseId', protect, getQuizzesByCourse);
router.get('/:id', protect, getQuiz);

// Teacher/Admin routes
router.post('/', protect, authorize('teacher', 'admin'), createQuiz);
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteQuiz);
router.get('/:id/results', protect, authorize('teacher', 'admin'), getQuizResults);

// Submission route
router.post('/:id/submit', protect, submitQuiz);

module.exports = router;
