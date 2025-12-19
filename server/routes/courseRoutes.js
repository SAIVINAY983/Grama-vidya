const express = require('express');
const router = express.Router();
const {
    getCourses,
    getCourse,
    createCourse,
    updateCourse,
    deleteCourse,
    enrollCourse,
    getMyCourses,
    getEnrolledCourses
} = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/auth');

// IMPORTANT: Specific routes must come BEFORE parameterized routes
// Otherwise /teacher/my-courses would match /:id with id="teacher"

// Protected specific routes (must be before /:id)
router.get('/teacher/my-courses', protect, authorize('teacher', 'admin'), getMyCourses);
router.get('/student/enrolled', protect, getEnrolledCourses);

// Public routes
router.get('/', getCourses);

// Course creation (must be before /:id)
router.post('/', protect, authorize('teacher', 'admin'), createCourse);

// Parameterized routes (must be LAST)
router.get('/:id', getCourse);
router.put('/:id', protect, authorize('teacher', 'admin'), updateCourse);
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteCourse);
router.post('/:id/enroll', protect, enrollCourse);

module.exports = router;
