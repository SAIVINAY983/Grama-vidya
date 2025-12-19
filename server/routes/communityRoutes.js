const express = require('express');
const router = express.Router();
const {
    getPosts,
    createPost,
    replyToPost,
    toggleLike,
    deletePost
} = require('../controllers/communityController');
const { protect } = require('../middleware/auth');

router.get('/', getPosts);
router.post('/', protect, createPost);
router.post('/:id/reply', protect, replyToPost);
router.post('/:id/like', protect, toggleLike);
router.delete('/:id', protect, deletePost);

module.exports = router;
