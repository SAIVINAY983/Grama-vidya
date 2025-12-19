const Progress = require('../models/Progress');
const Lesson = require('../models/Lesson');
const Course = require('../models/Course');

// @desc    Get student progress for a course
// @route   GET /api/progress/course/:courseId
// @access  Private
exports.getCourseProgress = async (req, res) => {
    try {
        const progress = await Progress.find({
            student: req.user.id,
            course: req.params.courseId
        }).populate('lesson');

        const totalLessons = await Lesson.countDocuments({
            module: { $in: await getModuleIds(req.params.courseId) }
        });

        const completedLessons = progress.filter(p => p.status === 'completed').length;
        const percentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

        res.json({
            success: true,
            progress,
            stats: {
                total: totalLessons,
                completed: completedLessons,
                percentage
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// Helper function to get module IDs for a course
async function getModuleIds(courseId) {
    const Module = require('../models/Module');
    const modules = await Module.find({ course: courseId });
    return modules.map(m => m._id);
}

// @desc    Update lesson progress
// @route   POST /api/progress/lesson/:lessonId
// @access  Private
exports.updateProgress = async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.lessonId).populate({
            path: 'module',
            populate: { path: 'course' }
        });

        if (!lesson) {
            return res.status(404).json({ success: false, message: 'Lesson not found' });
        }

        const { status, watchTime } = req.body;

        let progress = await Progress.findOne({
            student: req.user.id,
            lesson: req.params.lessonId
        });

        if (progress) {
            progress.status = status || progress.status;
            if (watchTime) progress.watchTime = watchTime;
            if (status === 'completed') progress.completedAt = new Date();
            await progress.save();
        } else {
            progress = await Progress.create({
                student: req.user.id,
                lesson: req.params.lessonId,
                course: lesson.module.course._id,
                status: status || 'in-progress',
                watchTime: watchTime || 0,
                completedAt: status === 'completed' ? new Date() : null
            });
        }

        res.json({ success: true, progress });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get all progress for current student
// @route   GET /api/progress/my-progress
// @access  Private
exports.getMyProgress = async (req, res) => {
    try {
        const progress = await Progress.find({ student: req.user.id })
            .populate('lesson')
            .populate('course', 'title');

        res.json({ success: true, progress });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
