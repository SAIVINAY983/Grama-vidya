const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a class title'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    meetLink: {
        type: String,
        required: [true, 'Please add a Google Meet link'],
        match: [
            /^(https?:\/\/)?(www\.)?meet\.google\.com\/[a-z0-9-]+([\/?].*)?$/i,
            'Please provide a valid Google Meet link (e.g. https://meet.google.com/abc-defg-hij)'
        ]
    },
    startTime: {
        type: Date,
        required: [true, 'Please add a start time']
    },
    duration: {
        type: Number,
        required: [true, 'Please add duration in minutes'],
        default: 60
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    status: {
        type: String,
        enum: ['scheduled', 'live', 'completed', 'cancelled'],
        default: 'scheduled'
    },
    reminderSent: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Class', classSchema);
