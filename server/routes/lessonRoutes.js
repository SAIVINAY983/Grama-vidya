const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const {
    getLessons,
    getLesson,
    createLesson,
    updateLesson,
    deleteLesson,
    uploadVideo,
    uploadPdf
} = require('../controllers/lessonController');
const { protect, authorize } = require('../middleware/auth');

// Multer configuration for videos
const videoStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/videos/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const videoUpload = multer({
    storage: videoStorage,
    limits: { fileSize: 500 * 1024 * 1024 }, // 500MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /mp4|mkv|avi|mov|webm/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype) || file.mimetype.startsWith('video/');
        if (extname || mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only video files are allowed'));
    }
});

// Multer configuration for PDFs
const pdfStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/pdfs/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const pdfUpload = multer({
    storage: pdfStorage,
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            return cb(null, true);
        }
        cb(new Error('Only PDF files are allowed'));
    }
});

// Routes
router.get('/module/:moduleId', getLessons);
router.get('/:id', getLesson);
router.post('/', protect, authorize('teacher', 'admin'), createLesson);
router.put('/:id', protect, authorize('teacher', 'admin'), updateLesson);
router.delete('/:id', protect, authorize('teacher', 'admin'), deleteLesson);
router.post('/:id/video', protect, authorize('teacher', 'admin'), videoUpload.single('video'), uploadVideo);
router.post('/:id/pdf', protect, authorize('teacher', 'admin'), pdfUpload.single('pdf'), uploadPdf);

module.exports = router;
