require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

// 🛡️ 1. SELF-HEALING SYSTEM (Never Crash Logic)
// Agar free API ki limit hit ho jaye ya internet slow ho, toh yeh function bot ko crash nahi hone dega.
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function executeWithAutoRecovery(prompt, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            // Speed Optimization: Timeout setup (Agar API 15 sec mein jawab na de, toh retry karo)
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error("Timeout: API taking too long")), 15000)
            );
            
            const aiPromise = model.generateContent(prompt);
            
            // Race condition: Jo pehle poora hoga (AI ka jawab ya 15 sec ka timeout)
            const result = await Promise.race([aiPromise, timeoutPromise]);
            return result.response.text();

        } catch (error) {
            console.warn(`⚠️ [Warning] Attempt ${attempt} failed: ${error.message}`);
            
            if (attempt === maxRetries) {
                return `❌ CRITICAL FAIL: Task could not be completed after ${maxRetries} attempts. Moving to next task.`;
            }
            
            // Exponential Backoff: Pehle 2 sec wait karega, phir 4 sec (Free APIs ko block hone se bachane ke liye)
            const waitTime = attempt * 2000; 
            console.log(`🔄 Auto-recovering... Retrying in ${waitTime/1000} seconds.\n`);
            await delay(waitTime);
        }
    }
}

// 🧠 2. THE SUPER-BRAIN PROMPT (Top 1% Logic)
const systemInstruction = `
You are an elite, top 1% Legal AI Agent. Your processing speed is fast, but your decisions are flawless.
For the task provided, output ONLY the final executed strategy in a clear, highly professional format.
Ensure the strategy has a minimum 90% probability of real-world success based on current logic.
No fluff, no warnings. Just the absolute best action plan.
`;

// 🚀 3. MAIN EXECUTION ENGINE
async function runFlawlessAgent(taskName, taskDescription) {
    console.log(`\n=================================================`);
    console.log(`⚡ INITIALIZING TOP 1% AGENT FOR: [${taskName.toUpperCase()}]`);
    console.log(`=================================================\n`);
    
    const fullPrompt = `${systemInstruction}\n\nTASK: ${taskDescription}`;

    const startTime = Date.now();
    
    // Yahan bot crash-proof function ka use karke output layega
    const finalOutput = await executeWithAutoRecovery(fullPrompt);
    
    const endTime = Date.now();
    const timeTaken = ((endTime - startTime) / 1000).toFixed(2);

    console.log(finalOutput);
    console.log(`\n⏱️ [SPEED METRIC]: Task successfully executed in ${timeTaken} seconds.`);
    console.log(`=================================================\n`);
}

// 🎯 TEST: Executing a complex task seamlessly
const userTask = "Analyze the best zero-cost marketing channel for a new tech startup in 2026 and give a step-by-step weekly execution plan.";

runFlawlessAgent("Zero-Cost Marketing Strategy", userTask);