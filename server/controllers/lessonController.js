const Lesson = require('../models/Lesson');
const Module = require('../models/Module');
const Course = require('../models/Course');
const fs = require('fs');
const path = require('path');

// @desc    Get lessons for a module
// @route   GET /api/lessons/module/:moduleId
// @access  Public
exports.getLessons = async (req, res) => {
    try {
        const lessons = await Lesson.find({ module: req.params.moduleId })
            .sort({ order: 1 });

        res.json({ success: true, lessons });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get single lesson
// @route   GET /api/lessons/:id
// @access  Public
exports.getLesson = async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.id)
            .populate({
                path: 'module',
                populate: { path: 'course' }
            });

        if (!lesson) {
            return res.status(404).json({ success: false, message: 'Lesson not found' });
        }

        res.json({ success: true, lesson });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Create lesson
// @route   POST /api/lessons
// @access  Private (Teacher/Admin)
exports.createLesson = async (req, res) => {
    try {
        const module = await Module.findById(req.body.module).populate('course');

        if (!module) {
            return res.status(404).json({ success: false, message: 'Module not found' });
        }

        if (module.course.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        // Get next order number
        const lessonCount = await Lesson.countDocuments({ module: req.body.module });
        req.body.order = lessonCount;

        const lesson = await Lesson.create(req.body);

        res.status(201).json({ success: true, lesson });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Update lesson
// @route   PUT /api/lessons/:id
// @access  Private (Teacher/Admin)
exports.updateLesson = async (req, res) => {
    try {
        let lesson = await Lesson.findById(req.params.id).populate({
            path: 'module',
            populate: { path: 'course' }
        });

        if (!lesson) {
            return res.status(404).json({ success: false, message: 'Lesson not found' });
        }

        if (lesson.module.course.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        lesson = await Lesson.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.json({ success: true, lesson });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Delete lesson
// @route   DELETE /api/lessons/:id
// @access  Private (Teacher/Admin)
exports.deleteLesson = async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.id).populate({
            path: 'module',
            populate: { path: 'course' }
        });

        if (!lesson) {
            return res.status(404).json({ success: false, message: 'Lesson not found' });
        }

        if (lesson.module.course.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        // Delete uploaded files
        if (lesson.videoType === 'upload' && lesson.videoUrl) {
            const videoPath = path.join(__dirname, '..', lesson.videoUrl);
            if (fs.existsSync(videoPath)) {
                fs.unlinkSync(videoPath);
            }
        }
        if (lesson.pdfUrl) {
            const pdfPath = path.join(__dirname, '..', lesson.pdfUrl);
            if (fs.existsSync(pdfPath)) {
                fs.unlinkSync(pdfPath);
            }
        }

        await lesson.deleteOne();

        res.json({ success: true, message: 'Lesson deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Upload video for lesson
// @route   POST /api/lessons/:id/video
// @access  Private (Teacher/Admin)
exports.uploadVideo = async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.id).populate({
            path: 'module',
            populate: { path: 'course' }
        });

        if (!lesson) {
            return res.status(404).json({ success: false, message: 'Lesson not found' });
        }

        if (lesson.module.course.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload a video file' });
        }

        // Delete old video if exists
        if (lesson.videoType === 'upload' && lesson.videoUrl) {
            const oldPath = path.join(__dirname, '..', lesson.videoUrl);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }

        lesson.videoType = 'upload';
        lesson.videoUrl = `/uploads/videos/${req.file.filename}`;
        await lesson.save();

        res.json({ success: true, lesson });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Upload PDF for lesson
// @route   POST /api/lessons/:id/pdf
// @access  Private (Teacher/Admin)
exports.uploadPdf = async (req, res) => {
    try {
        const lesson = await Lesson.findById(req.params.id).populate({
            path: 'module',
            populate: { path: 'course' }
        });

        if (!lesson) {
            return res.status(404).json({ success: false, message: 'Lesson not found' });
        }

        if (lesson.module.course.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload a PDF file' });
        }

        // Delete old PDF if exists
        if (lesson.pdfUrl) {
            const oldPath = path.join(__dirname, '..', lesson.pdfUrl);
            if (fs.existsSync(oldPath)) {
                fs.unlinkSync(oldPath);
            }
        }

        lesson.pdfUrl = `/uploads/pdfs/${req.file.filename}`;
        lesson.pdfName = req.file.originalname;
        await lesson.save();

        res.json({ success: true, lesson });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
