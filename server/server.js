const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const moduleRoutes = require('./routes/moduleRoutes');
const lessonRoutes = require('./routes/lessonRoutes');
const progressRoutes = require('./routes/progressRoutes');
const communityRoutes = require('./routes/communityRoutes');
const adminRoutes = require('./routes/adminRoutes');
const quizRoutes = require('./routes/quizRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');

// Create Express app
const app = express();

// Connect to database
connectDB();

// Create upload directories if they don't exist
const uploadDirs = ['uploads', 'uploads/videos', 'uploads/pdfs', 'uploads/thumbnails'];
uploadDirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'Gram Vidya API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);

    // Multer errors
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
            success: false,
            message: 'File size is too large'
        });
    }

    res.status(500).json({
        success: false,
        message: err.message || 'Server Error'
    });
});


// 404 handler for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
    // Set static folder
    app.use(express.static(path.join(__dirname, '../client/dist')));

    // Any other route loads the index.html
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../client/dist', 'index.html'));
    });
} else {
    // 404 handler for non-API routes in development
    app.use((req, res) => {
        res.status(404).json({
            success: false,
            message: 'Route not found'
        });
    });
}

const http = require('http');
const { initSocket } = require('./socket');

// ... (imports remain the same)

const PORT = process.env.PORT || 5000;

const httpServer = http.createServer(app);
const io = initSocket(httpServer);

if (require.main === module) {
    httpServer.listen(PORT, () => {
        console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║         🎓 Gram Vidya Server Started 🎓               ║
║                                                       ║
║    Rural Education Platform Backend                   ║
║    Running on port ${PORT}                              ║
║    Socket.io:   Initialized                           ║
║                                                       ║
║    API Endpoints:                                     ║
║    • Auth:      /api/auth                             ║
║    • Courses:   /api/courses                          ║
║    • Modules:   /api/modules                          ║
║    • Lessons:   /api/lessons                          ║
║    • Progress:  /api/progress                         ║
║    • Community: /api/community                        ║
║    • Admin:     /api/admin                            ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);
    });
}

module.exports = app;
