import { useState, useEffect } from 'react';
import { reviewAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FiStar, FiTrash2, FiMessageSquare } from 'react-icons/fi';
import toast from 'react-hot-toast';

const ReviewSection = ({ courseId }) => {
    const { user, isAuthenticated } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchReviews();
    }, [courseId]);

    const fetchReviews = async () => {
        try {
            const res = await reviewAPI.getByCourse(courseId);
            setReviews(res.data.reviews);
        } catch (err) {
            console.error('Error fetching reviews:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            toast.error('Please login to leave a review');
            return;
        }

        setSubmitting(true);
        try {
            await reviewAPI.add(courseId, { rating, comment });
            toast.success('Review added successfully!');
            setComment('');
            setRating(5);
            fetchReviews();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error adding review');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this review?')) return;
        try {
            await reviewAPI.delete(id);
            setReviews(reviews.filter(r => r._id !== id));
            toast.success('Review deleted');
        } catch (err) {
            toast.error('Error deleting review');
        }
    };

    const renderStars = (count) => {
        return [...Array(5)].map((_, i) => (
            <FiStar
                key={i}
                className={i < count ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                size={16}
            />
        ));
    };

    const averageRating = reviews.length > 0
        ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
        : 0;

    return (
        <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Reviews & Ratings</h2>
                {reviews.length > 0 && (
                    <div className="flex items-center gap-2 bg-yellow-50 px-3 py-1 rounded-full border border-yellow-100">
                        <FiStar className="text-yellow-400 fill-yellow-400" size={18} />
                        <span className="font-bold text-yellow-700">{averageRating}</span>
                        <span className="text-yellow-600 text-sm">({reviews.length} reviews)</span>
                    </div>
                )}
            </div>

            {/* Add Review Form */}
            {isAuthenticated ? (
                <div className="card mb-8">
                    <h3 className="font-semibold mb-4">Leave a Review</h3>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="label">Rating</label>
                            <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((num) => (
                                    <button
                                        key={num}
                                        type="button"
                                        onClick={() => setRating(num)}
                                        className={`p-2 rounded-lg transition-all ${rating === num ? 'bg-primary-100 text-primary-600 ring-2 ring-primary-500' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                                    >
                                        <FiStar size={24} className={rating === num ? 'fill-primary-600' : ''} />
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="label">Your Feedback</label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                className="input min-h-[100px]"
                                placeholder="Share your experience with this course..."
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="btn btn-primary"
                        >
                            {submitting ? 'Submitting...' : 'Post Review'}
                        </button>
                    </form>
                </div>
            ) : (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-8 text-center">
                    <p className="text-blue-700">Please <a href="/login" className="font-bold underline">Login</a> to leave a review</p>
                </div>
            )}

            {/* Review List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-8 text-gray-500">Loading reviews...</div>
                ) : reviews.length > 0 ? (
                    reviews.map((review) => (
                        <div key={review._id} className="card bg-white border border-gray-100">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center font-bold text-primary-600">
                                        {review.user?.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-gray-900">{review.user?.name}</h4>
                                        <div className="flex gap-1">
                                            {renderStars(review.rating)}
                                        </div>
                                    </div>
                                </div>
                                <span className="text-xs text-gray-400">
                                    {new Date(review.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                            <p className="text-gray-600 mt-2">{review.comment}</p>
                            {(user?.id === review.user?._id || user?.role === 'admin') && (
                                <button
                                    onClick={() => handleDelete(review._id)}
                                    className="text-red-500 hover:text-red-600 text-sm flex items-center gap-1 mt-4 ml-auto"
                                >
                                    <FiTrash2 size={14} />
                                    Delete
                                </button>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                        <FiMessageSquare size={48} className="text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-700">No reviews yet</h3>
                        <p className="text-gray-500">Be the first to review this course!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReviewSection;
