import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { communityAPI } from '../services/api';
import Loading from '../components/Loading';
import {
    FiSend,
    FiMessageSquare,
    FiHeart,
    FiTrash2,
    FiUser,
    FiCornerDownRight
} from 'react-icons/fi';

const CommunityPage = () => {
    const { user, isAuthenticated } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newPost, setNewPost] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const response = await communityAPI.getPosts();
            setPosts(response.data.posts || []);
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!newPost.trim() || submitting) return;

        setSubmitting(true);
        try {
            await communityAPI.createPost({ message: newPost });
            setNewPost('');
            fetchPosts();
        } catch (error) {
            console.error('Error creating post:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleReply = async (e, postId) => {
        e.preventDefault();
        if (!replyText.trim() || submitting) return;

        setSubmitting(true);
        try {
            await communityAPI.replyToPost(postId, { message: replyText });
            setReplyText('');
            setReplyingTo(null);
            fetchPosts();
        } catch (error) {
            console.error('Error replying:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleLike = async (postId) => {
        if (!isAuthenticated) return;
        try {
            await communityAPI.toggleLike(postId);
            fetchPosts();
        } catch (error) {
            console.error('Error liking post:', error);
        }
    };

    const handleDelete = async (postId) => {
        if (window.confirm('Delete this post?')) {
            try {
                await communityAPI.deletePost(postId);
                fetchPosts();
            } catch (error) {
                console.error('Error deleting post:', error);
            }
        }
    };

    const formatDate = (date) => {
        const now = new Date();
        const postDate = new Date(date);
        const diff = now - postDate;

        if (diff < 60000) return 'Just now';
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
        if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
        return postDate.toLocaleDateString();
    };

    const getRoleBadge = (role) => {
        const badges = {
            teacher: 'bg-blue-100 text-blue-700',
            admin: 'bg-purple-100 text-purple-700',
            student: 'bg-gray-100 text-gray-600'
        };
        return badges[role] || badges.student;
    };

    if (loading) return <Loading text="Loading discussions..." />;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container-custom max-w-3xl">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                        Community Discussions
                    </h1>
                    <p className="text-gray-500 mt-1">
                        Ask questions, share knowledge, and learn together
                    </p>
                </div>

                {/* Create Post */}
                {isAuthenticated ? (
                    <div className="card mb-6">
                        <form onSubmit={handleCreatePost}>
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-primary-600 font-semibold">
                                        {user?.name?.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <textarea
                                        value={newPost}
                                        onChange={(e) => setNewPost(e.target.value)}
                                        placeholder="Share your question or thoughts..."
                                        className="input min-h-[100px] resize-none"
                                        maxLength={1000}
                                    />
                                    <div className="flex items-center justify-between mt-3">
                                        <span className="text-sm text-gray-400">
                                            {newPost.length}/1000
                                        </span>
                                        <button
                                            type="submit"
                                            disabled={!newPost.trim() || submitting}
                                            className="btn btn-primary"
                                        >
                                            <FiSend size={18} />
                                            Post
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div className="card mb-6 text-center">
                        <p className="text-gray-500">
                            <a href="/login" className="text-primary-600 font-medium">Sign in</a>
                            {' '}to join the discussion
                        </p>
                    </div>
                )}

                {/* Posts List */}
                <div className="space-y-4">
                    {posts.length === 0 ? (
                        <div className="card text-center py-12">
                            <FiMessageSquare size={48} className="text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-700 mb-2">No discussions yet</h3>
                            <p className="text-gray-500">Be the first to start a conversation!</p>
                        </div>
                    ) : (
                        posts.map(post => (
                            <div key={post._id} className="card">
                                {/* Post Header */}
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                                        <span className="font-semibold text-gray-600">
                                            {post.user?.name?.charAt(0).toUpperCase() || 'U'}
                                        </span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-medium text-gray-900">
                                                {post.user?.name || 'Anonymous'}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded-full text-xs capitalize ${getRoleBadge(post.user?.role)}`}>
                                                {post.user?.role}
                                            </span>
                                            <span className="text-gray-400 text-sm">
                                                · {formatDate(post.createdAt)}
                                            </span>
                                        </div>
                                        <p className="text-gray-700 mt-2 whitespace-pre-wrap">{post.message}</p>

                                        {/* Post Actions */}
                                        <div className="flex items-center gap-4 mt-4">
                                            <button
                                                onClick={() => handleLike(post._id)}
                                                className={`flex items-center gap-1 text-sm transition-colors ${post.likes?.includes(user?.id)
                                                        ? 'text-red-500'
                                                        : 'text-gray-400 hover:text-red-500'
                                                    }`}
                                            >
                                                <FiHeart size={16} />
                                                <span>{post.likes?.length || 0}</span>
                                            </button>
                                            {isAuthenticated && (
                                                <button
                                                    onClick={() => setReplyingTo(replyingTo === post._id ? null : post._id)}
                                                    className="flex items-center gap-1 text-sm text-gray-400 hover:text-primary-500 transition-colors"
                                                >
                                                    <FiMessageSquare size={16} />
                                                    Reply
                                                </button>
                                            )}
                                            {(user?.id === post.user?._id || user?.role === 'admin') && (
                                                <button
                                                    onClick={() => handleDelete(post._id)}
                                                    className="flex items-center gap-1 text-sm text-gray-400 hover:text-red-500 transition-colors"
                                                >
                                                    <FiTrash2 size={16} />
                                                </button>
                                            )}
                                        </div>

                                        {/* Reply Form */}
                                        {replyingTo === post._id && (
                                            <form
                                                onSubmit={(e) => handleReply(e, post._id)}
                                                className="mt-4 flex gap-3"
                                            >
                                                <input
                                                    type="text"
                                                    value={replyText}
                                                    onChange={(e) => setReplyText(e.target.value)}
                                                    placeholder="Write a reply..."
                                                    className="input flex-1"
                                                    autoFocus
                                                />
                                                <button
                                                    type="submit"
                                                    disabled={!replyText.trim() || submitting}
                                                    className="btn btn-primary"
                                                >
                                                    <FiSend size={18} />
                                                </button>
                                            </form>
                                        )}

                                        {/* Replies */}
                                        {post.replies?.length > 0 && (
                                            <div className="mt-4 space-y-3 pl-4 border-l-2 border-gray-100">
                                                {post.replies.map(reply => (
                                                    <div key={reply._id} className="flex items-start gap-3">
                                                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                                                            <span className="text-sm font-medium text-gray-500">
                                                                {reply.user?.name?.charAt(0).toUpperCase() || 'U'}
                                                            </span>
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-medium text-gray-800 text-sm">
                                                                    {reply.user?.name}
                                                                </span>
                                                                <span className={`px-1.5 py-0.5 rounded text-xs capitalize ${getRoleBadge(reply.user?.role)}`}>
                                                                    {reply.user?.role}
                                                                </span>
                                                                <span className="text-gray-400 text-xs">
                                                                    · {formatDate(reply.createdAt)}
                                                                </span>
                                                            </div>
                                                            <p className="text-gray-600 text-sm mt-1">{reply.message}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default CommunityPage;
