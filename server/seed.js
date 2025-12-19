const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Course = require('./models/Course');
const Module = require('./models/Module');
const Lesson = require('./models/Lesson');
const CommunityPost = require('./models/CommunityPost');

const connectDB = require('./config/db');

const seedDatabase = async () => {
    try {
        await connectDB();

        // Clear existing data
        await User.deleteMany({});
        await Course.deleteMany({});
        await Module.deleteMany({});
        await Lesson.deleteMany({});
        await CommunityPost.deleteMany({});

        console.log('Cleared existing data...');

        // Create users
        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@gramvidya.com',
            phone: '9876543210',
            password: 'admin123',
            role: 'admin'
        });

        const teacher1 = await User.create({
            name: 'Priya Sharma',
            email: 'priya@gramvidya.com',
            phone: '9876543211',
            password: 'teacher123',
            role: 'teacher'
        });

        const teacher2 = await User.create({
            name: 'Rajesh Kumar',
            email: 'rajesh@gramvidya.com',
            phone: '9876543212',
            password: 'teacher123',
            role: 'teacher'
        });

        const student1 = await User.create({
            name: 'Amit Patel',
            email: 'amit@gramvidya.com',
            phone: '9876543213',
            password: 'student123',
            role: 'student'
        });

        const student2 = await User.create({
            name: 'Sunita Devi',
            email: 'sunita@gramvidya.com',
            phone: '9876543214',
            password: 'student123',
            role: 'student'
        });

        console.log('Created users...');

        // Create courses
        const course1 = await Course.create({
            title: 'Basic Mathematics for Rural Students',
            description: 'Learn fundamental mathematics concepts including arithmetic, algebra, and geometry. This course is designed for students in rural areas with simple explanations and practical examples.',
            category: 'mathematics',
            language: 'hindi',
            difficulty: 'beginner',
            teacher: teacher1._id,
            isPublished: true,
            enrolledStudents: [student1._id, student2._id]
        });

        const course2 = await Course.create({
            title: 'Introduction to Computer Skills',
            description: 'Learn basic computer skills including using a keyboard, mouse, and common applications. Perfect for first-time computer users.',
            category: 'computer',
            language: 'english',
            difficulty: 'beginner',
            teacher: teacher2._id,
            isPublished: true,
            enrolledStudents: [student1._id]
        });

        const course3 = await Course.create({
            title: 'English Speaking Course',
            description: 'Improve your English speaking skills with practical conversations and vocabulary. Learn to communicate confidently in English.',
            category: 'language',
            language: 'english',
            difficulty: 'beginner',
            teacher: teacher1._id,
            isPublished: true,
            enrolledStudents: [student2._id]
        });

        console.log('Created courses...');

        // Create modules for Course 1
        const module1_1 = await Module.create({
            title: 'Numbers and Counting',
            description: 'Learn about numbers from 1 to 100',
            course: course1._id,
            order: 0
        });

        const module1_2 = await Module.create({
            title: 'Basic Addition and Subtraction',
            description: 'Learn to add and subtract numbers',
            course: course1._id,
            order: 1
        });

        // Create modules for Course 2
        const module2_1 = await Module.create({
            title: 'Getting Started with Computers',
            description: 'Introduction to computer parts and setup',
            course: course2._id,
            order: 0
        });

        const module2_2 = await Module.create({
            title: 'Using Keyboard and Mouse',
            description: 'Learn to use input devices',
            course: course2._id,
            order: 1
        });

        // Create modules for Course 3
        const module3_1 = await Module.create({
            title: 'Basic Greetings',
            description: 'Learn common English greetings',
            course: course3._id,
            order: 0
        });

        console.log('Created modules...');

        // Create lessons with YouTube videos
        await Lesson.create({
            title: 'Introduction to Numbers',
            description: 'Learn to count from 1 to 10',
            module: module1_1._id,
            videoType: 'youtube',
            videoUrl: 'https://www.youtube.com/watch?v=D0Ajq682yrA',
            duration: 600,
            order: 0,
            isPreview: true
        });

        await Lesson.create({
            title: 'Counting from 11 to 50',
            description: 'Continue learning numbers',
            module: module1_1._id,
            videoType: 'youtube',
            videoUrl: 'https://www.youtube.com/watch?v=Rd_1lTrGT8E',
            duration: 480,
            order: 1
        });

        await Lesson.create({
            title: 'Simple Addition',
            description: 'Learn to add two numbers',
            module: module1_2._id,
            videoType: 'youtube',
            videoUrl: 'https://www.youtube.com/watch?v=Fe8u2I3vmHU',
            duration: 720,
            order: 0
        });

        await Lesson.create({
            title: 'What is a Computer?',
            description: 'Introduction to computers and their uses',
            module: module2_1._id,
            videoType: 'youtube',
            videoUrl: 'https://www.youtube.com/watch?v=Cu3R5it4cQs',
            duration: 540,
            order: 0,
            isPreview: true
        });

        await Lesson.create({
            title: 'Parts of a Computer',
            description: 'Learn about monitor, keyboard, mouse, and CPU',
            module: module2_1._id,
            videoType: 'youtube',
            videoUrl: 'https://www.youtube.com/watch?v=Rdm8E59L8Og',
            duration: 600,
            order: 1
        });

        await Lesson.create({
            title: 'Using the Mouse',
            description: 'Learn click, double-click, and drag',
            module: module2_2._id,
            videoType: 'youtube',
            videoUrl: 'https://www.youtube.com/watch?v=cDQAxwjfNgE',
            duration: 420,
            order: 0
        });

        await Lesson.create({
            title: 'Hello and Goodbye',
            description: 'Learn common greetings in English',
            module: module3_1._id,
            videoType: 'youtube',
            videoUrl: 'https://www.youtube.com/watch?v=tVlcKp3bWH8',
            duration: 360,
            order: 0,
            isPreview: true
        });

        console.log('Created lessons...');

        // Update student enrolled courses
        await User.findByIdAndUpdate(student1._id, {
            enrolledCourses: [course1._id, course2._id]
        });

        await User.findByIdAndUpdate(student2._id, {
            enrolledCourses: [course1._id, course3._id]
        });

        // Create community posts
        await CommunityPost.create({
            user: student1._id,
            message: 'नमस्ते! I am new here and excited to learn mathematics. Can anyone suggest which course to start with?',
            course: course1._id
        });

        await CommunityPost.create({
            user: teacher1._id,
            message: 'Welcome to Gram Vidya! Feel free to ask any questions about the courses. We are here to help you learn.',
        });

        await CommunityPost.create({
            user: student2._id,
            message: 'The English speaking course is very helpful. I am learning new words every day!',
            course: course3._id
        });

        console.log('Created community posts...');

        console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║         ✅ Database Seeded Successfully! ✅           ║
║                                                       ║
║    Created:                                           ║
║    • 1 Admin: admin@gramvidya.com / admin123          ║
║    • 2 Teachers:                                      ║
║      - priya@gramvidya.com / teacher123               ║
║      - rajesh@gramvidya.com / teacher123              ║
║    • 2 Students:                                      ║
║      - amit@gramvidya.com / student123                ║
║      - sunita@gramvidya.com / student123              ║
║    • 3 Courses with modules and lessons               ║
║    • Community posts                                  ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
    `);

        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();
