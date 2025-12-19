const CommunityPost = require('../models/CommunityPost');

// @desc    Get all posts (optionally filter by course)
// @route   GET /api/community
// @access  Public
exports.getPosts = async (req, res) => {
    try {
        const { course } = req.query;
        let query = { parentPost: null };

        if (course) query.course = course;

        const posts = await CommunityPost.find(query)
            .populate('user', 'name role')
            .populate({
                path: 'replies',
                populate: { path: 'user', select: 'name role' }
            })
            .sort({ createdAt: -1 })
            .limit(50);

        res.json({ success: true, posts });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Create post
// @route   POST /api/community
// @access  Private
exports.createPost = async (req, res) => {
    try {
        req.body.user = req.user.id;
        const post = await CommunityPost.create(req.body);

        const populatedPost = await CommunityPost.findById(post._id)
            .populate('user', 'name role');

        res.status(201).json({ success: true, post: populatedPost });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Reply to post
// @route   POST /api/community/:id/reply
// @access  Private
exports.replyToPost = async (req, res) => {
    try {
        const parentPost = await CommunityPost.findById(req.params.id);

        if (!parentPost) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        const reply = await CommunityPost.create({
            user: req.user.id,
            message: req.body.message,
            parentPost: req.params.id,
            course: parentPost.course
        });

        const populatedReply = await CommunityPost.findById(reply._id)
            .populate('user', 'name role');

        res.status(201).json({ success: true, post: populatedReply });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Like/unlike post
// @route   POST /api/community/:id/like
// @access  Private
exports.toggleLike = async (req, res) => {
    try {
        const post = await CommunityPost.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        const likeIndex = post.likes.indexOf(req.user.id);
        if (likeIndex > -1) {
            post.likes.splice(likeIndex, 1);
        } else {
            post.likes.push(req.user.id);
        }

        await post.save();

        res.json({ success: true, likes: post.likes.length });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Delete post
// @route   DELETE /api/community/:id
// @access  Private (Owner/Admin)
exports.deletePost = async (req, res) => {
    try {
        const post = await CommunityPost.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        if (post.user.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized' });
        }

        // Delete replies
        await CommunityPost.deleteMany({ parentPost: req.params.id });
        await post.deleteOne();

        res.json({ success: true, message: 'Post deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
