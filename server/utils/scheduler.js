const cron = require('node-cron');
const Class = require('../models/Class');
const Course = require('../models/Course');
const User = require('../models/User');
const sendEmail = require('./sendEmail');

/**
 * Send email reminders to students enrolled in classes
 * starting in the next 60-75 minutes (runs every 15 min)
 */
const sendClassReminders = async () => {
    try {
        const now = new Date();
        const in60Min = new Date(now.getTime() + 60 * 60 * 1000);
        const in75Min = new Date(now.getTime() + 75 * 60 * 1000);

        // Find classes starting in 60-75 min window that haven't been reminded yet
        const upcomingClasses = await Class.find({
            startTime: { $gte: in60Min, $lte: in75Min },
            reminderSent: false,
            status: { $in: ['scheduled', 'live'] }
        }).populate('course', 'title enrolledStudents');

        if (upcomingClasses.length === 0) return;

        console.log(`[Scheduler] Found ${upcomingClasses.length} upcoming class(es) — sending email reminders...`);

        for (const videoClass of upcomingClasses) {
            const course = videoClass.course;
            if (!course || !course.enrolledStudents?.length) continue;

            // Get enrolled students with emails
            const students = await User.find({
                _id: { $in: course.enrolledStudents },
                email: { $exists: true, $ne: '' }
            }).select('name email');

            const startTimeStr = new Date(videoClass.startTime).toLocaleString('en-IN', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
                day: 'numeric',
                month: 'short',
                timeZone: 'Asia/Kolkata'
            });

            for (const student of students) {
                try {
                    await sendEmail({
                        email: student.email,
                        subject: `📚 Gram Vidya — Your class starts in 1 hour!`,
                        message:
                            `Hi ${student.name},\n\n` +
                            `This is a reminder that your class is starting soon!\n\n` +
                            `📖 Class: ${videoClass.title}\n` +
                            `📚 Course: ${course.title}\n` +
                            `🕐 Time: ${startTimeStr} IST\n` +
                            `⏱ Duration: ${videoClass.duration} minutes\n\n` +
                            `👉 Join your class here:\n${videoClass.meetLink}\n\n` +
                            `Happy Learning! 🌱\n` +
                            `— Gram Vidya Team`
                    });
                    console.log(`[Scheduler] Reminder email sent to ${student.email}`);
                } catch (emailErr) {
                    console.error(`[Scheduler] Failed to email ${student.email}:`, emailErr.message);
                }
            }

            // Mark reminder as sent to avoid duplicates
            await Class.findByIdAndUpdate(videoClass._id, { reminderSent: true });
            console.log(`[Scheduler] Reminders done for class: "${videoClass.title}" (${students.length} students)`);
        }
    } catch (error) {
        console.error('[Scheduler Error]', error.message);
    }
};

/**
 * Initialize the cron scheduler — runs every 15 minutes
 */
const initScheduler = () => {
    cron.schedule('*/15 * * * *', () => {
        console.log('[Scheduler] Checking for upcoming classes...');
        sendClassReminders();
    });

    console.log('[Scheduler] Email reminder scheduler started (runs every 15 minutes)');
};

module.exports = { initScheduler, sendClassReminders };
