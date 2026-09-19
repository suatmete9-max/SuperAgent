// State variables
let freeCredits = parseInt(localStorage.getItem('apex_free_credits') ?? '3');
let isProActive = localStorage.getItem('apex_is_pro') === 'true';
let proExpiry = localStorage.getItem('apex_pro_expiry') ? parseInt(localStorage.getItem('apex_pro_expiry')) : null;
let selectedPlan = null;

// Time management logic (24 hours standard cooling countdown if credits exhausted)
let cooldownEnd = localStorage.getItem('apex_cooldown_end') ? parseInt(localStorage.getItem('apex_cooldown_end')) : null;

// Initial Setup and checks on Window Load
window.addEventListener('load', () => {
  updateCreditDisplay();
  initCooldownTimer();
  checkLimitStatus();
});

// UI display logic for free credits
function updateCreditDisplay() {
  const creditCounter = document.getElementById('creditCounter');
  const creditProgress = document.getElementById('creditProgress');

  if (isProActive) {
    creditCounter.innerHTML = `<span class="text-emerald-400 font-black"><i class="fa-solid fa-crown"></i> Unlimited PRO</span>`;
    creditProgress.style.width = '100%';
    creditProgress.className = "bg-gradient-to-r from-emerald-500 to-teal-500 h-full transition-all duration-300";
  } else {
    creditCounter.innerText = `${freeCredits} / 3 left`;
    const widthPercentage = (freeCredits / 3) * 100;
    creditProgress.style.width = `${widthPercentage}%`;
    creditProgress.className = "bg-gradient-to-r from-blue-500 to-indigo-500 h-full transition-all duration-300";
  }
}

// Check if system is locked due to 0 credits
function checkLimitStatus() {
  const lockOverlay = document.getElementById('lockOverlay');
  if (!isProActive && freeCredits <= 0) {
    lockOverlay.classList.remove('hidden');
    // Start dynamic cooldown clock target if not already set
    if (!cooldownEnd) {
      cooldownEnd = Date.now() + 24 * 60 * 60 * 1000;
      localStorage.setItem('apex_cooldown_end', cooldownEnd);
    }
  } else {
    lockOverlay.classList.add('hidden');
  }
}

// Cooldown Clock management (24 hrs format)
function initCooldownTimer() {
  setInterval(() => {
    const hoursCountdown = document.getElementById('hoursCountdown');
    const cooldownTimer = document.getElementById('cooldownTimer');

    if (!cooldownEnd) {
      hoursCountdown.innerText = "24:00:00";
      cooldownTimer.innerText = "24:00:00";
      return;
    }

    const timeLeft = cooldownEnd - Date.now();
    if (timeLeft <= 0) {
      // Reset free credits back to 3 after 24 hrs expiration
      freeCredits = 3;
      localStorage.setItem('apex_free_credits', '3');
      localStorage.removeItem('apex_cooldown_end');
      cooldownEnd = null;
      updateCreditDisplay();
      checkLimitStatus();
    } else {
      const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

      const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      hoursCountdown.innerText = formattedTime;
      cooldownTimer.innerText = formattedTime;
    }
  }, 1000);
}

// Handle message submission
function handleSendMessage(event) {
  event.preventDefault();
  const userInput = document.getElementById('userInput');
  const text = userInput.value.trim();
  if (!text) return;

  // Double check credits lock
  if (!isProActive && freeCredits <= 0) {
    checkLimitStatus();
    return;
  }

  // Add user bubble
  appendChatBubble(text, 'user');
  userInput.value = '';

  // Deduct credit if not Pro
  if (!isProActive) {
    freeCredits = Math.max(0, freeCredits - 1);
    localStorage.setItem('apex_free_credits', freeCredits);
    updateCreditDisplay();
  }

  // Simulated Response from ChatGPT + Gemini Hybrid
  setTimeout(() => {
    const response = getDynamicMockAIResponse(text);
    appendChatBubble(response, 'bot');
    // Verify after completion of bot response to lock if 0
    checkLimitStatus();
  }, 1000);
}

// Dynamic mockup replies designed to keep engagement high
function getDynamicMockAIResponse(userQuery) {
  const normalized = userQuery.toLowerCase();

  if (normalized.includes('hello') || normalized.includes('hi') || normalized.includes('assalam')) {
    return "Hello! Assalam-o-Alaikum! I hope you are having an amazing day. I am ApexAI, powered by high-capacity multi-modal intelligence. How can I help you? Ask me anything about programming, business, or content writing!";
  }
  if (normalized.includes('pricing') || normalized.includes('plan') || normalized.includes('buy') || normalized.includes('free')) {
    return "We have fantastic pricing structures tailored just for you! You can get a Daily Pass for only $1, 10 Days for $7, or standard Monthly Pro for $15! Upgrade to get unlimited responses, zero waiting times, and maximum throughput.";
  }
  if (normalized.includes('code') || normalized.includes('programming') || normalized.includes('python') || normalized.includes('javascript')) {
    return "Interesting query! Here is a clean concept code block:<br><pre class='bg-slate-950 p-3 rounded-lg border border-slate-800 text-emerald-400 font-mono text-xs mt-2 overflow-x-auto'><code>// Auto-generative intelligence pipeline\nconst queryApexAI = async (prompt) => {\n  const endpoint = 'https://api.apex-hybrid.ai/v2';\n  return await fetch(endpoint, {\n    method: 'POST',\n    body: JSON.stringify({ prompt })\n  });\n};</code></pre><br>This architecture makes processing effortless!";
  }

  // Fallback multi-purpose generative chat output
  return `That is a fascinating prompt: "${userQuery}". As a hybrid model of ChatGPT and Google Gemini, I have analyzed your request. \n  <br><br>\n  1. This query demands <strong>Apex Logical Pipeline v2</strong> for optimal structuring.\n  2. I recommend using clean procedural parameters if building this as a pipeline.\n  3. If you want further deep logical explanations, upgrade to one of our micro-plans! Unlimited execution is ready.`;
}

