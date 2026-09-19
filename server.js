require('dotenv').config();
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Frontend Web Interface (ChatGPT / Gemini Style)
app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Apex-Web [1% Elite Engine]</title>
            <style>
                body { font-family: Arial, sans-serif; background: #121212; color: #fff; margin: 0; padding: 20px; display: flex; flex-direction: column; align-items: center; height: 100vh; box-sizing: border-box; }
                h1 { color: #00ffcc; margin-bottom: 10px; }
                #chat-container { width: 100%; max-width: 700px; height: 70vh; background: #1e1e1e; border-radius: 10px; padding: 15px; overflow-y: auto; border: 1px solid #333; display: flex; flex-direction: column; gap: 10px; }
                .message { padding: 10px 15px; border-radius: 8px; max-width: 80%; line-height: 1.4; word-break: break-word; }
                .user { background: #007acc; align-self: flex-end; }
                .bot { background: #2d2d2d; align-self: flex-start; border: 1px solid #444; }
                #input-container { width: 100%; max-width: 700px; display: flex; margin-top: 15px; gap: 10px; }
                input { flex: 1; padding: 12px; border-radius: 6px; border: 1px solid #444; background: #222; color: #fff; font-size: 16px; }
                button { padding: 12px 20px; background: #00ffcc; color: #000; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; }
                button:hover { background: #00b38f; }
            </style>
        </head>
        <body>
            <h1>APEX-WEB ENGINE</h1>
            <div id="chat-container">
                <div class="message bot">Hello Master! Main Apex hoon. Aap mujhe mobile ya kisi bhi browser se command de sakte hain.</div>
            </div>
            <div id="input-container">
                <input type="text" id="userInput" placeholder="Yahan apni command likhein..." autocomplete="off">
                <button onclick="sendMessage()">Send</button>
            </div>

            <script>
                const chatContainer = document.getElementById('chat-container');
                const userInput = document.getElementById('userInput');

                userInput.addEventListener('keypress', function (e) {
                    if (e.key === 'Enter') sendMessage();
                });

                async function sendMessage() {
                    const text = userInput.value.trim();
                    if (!text) return;

                    chatContainer.innerHTML += \`<div class="message user">\${text}</div>\`;
                    userInput.value = '';
                    chatContainer.scrollTop = chatContainer.scrollHeight;

                    try {
                        const response = await fetch('/chat', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ prompt: text })
                        });
                        const data = await response.json();
                        chatContainer.innerHTML += \`<div class="message bot">\${data.reply}</div>\`;
                    } catch (err) {
                        chatContainer.innerHTML += \`<div class="message bot" style="color:red;">Error connecting to server.</div>\`;
                    }
                    chatContainer.scrollTop = chatContainer.scrollHeight;
                }
            </script>
        </body>
        </html>
    `);
});

// API Endpoint for Chat Processing
app.post('/chat', async (req, res) => {
    const { prompt } = req.body;
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        res.json({ reply: responseText });
    } catch (error) {
        res.json({ reply: "Server error or high load. Please try again." });
    }
});

app.listen(port, () => {
    console.log(`🚀 Apex Web Server running at: http://localhost:${port}`);
});