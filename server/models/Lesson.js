const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a lesson title'],
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    description: {
        type: String,
        maxlength: [500, 'Description cannot be more than 500 characters']
    },
    module: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Module',
        required: true
    },
    videoType: {
        type: String,
        enum: ['youtube', 'upload', 'none'],
        default: 'none'
    },
    videoUrl: {
        type: String,
        default: ''
    },
    youtubeId: {
        type: String,
        default: ''
    },
    pdfUrl: {
        type: String,
        default: ''
    },
    pdfName: {
        type: String,
        default: ''
    },
    duration: {
        type: Number,
        default: 0,
        min: 0
    },
    order: {
        type: Number,
        default: 0
    },
    isPreview: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Extract YouTube ID from URL
lessonSchema.pre('save', function (next) {
    if (this.videoType === 'youtube' && this.videoUrl) {
        const match = this.videoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
        if (match) {
            this.youtubeId = match[1];
        }
    }
    next();
});

module.exports = mongoose.model('Lesson', lessonSchema);
