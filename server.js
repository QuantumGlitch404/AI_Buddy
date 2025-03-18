// server.js
const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors({
    origin: ['http://127.0.0.1:5500', 'http://localhost:5500', 'http://localhost:3000'],
    credentials: true
}));

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Serve static files from current directory
app.use(express.static(path.join(__dirname)));


// Serve the HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
    const userMessage = req.body.message;

    if (!userMessage) {
        return res.status(400).json({ error: 'Message is required' });
    }

    // Log that we received a message
    console.log('Received message:', userMessage);

    try {
        console.log('Sending request to Gemini API...');
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GOOGLE_API_KEY}`,
            {
                contents: [{
                    parts: [{
                        text: userMessage
                    }]
                }]
            },
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );

        // Log successful response
        console.log('Received response from Gemini API');

        const aiResponse = response.data.candidates[0].content.parts[0].text;
        res.json({ response: aiResponse });

    } catch (error) {
        // Detailed error logging
        console.error('Error details:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status
        });

        // Send a more informative error back to the client
        res.status(500).json({
            error: 'API Error',
            details: error.response?.data?.error?.message || 
                     error.message || 
                     'Unknown error occurred'
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`API Key loaded:`, process.env.GOOGLE_API_KEY ? 'Yes' : 'No');
});