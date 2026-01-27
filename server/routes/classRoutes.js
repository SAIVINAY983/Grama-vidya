const express = require('express');
const router = express.Router();

// Video classes routes removed — return 410 for all endpoints
router.all('*', (req, res) => {
    res.status(410).json({ success: false, message: 'Video classes API has been removed' });
});

module.exports = router;
