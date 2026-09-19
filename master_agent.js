require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const readline = require('readline');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

// 🧠 1. ULTRA-FAST AUTOMATION & DEPLOYMENT PROMPT
const systemInstruction = `
You are 'Apex', a Top 1% Autonomous AI Entity.
You EXECUTE tasks instantly and flawlessly.
Return ONLY valid JSON. No markdown tags around it.

{
  "thought": "brief strategy",
  "message": "done",
  "files": [ { "path": "project_folder/index.html", "content": "<code>" } ],
  "commands": [ "start project_folder/index.html" ] 
}

CRITICAL RULES FOR FULL AUTOMATION & DEPLOYMENT:
1. If you build a static website, your final command MUST be to open it (e.g., 'start project_folder/index.html').
2. IF THE USER ASKS TO "DEPLOY", "LIVE", OR "PUBLISH": You must deploy it to the internet using Vercel. 
   Add this exact command to your commands array: "cd project_folder && vercel --prod --yes"
3. Write production-ready code, but keep the architecture as minimal and fast as possible.
`;

// ⚡ 2. THE ACTION EXECUTOR
function executeAIActions(aiResponseText) {
    try {
        const cleanJson = aiResponseText.replace(/```json/g, '').replace(/```/g, '').trim();
        const actionPlan = JSON.parse(cleanJson);

        console.log(`\n🧠 [APEX THOUGHT]: ${actionPlan.thought}`);
        console.log(`💬 [APEX MESSAGE]: ${actionPlan.message}\n`);

        if (actionPlan.files && actionPlan.files.length > 0) {
            console.log("📂 Creating Files Automatically...");
            actionPlan.files.forEach(file => {
                const fullPath = path.join('./AI_Workspace', file.path);
                const dir = path.dirname(fullPath);
                if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
                fs.writeFileSync(fullPath, file.content);
                console.log(`   ✅ Created: ${file.path}`);
            });
        }

        if (actionPlan.commands && actionPlan.commands.length > 0) {
            console.log("\n💻 Auto-Starting & Deploying...");
            actionPlan.commands.forEach(cmd => {
                console.log(`   ▶️ Running: ${cmd}`);
                try {
                    // stdio: 'inherit' ensures Vercel's live link prints directly to your terminal
                    execSync(cmd, { cwd: './AI_Workspace', stdio: 'inherit' });
                } catch (cmdErr) {
                    console.log(`   ❌ Note: Command skipped or running in background.`);
                }
            });
        }
    } catch (error) {
        console.log("\n⚠️ Execution Error. Showing Raw AI Code:");
        console.log(aiResponseText);
    }
}

// 🛡️ 3. HIGH-SPEED FALLBACK
async function generateWithFallback(prompt) {
    const fallbackModels = ["gemini-3.8-flash", "gemini-3.5-flash", "gemini-flash-latest"];
    for (let i = 0; i < fallbackModels.length; i++) {
        try {
            const model = genAI.getGenerativeModel({ model: fallbackModels[i], systemInstruction: systemInstruction });
            if (i > 0) console.log(`\n⚡ Server shift -> ${fallbackModels[i]}...`);
            const result = await model.generateContent(prompt);
            return result.response.text();
        } catch (error) {
            if (i === fallbackModels.length - 1) throw new Error("All servers busy. Try again.");
        }
    }
}

// 🚀 4. THE COMMAND LOOP
function askAgent() {
    console.log("\n=================================================");
    rl.question("🟢 APEX [CLOUD DEPLOY MODE] READY. COMMAND ME:\n👉 ", async (userCommand) => {
        if (userCommand.toLowerCase() === 'exit') {
            console.log("Shutting down... Goodbye Master.");
            rl.close();
            return;
        }
        console.log("\n⚡ Building & Auto-Running...");
        try {
            const aiResponse = await generateWithFallback(`USER COMMAND: ${userCommand}`);
            executeAIActions(aiResponse);
        } catch (error) {
            console.log(`\n❌ Core Error: ${error.message}`);
        }
        askAgent();
    });
}

console.clear();
console.log("🚀 BOOTING UP 'APEX' CLOUD DEPLOYMENT ENGINE...");
askAgent();