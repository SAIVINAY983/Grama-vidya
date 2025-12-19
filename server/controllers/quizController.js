const Quiz = require('../models/Quiz');
const Course = require('../models/Course');
const Notification = require('../models/Notification');
const User = require('../models/User');

// @desc    Create a quiz
// @route   POST /api/quizzes
// @access  Private (Teacher/Admin)
exports.createQuiz = async (req, res) => {
    try {
        const { title, courseId, questions, duration, passingMarks } = req.body;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, message: 'Course not found' });
        }

        // Verify ownership
        if (course.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        const quiz = await Quiz.create({
            title,
            course: courseId,
            questions,
            duration,
            passingMarks
        });

        // Create notifications for enrolled students
        const enrolledStudents = course.enrolledStudents;
        if (enrolledStudents && enrolledStudents.length > 0) {
            const notifications = enrolledStudents.map(studentId => ({
                user: studentId,
                message: `New quiz added to course: ${course.title}`,
                link: `/course/${courseId}`
            }));
            await Notification.insertMany(notifications);
        }

        res.status(201).json({ success: true, quiz });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get quizzes for a course
// @route   GET /api/quizzes/course/:courseId
// @access  Private
exports.getQuizzesByCourse = async (req, res) => {
    try {
        const quizzes = await Quiz.find({ course: req.params.courseId }).sort({ createdAt: -1 });
        res.json({ success: true, quizzes });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get single quiz
// @route   GET /api/quizzes/:id
// @access  Private
exports.getQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) {
            return res.status(404).json({ success: false, message: 'Quiz not found' });
        }
        res.json({ success: true, quiz });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// ... imports
const QuizResult = require('../models/QuizResult');

// ... existing functions

// @desc    Submit quiz attempt
// @route   POST /api/quizzes/:id/submit
// @access  Private (Student)
exports.submitQuiz = async (req, res) => {
    try {
        const { answers } = req.body; // Object { questionIndex: optionIndex }
        const quiz = await Quiz.findById(req.params.id);

        if (!quiz) {
            return res.status(404).json({ success: false, message: 'Quiz not found' });
        }

        let score = 0;
        quiz.questions.forEach((q, index) => {
            if (answers[index] === q.correctOption) {
                score++;
            }
        });

        const totalQuestions = quiz.questions.length;
        const percentage = (score / totalQuestions) * 100;
        const passingScore = quiz.passingMarks || 0;

        const result = await QuizResult.create({
            quiz: quiz._id,
            student: req.user.id,
            score,
            totalQuestions,
            percentage,
            passed: percentage >= passingScore // Assuming passingMarks is percentage
        });

        res.status(201).json({ success: true, result });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get quiz results
// @route   GET /api/quizzes/:id/results
// @access  Private (Teacher/Admin)
exports.getQuizResults = async (req, res) => {
    try {
        const results = await QuizResult.find({ quiz: req.params.id })
            .populate('student', 'name email')
            .sort({ attemptedAt: -1 });

        res.json({ success: true, results });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.deleteQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id).populate('course');
        if (!quiz) {
            return res.status(404).json({ success: false, message: 'Quiz not found' });
        }

        if (quiz.course.teacher.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        await quiz.deleteOne();
        res.json({ success: true, message: 'Quiz deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

