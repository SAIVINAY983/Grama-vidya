const express = require('express');
const router = express.Router();
const {
    createClass,
    getTeacherClasses,
    getEnrolledClasses,
    updateClass,
    deleteClass
} = require('../controllers/classController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.post('/', authorize('teacher', 'admin'), createClass);
router.get('/teacher', authorize('teacher', 'admin'), getTeacherClasses);
router.get('/student', getEnrolledClasses);
router.put('/:id', authorize('teacher', 'admin'), updateClass);
router.delete('/:id', authorize('teacher', 'admin'), deleteClass);

module.exports = router;
