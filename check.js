require('dotenv').config();

async function checkModels() {
    console.log("🔍 Google Server se connect kar raha hoon...");
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.models) {
            console.log("\n✅ Aapki API Key par yeh Models AVAILABLE hain:\n");
            data.models.forEach(m => {
                // Sirf Gemini models filter kar rahe hain
                if (m.name.includes('gemini')) {
                    console.log(`👉 ${m.name.replace('models/', '')}`);
                }
            });
            console.log("\n👆 Upar di gayi list mein se 'gemini-1.5-flash' ya 'gemini-1.5-pro' wala exact naam copy karein!");
        } else {
            console.log("❌ API Key mein koi issue hai:", data);
        }
    } catch (error) {
        console.log("Error:", error.message);
    }
}

checkModels();