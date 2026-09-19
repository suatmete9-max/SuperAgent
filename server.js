require('dotenv').config();
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Apex-Web [Elite Diagnostic Engine]</title>
            <style>
                body { font-family: Arial, sans-serif; background: #121212; color: #fff; margin: 0; padding: 20px; display: flex; flex-direction: column; align-items: center; height: 100vh; box-sizing: border-box; }
                h1 { color: #00ffcc; margin-bottom: 10px; }
                #chat-container { width: 100%; max-width: 700px; height: 70vh; background: #1e1e1e; border-radius: 10px; padding: 15px; overflow-y: auto; border: 1px solid #333; display: flex; flex-direction: column; gap: 10px; }
                .message { padding: 10px 15px; border-radius: 8px; max-width: 80%; line-height: 1.4; word-break: break-word; white-space: pre-wrap; }
                .user { background: #007acc; align-self: flex-end; }
                .bot { background: #2d2d2d; align-self: flex-start; border: 1px solid #444; }
                #input-container { width: 100%; max-width: 700px; display: flex; margin-top: 15px; gap: 10px; }
                input { flex: 1; padding: 12px; border-radius: 6px; border: 1px solid #444; background: #222; color: #fff; font-size: 16px; }
                button { padding: 12px 20px; background: #00ffcc; color: #000; border: none; border-radius: 6px; font-weight: bold; cursor: pointer; }
            </style>
        </head>
        <body>
            <h1>APEX-WEB DIAGNOSTIC ENGINE</h1>
            <div id="chat-container">
                <div class="message bot">Hello Master! Diagnostic mode active hai.</div>
            </div>
            <div id="input-container">
                <input type="text" id="userInput" placeholder="Yahan apni command likhein..." autocomplete="off">
                <button onclick="sendMessage()">Send</button>
            </div>
            <script>
                const chatContainer = document.getElementById('chat-container');
                const userInput = document.getElementById('userInput');
                userInput.addEventListener('keypress', function (e) { if (e.key === 'Enter') sendMessage(); });

                async function sendMessage() {
                    const text = userInput.value.trim();
                    if (!text) return;
                    chatContainer.innerHTML += '<div class="message user">' + text + '</div>';
                    userInput.value = '';
                    chatContainer.scrollTop = chatContainer.scrollHeight;

                    try {
                        const response = await fetch('/chat', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ prompt: text })
                        });
                        const data = await response.json();
                        chatContainer.innerHTML += '<div class="message bot">' + data.reply + '</div>';
                    } catch (err) {
                        chatContainer.innerHTML += '<div class="message bot" style="color:red;">Connection Error.</div>';
                    }
                    chatContainer.scrollTop = chatContainer.scrollHeight;
                }
            </script>
        </body>
        </html>
    `);
});

app.post('/chat', async (req, res) => {
    const { prompt } = req.body;
    let errorsLog = [];

    // 1. Try Gemini
    if (process.env.GEMINI_API_KEY) {
        try {
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
            const result = await model.generateContent(prompt);
            const text = result.response.text();
            if (text) return res.json({ reply: text });
        } catch (e) {
            errorsLog.push("Gemini Error: " + e.message);
        }
    } else {
        errorsLog.push("Gemini Key Missing");
    }

    // 2. Try Groq
    if (process.env.GROQ_API_KEY) {
        try {
            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": "Bearer " + process.env.GROQ_API_KEY,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "llama-3.1-8b-instant",
                    messages: [{ role: "user", content: prompt }]
                })
            });
            const data = await response.json();
            if (data.choices && data.choices[0]) {
                return res.json({ reply: data.choices[0].message.content });
            } else {
                errorsLog.push("Groq Response Error: " + JSON.stringify(data));
            }
        } catch (e) {
            errorsLog.push("Groq Fetch Error: " + e.message);
        }
    } else {
        errorsLog.push("Groq Key Missing");
    }

    // 3. Try OpenRouter
    if (process.env.OPENROUTER_API_KEY) {
        try {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": "Bearer " + process.env.OPENROUTER_API_KEY,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    model: "google/gemini-flash-1.5",
                    messages: [{ role: "user", content: prompt }]
                })
            });
            const data = await response.json();
            if (data.choices && data.choices[0]) {
                return res.json({ reply: data.choices[0].message.content });
            } else {
                errorsLog.push("OpenRouter Response Error: " + JSON.stringify(data));
            }
        } catch (e) {
            errorsLog.push("OpenRouter Fetch Error: " + e.message);
        }
    } else {
        errorsLog.push("OpenRouter Key Missing");
    }

    // If all failed, return exact error logs
    res.json({ reply: "All APIs Failed -> " + errorsLog.join(" | ") });
});

app.listen(port, () => {
    console.log("Server running on port " + port);
});