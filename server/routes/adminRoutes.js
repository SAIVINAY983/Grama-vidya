const express = require('express');
const router = express.Router();
const {
    getUsers,
    updateUserRole,
    deleteUser,
    getAnalytics,
    getAllCourses
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

// All admin routes require admin role
router.use(protect);
router.use(authorize('admin'));

router.get('/users', getUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);
router.get('/analytics', getAnalytics);
router.get('/courses', getAllCourses);

module.exports = router;
