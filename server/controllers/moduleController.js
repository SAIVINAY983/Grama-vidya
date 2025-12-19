const Module = require('../models/Module');
const Course = require('../models/Course');

// @desc    Get modules for a course
// @route   GET /api/modules/course/:courseId
// @access  Public
exports.getModules = async (req, res) => {
    try {
        const modules = await Module.find({ course: req.params.courseId })
            .populate('lessons')
            .sort({ order: 1 });

        res.json({ success: true, modules });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Create module
// @route   POST /api/modules
// @access  Private (Teacher/Admin)
exports.createModule = async (req, res) => {
    try {
        const course = await Course.findById(req.body.course);

        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        // Check ownership
        if (course.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        // Get next order number
        const moduleCount = await Module.countDocuments({ course: req.body.course });
        req.body.order = moduleCount;

        const module = await Module.create(req.body);

        res.status(201).json({ success: true, module });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Update module
// @route   PUT /api/modules/:id
// @access  Private (Teacher/Admin)
exports.updateModule = async (req, res) => {
    try {
        let module = await Module.findById(req.params.id).populate('course');

        if (!module) {
            return res.status(404).json({ success: false, message: 'Module not found' });
        }

        if (module.course.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        module = await Module.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.json({ success: true, module });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Delete module
// @route   DELETE /api/modules/:id
// @access  Private (Teacher/Admin)
exports.deleteModule = async (req, res) => {
    try {
        const module = await Module.findById(req.params.id).populate('course');

        if (!module) {
            return res.status(404).json({ success: false, message: 'Module not found' });
        }

        if (module.course.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        await module.deleteOne();

        res.json({ success: true, message: 'Module deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
