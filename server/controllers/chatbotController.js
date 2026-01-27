const chatbotController = {
    async sendMessage(req, res) {
        try {
            const { message } = req.body;

            if (!message) {
                return res.status(400).json({
                    success: false,
                    message: 'Message is required'
                });
            }

            // Simple mock AI response for now
            // In a real application, you would call an AI API like Gemini here
            const responses = [
                "Hello! How can I help you today with your studies?",
                "That's an interesting question about Gram Vidya. Let me help you with that.",
                "I'm your AI assistant for Gram Vidya. I'm here to help you learn better!",
                "You can find more details in the courses section. Would you like me to point you to a specific course?",
                "Learning is a journey! I'm glad to be part of yours here at Gram Vidya."
            ];

            const randomResponse = responses[Math.floor(Math.random() * responses.length)];

            // Simulate AI processing time
            setTimeout(() => {
                res.status(200).json({
                    success: true,
                    data: {
                        reply: randomResponse,
                        timestamp: new Date()
                    }
                });
            }, 500);

        } catch (error) {
            console.error('Chatbot Controller Error:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error while processing chat'
            });
        }
    }
};

module.exports = chatbotController;
