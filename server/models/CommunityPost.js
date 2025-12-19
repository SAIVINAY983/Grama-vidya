const mongoose = require('mongoose');

const communityPostSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: [true, 'Please add a message'],
        maxlength: [1000, 'Message cannot be more than 1000 characters']
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    },
    parentPost: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CommunityPost'
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    isAnswer: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for replies
communityPostSchema.virtual('replies', {
    ref: 'CommunityPost',
    localField: '_id',
    foreignField: 'parentPost',
    justOne: false
});

module.exports = mongoose.model('CommunityPost', communityPostSchema);
