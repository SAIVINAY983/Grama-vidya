const { GoogleGenerativeAI } = require("@google/generative-ai");

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

            const apiKey = process.env.GEMINI_API_KEY;

            // Fallback for missing or placeholder API key
            if (!apiKey || apiKey === 'your_gemini_api_key_here') {
                const responses = [
                    "Hello! I'm currently in 'Developer Mode'. Once my API key is configured, I'll be able to give you real AI-driven help!",
                    "I'm Gram Vidya AI. I'm waiting for my brain (API key) to be connected. How are you doing today?",
                    "Namaste! I'm ready to help, but I need my Gemini API key to be set up in the backend first."
                ];
                const mockReply = responses[Math.floor(Math.random() * responses.length)];

                return res.status(200).json({
                    success: true,
                    data: {
                        reply: mockReply,
                        timestamp: new Date()
                    }
                });
            }

            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({
                model: "gemini-1.5-flash",
                systemInstruction: "You are the Gram Vidya AI Learning Assistant. Your goal is to help students from rural areas in India with their studies. Use simple, clear, and encouraging language. If a student asks in a regional language, reply in that language if possible, otherwise explain simply in English. Focus on being a helpful tutor for school and vocational subjects. Keep responses concise and easy to understand."
            });

            const result = await model.generateContent(message);
            const response = await result.response;
            const text = response.text();

            res.status(200).json({
                success: true,
                data: {
                    reply: text,
                    timestamp: new Date()
                }
            });

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