// Append bubbles inside chat box with beautiful layouts
function appendChatBubble(text, sender) {
  const chatBody = document.getElementById('chatBody');
  const bubbleContainer = document.createElement('div');
  bubbleContainer.className = "max-w-3xl mx-auto flex gap-4 items-start animate-fade-in";

  if (sender === 'user') {
    bubbleContainer.innerHTML = `
      <div class="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
        <i class="fa-regular fa-user text-white text-xs"></i>
      </div>
      <div class="space-y-1 w-full">
        <p class="text-xs font-bold text-slate-400 uppercase tracking-wider">You</p>
        <div class="bg-slate-850 p-4 rounded-2xl border border-slate-800 text-slate-100 text-sm leading-relaxed max-w-xl">
          ${text}
        </div>
      </div>
    `;
  } else {
    bubbleContainer.innerHTML = `
      <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
        <i class="fa-solid fa-robot text-white text-xs"></i>
      </div>
      <div class="space-y-1 w-full">
        <p class="text-xs font-bold text-purple-400 uppercase tracking-wider">ApexAI Assistant</p>
        <div class="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 text-slate-200 text-sm leading-relaxed max-w-xl shadow-inner">
          ${text}
        </div>
      </div>
    `;
  }
  chatBody.appendChild(bubbleContainer);
  // Auto Scroll down smoothly
  chatBody.scrollTop = chatBody.scrollHeight;
}

// Reset the conversation flow UI
function resetChat() {
  const chatBody = document.getElementById('chatBody');
  chatBody.innerHTML = `
    <div class="max-w-3xl mx-auto flex gap-4 items-start">
      <div class="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
        <i class="fa-solid fa-robot text-white text-xs"></i>
      </div>
      <div class="space-y-1">
        <p class="text-xs font-bold text-purple-400 uppercase tracking-wider">ApexAI Assistant</p>
        <div class="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 text-slate-200 text-sm leading-relaxed max-w-xl shadow-inner">
          Assalam-o-Alaikum! Hello there! I am <strong>ApexAI v2.0</strong>, combining the elite parameters of ChatGPT & Gemini.
          <br><br>
          How can I assist you today? You have <span class="text-blue-400 font-bold">3 daily premium message credits</span> to trial for free!
        </div>
      </div>
    </div>
  `;
}

// Modal Controls
function openPlansModal() {
  document.getElementById('plansModal').classList.remove('hidden');
}

function closePlansModal() {
  document.getElementById('plansModal').classList.add('hidden');
  cancelPayment();
}

// Plan selection mechanism to show secure payment processing box
function selectPlan(name, price, duration) {
  selectedPlan = { name, price, duration };

  document.getElementById('selectedPlanName').innerText = name;
  document.getElementById('selectedPlanPrice').innerText = `$${price}`;
  document.getElementById('payBtnAmount').innerText = price;
  
  const paymentBox = document.getElementById('paymentBox');
  paymentBox.classList.remove('hidden');
  paymentBox.scrollIntoView({ behavior: 'smooth' });
}

function cancelPayment() {
  selectedPlan = null;
  document.getElementById('paymentBox').classList.add('hidden');
}

// Simulated payment processing
function processMockPayment(event) {
  event.preventDefault();
  const payButton = document.getElementById('payButton');
  payButton.innerHTML = `<i class="fa-solid fa-circle-notch animate-spin"></i> Verifying Secure SSL...`;
  payButton.disabled = true;

  setTimeout(() => {
    // Unlock Pro Mode in state & local storage
    isProActive = true;
    localStorage.setItem('apex_is_pro', 'true');
    
    // Calculate expiration date based on duration
    let days = 1;
    if (selectedPlan.duration.includes('10')) days = 10;
    if (selectedPlan.duration.includes('30')) days = 30;
    if (selectedPlan.duration.includes('90')) days = 90;
    if (selectedPlan.duration.includes('180')) days = 180;
    if (selectedPlan.duration.includes('365')) days = 365;
    
    const expirationTime = Date.now() + (days * 24 * 60 * 60 * 1000);
    localStorage.setItem('apex_pro_expiry', expirationTime);

    // Remove overlay & cooldown locks
    localStorage.removeItem('apex_cooldown_end');
    cooldownEnd = null;
    
    // Update UI states
    updateCreditDisplay();
    checkLimitStatus();
    closePlansModal();

    // Show Custom success feedback screen
    document.getElementById('successPlanName').innerText = selectedPlan.name;
    document.getElementById('successPlanDuration').innerText = `${days} Days Unconditional Access`;
    document.getElementById('successModal').classList.remove('hidden');

    // Re-enable payment button mockup
    payButton.innerHTML = `<i class="fa-solid fa-lock text-[10px]"></i> Pay Now`;
    payButton.disabled = false;
  }, 2000);
}

function closeSuccessModal() {
  document.getElementById('successModal').classList.add('hidden');
}

// Developer sandbox bypass/tester function to reset limits instantly
function resetCredits() {
  freeCredits = 3;
  isProActive = false;
  cooldownEnd = null;
  localStorage.setItem('apex_free_credits', '3');
  localStorage.setItem('apex_is_pro', 'false');
  localStorage.removeItem('apex_pro_expiry');
  localStorage.removeItem('apex_cooldown_end');

  updateCreditDisplay();
  checkLimitStatus();
  alert('Sandbox Reset: Free credits reset to 3. Trial mode reactivated.');
}
