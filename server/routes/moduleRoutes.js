const express = require('express');
const router = express.Router();
const {
    getModules,
    createModule,
    updateModule,
    deleteModule
} = require('../controllers/moduleController');
const { protect, authorize } = require('../middleware/auth');

router.get('/course/:courseId', getModules);
router.post('/', protect, authorize('teacher', 'admin'), createModule);
router.put('/:id', protect, authorize('teacher', 'admin'), updateModule);
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteModule);

module.exports = router;
