const Class = require('../models/Class');
const Course = require('../models/Course');

// @desc    Create a new video class
// @route   POST /api/classes
// @access  Private (Teacher/Admin)
exports.createClass = async (req, res) => {
    try {
        const { title, description, meetLink, startTime, duration, courseId } = req.body;

        // Check if course exists
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        // Verify teacher ownership
        if (course.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Not authorized to add classes to this course' });
        }

        const videoClass = await Class.create({
            title,
            description,
            meetLink,
            startTime,
            duration,
            course: courseId,
            teacher: req.user.id
        });

        res.status(201).json({ success: true, data: videoClass });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get all classes for a teacher
// @route   GET /api/classes/teacher
// @access  Private (Teacher/Admin)
exports.getTeacherClasses = async (req, res) => {
    try {
        const classes = await Class.find({ teacher: req.user.id })
            .populate('course', 'title')
            .sort('-startTime');

        res.status(200).json({ success: true, data: classes });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get classes for enrolled courses
// @route   GET /api/classes/student
// @access  Private (Student)
exports.getEnrolledClasses = async (req, res) => {
    try {
        // Find courses student is enrolled in
        const courses = await Course.find({ enrolledStudents: req.user.id });
        const courseIds = courses.map(c => c._id);

        const classes = await Class.find({
            course: { $in: courseIds },
            startTime: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Past 24 hours onwards
        })
            .populate('teacher', 'name')
            .populate('course', 'title thumbnail')
            .sort('startTime');

        res.status(200).json({ success: true, data: classes });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Update a class
// @route   PUT /api/classes/:id
// @access  Private (Teacher/Admin)
exports.updateClass = async (req, res) => {
    try {
        let videoClass = await Class.findById(req.params.id);

        if (!videoClass) {
            return res.status(404).json({ success: false, message: 'Class not found' });
        }

        // Verify ownership
        if (videoClass.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        videoClass = await Class.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: videoClass });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Delete a class
// @route   DELETE /api/classes/:id
// @access  Private (Teacher/Admin)
exports.deleteClass = async (req, res) => {
    try {
        const videoClass = await Class.findById(req.params.id);

        if (!videoClass) {
            return res.status(404).json({ success: false, message: 'Class not found' });
        }

        // Verify ownership
        if (videoClass.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ success: false, message: 'Not authorized' });
        }

        await videoClass.deleteOne();

        res.status(200).json({ success: true, message: 'Class deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
