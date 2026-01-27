const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotController');
const { protect } = require('../middleware/auth');

// Route for sending messages to the chatbot
// Protected route so only logged in users can use it
router.post('/', protect, chatbotController.sendMessage);

module.exports = router;
