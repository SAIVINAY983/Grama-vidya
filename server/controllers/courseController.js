const Course = require('../models/Course');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const User = require('../models/User');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Public
exports.getCourses = async (req, res) => {
    try {
        const { category, language, difficulty, search } = req.query;
        let query = { isPublished: true };

        if (category) query.category = category;
        if (language) query.language = language;
        if (difficulty) query.difficulty = difficulty;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const courses = await Course.find(query)
            .populate('teacher', 'name')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: courses.length,
            courses
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get single course with modules and lessons
// @route   GET /api/courses/:id
// @access  Public
exports.getCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate('teacher', 'name email')
            .populate({
                path: 'modules',
                options: { sort: { order: 1 } },
                populate: {
                    path: 'lessons',
                    options: { sort: { order: 1 } }
                }
            });

        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        res.json({ success: true, course });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Create course
// @route   POST /api/courses
// @access  Private (Teacher/Admin)
exports.createCourse = async (req, res) => {
    try {
        req.body.teacher = req.user.id;
        const course = await Course.create(req.body);

        res.status(201).json({ success: true, course });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Update course
// @route   PUT /api/courses/:id
// @access  Private (Course Owner/Admin)
exports.updateCourse = async (req, res) => {
    try {
        let course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        // Check ownership
        if (course.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        course = await Course.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.json({ success: true, course });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Delete course
// @route   DELETE /api/courses/:id
// @access  Private (Course Owner/Admin)
exports.deleteCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        if (course.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        // Delete related modules and lessons
        const modules = await Module.find({ course: req.params.id });
        for (const module of modules) {
            await Lesson.deleteMany({ module: module._id });
        }
        await Module.deleteMany({ course: req.params.id });

        // Delete related quizzes and quiz results
        const Quiz = require('../models/Quiz');
        const QuizResult = require('../models/QuizResult');
        const quizzes = await Quiz.find({ course: req.params.id });
        for (const quiz of quizzes) {
            await QuizResult.deleteMany({ quiz: quiz._id });
        }
        await Quiz.deleteMany({ course: req.params.id });

        // Delete progress records
        const Progress = require('../models/Progress');
        await Progress.deleteMany({ course: req.params.id });

        // Delete community posts
        const CommunityPost = require('../models/CommunityPost');
        await CommunityPost.deleteMany({ course: req.params.id });

        // Remove course from students' enrolledCourses
        await User.updateMany(
            { enrolledCourses: req.params.id },
            { $pull: { enrolledCourses: req.params.id } }
        );

        await course.deleteOne();

        res.json({ success: true, message: 'Course deleted and related data cleaned up' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Enroll in course
// @route   POST /api/courses/:id/enroll
// @access  Private (Student)
exports.enrollCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);

        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        // Check if already enrolled
        if (course.enrolledStudents.includes(req.user.id)) {
            return res.status(400).json({ success: false, message: 'Already enrolled' });
        }

        course.enrolledStudents.push(req.user.id);
        await course.save();

        await User.findByIdAndUpdate(req.user.id, {
            $push: { enrolledCourses: course._id }
        });

        res.json({ success: true, message: 'Enrolled successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get teacher's courses
// @route   GET /api/courses/my-courses
// @access  Private (Teacher)
exports.getMyCourses = async (req, res) => {
    try {
        const courses = await Course.find({ teacher: req.user.id })
            .populate('modules')
            .sort({ createdAt: -1 });

        res.json({ success: true, courses });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get recommended courses for student
// @route   GET /api/courses/recommended
// @access  Private (Student)
exports.getRecommendedCourses = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        // Get courses not enrolled in, published, limit 3
        const courses = await Course.find({
            _id: { $nin: user.enrolledCourses },
            isPublished: true
        })
            .select('title description thumbnail category difficulty rating price')
            .populate('teacher', 'name')
            .limit(3);

        res.json({ success: true, courses });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get enrolled courses for student
// @route   GET /api/courses/enrolled
// @access  Private (Student)
exports.getEnrolledCourses = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate({
            path: 'enrolledCourses',
            populate: { path: 'teacher', select: 'name' }
        });

        res.json({ success: true, courses: user.enrolledCourses });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Download all PDF materials for a course as a ZIP
// @route   GET /api/courses/:id/download-materials
// @access  Private (Enrolled Student / Teacher / Admin)
exports.downloadCourseMaterials = async (req, res) => {
    try {
        const archiver = require('archiver');
        const path = require('path');
        const fs = require('fs');

        const courseId = req.params.id;

        // Fetch course with modules and lessons
        const course = await Course.findById(courseId).populate({
            path: 'modules',
            populate: { path: 'lessons' }
        });

        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        // Check access: enrolled student, teacher, or admin
        const isEnrolled = course.enrolledStudents.some(
            s => s.toString() === req.user.id
        );
        const isTeacherOrAdmin = req.user.role === 'teacher' || req.user.role === 'admin';

        if (!isEnrolled && !isTeacherOrAdmin) {
            return res.status(403).json({ success: false, message: 'Enroll in the course to download materials' });
        }

        // Collect all PDFs from lessons
        const uploadDir = path.join(__dirname, '..', 'uploads');
        const pdfFiles = [];

        for (const module of course.modules || []) {
            for (const lesson of module.lessons || []) {
                if (lesson.pdfUrl) {
                    // pdfUrl is like /uploads/pdf-filename.pdf
                    const filename = path.basename(lesson.pdfUrl);
                    const filePath = path.join(uploadDir, filename);
                    if (fs.existsSync(filePath)) {
                        pdfFiles.push({
                            path: filePath,
                            name: `${module.title}/${lesson.title}.pdf`
                        });
                    }
                }
            }
        }

        if (pdfFiles.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No downloadable PDF materials found for this course'
            });
        }

        // Set response headers for ZIP download
        const safeName = course.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="${safeName}_materials.zip"`);

        // Create and stream ZIP
        const archive = archiver('zip', { zlib: { level: 6 } });
        archive.on('error', (err) => { throw err; });
        archive.pipe(res);

        for (const file of pdfFiles) {
            archive.file(file.path, { name: file.name });
        }

        await archive.finalize();
    } catch (error) {
        console.error('Error creating ZIP:', error);
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: 'Failed to create download package' });
        }
    }
};

