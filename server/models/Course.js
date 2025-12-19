const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a course title'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
        maxlength: [1000, 'Description cannot be more than 1000 characters']
    },
    thumbnail: {
        type: String,
        default: '/images/default-course.jpg'
    },
    category: {
        type: String,
        enum: ['mathematics', 'science', 'language', 'social-studies', 'computer', 'life-skills', 'other'],
        default: 'other'
    },
    language: {
        type: String,
        enum: ['english', 'hindi', 'regional'],
        default: 'english'
    },
    difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'beginner'
    },
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    enrolledStudents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    isPublished: {
        type: Boolean,
        default: false
    },
    totalDuration: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for modules
courseSchema.virtual('modules', {
    ref: 'Module',
    localField: '_id',
    foreignField: 'course',
    justOne: false
});

module.exports = mongoose.model('Course', courseSchema);
