const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rating: {
        type: Number,
        required: [true, 'Please add a rating between 1 and 5'],
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: [true, 'Please add a comment'],
        maxlength: [500, 'Comment cannot be more than 500 characters']
    }
}, {
    timestamps: true
});

// Prevent user from submitting more than one review per course
reviewSchema.index({ course: 1, user: 1 }, { unique: true });

// Static method to get average rating and save it to Course model
reviewSchema.statics.getAverageRating = async function (courseId) {
    const obj = await this.aggregate([
        {
            $match: { course: courseId }
        },
        {
            $group: {
                _id: '$course',
                avgRating: { $avg: '$rating' },
                numReviews: { $count: {} }
            }
        }
    ]);

    try {
        if (obj.length > 0) {
            await mongoose.model('Course').findByIdAndUpdate(courseId, {
                avgRating: Math.round(obj[0].avgRating * 10) / 10,
                numReviews: obj[0].numReviews
            });
        } else {
            await mongoose.model('Course').findByIdAndUpdate(courseId, {
                avgRating: 0,
                numReviews: 0
            });
        }
    } catch (err) {
        console.error(err);
    }
};

// Call getAverageRating after save
reviewSchema.post('save', function () {
    this.constructor.getAverageRating(this.course);
});

// Call getAverageRating before remove (Note: Use findOneAndDelete in controller)
reviewSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await doc.constructor.getAverageRating(doc.course);
    }
});

module.exports = mongoose.model('Review', reviewSchema);
