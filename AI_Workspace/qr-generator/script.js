// State variables for customization
let qrType = 'url';
let isGradient = false;
let customLogoData = null;
let qrCode = null;

// Logo Presets base64-ish urls (Using clean high-res logos via public svgs)
const presetLogos = {
    google: 'https://cdn-icons-png.flaticon.com/512/300/300221.png',
    whatsapp: 'https://cdn-icons-png.flaticon.com/512/733/733585.png',
    github: 'https://cdn-icons-png.flaticon.com/512/25/25231.png'
};

// DOM Elements
const inputs = {
    url: document.getElementById('input-url'),
    text: document.getElementById('input-text'),
    wifiSSID: document.getElementById('input-wifi-ssid'),
    wifiPass: document.getElementById('input-wifi-password'),
    wifiType: document.getElementById('input-wifi-type'),
    waPhone: document.getElementById('input-wa-phone'),
    waText: document.getElementById('input-wa-text'),
    colorPrimary: document.getElementById('color-primary'),
    colorPrimaryText: document.getElementById('color-primary-text'),
    colorSecondary: document.getElementById('color-secondary'),
    colorSecondaryText: document.getElementById('color-secondary-text'),
    colorBg: document.getElementById('color-bg'),
    colorBgText: document.getElementById('color-bg-text'),
    styleDots: document.getElementById('style-dots'),
    styleCorners: document.getElementById('style-corners')
};

// Init
window.addEventListener('DOMContentLoaded', () => {
    initQRCode();
    setupEventListeners();
    loadHistory();
});

function initQRCode() {
    qrCode = new QRCodeStyling({
        width: 300,
        height: 300,
        type: "canvas",
        data: "https://google.com",
        image: "",
        dotsOptions: {
            color: "#6366f1",
            type: "square"
        },
        backgroundOptions: {
            color: "#ffffff",
        },
        imageOptions: {
            crossOrigin: "anonymous",
            hideBackgroundDots: true,
            imageSize: 0.4,
            margin: 5
        },
        cornersSquareOptions: {
            type: "square",
            color: "#6366f1"
        }
    });

    document.getElementById('canvas-container').innerHTML = '';
    qrCode.append(document.getElementById('canvas-container'));
    updateQR();
}

// Dynamic event listeners for automatic updates on input
function setupEventListeners() {
    const allInputs = [
        inputs.url, inputs.text, inputs.wifiSSID, inputs.wifiPass, inputs.wifiType,
        inputs.waPhone, inputs.waText,
        inputs.colorPrimary, inputs.colorSecondary, inputs.colorBg,
        inputs.styleDots, inputs.styleCorners
    ];

    allInputs.forEach(input => {
        if (input) {
            input.addEventListener('input', () => {
                // Sync text boxes with color pickers
                if (input === inputs.colorPrimary) inputs.colorPrimaryText.value = input.value.toUpperCase();
                if (input === inputs.colorSecondary) inputs.colorSecondaryText.value = input.value.toUpperCase();
                if (input === inputs.colorBg) inputs.colorBgText.value = input.value.toUpperCase();
                updateQR();
            });
        }
    });

    // Handle Hex Input manual updates
    [inputs.colorPrimaryText, inputs.colorSecondaryText, inputs.colorBgText].forEach(hexInput => {
        hexInput.addEventListener('change', () => {
            let val = hexInput.value;
            if (!val.startsWith('#')) val = '#' + val;
            if (/^#[0-9A-F]{6}$/i.test(val)) {
                if (hexInput === inputs.colorPrimaryText) {
                    inputs.colorPrimary.value = val;
                } else if (hexInput === inputs.colorSecondaryText) {
                    inputs.colorSecondary.value = val;
                } else if (hexInput === inputs.colorBgText) {
                    inputs.colorBg.value = val;
                }
                updateQR();
            }
        });
    });
}

// Template / Mode Switching
function switchType(type) {
    qrType = type;
    
    // Toggle Tab Active Classes
    document.querySelectorAll('#type-tabs button').forEach(btn => {
        if (btn.dataset.type === type) {
            btn.className = "type-btn active flex flex-col items-center gap-2 p-3 rounded-xl border border-indigo-500/30 bg-indigo-600/10 text-indigo-400 font-semibold text-sm transition-all";
        } else {
            btn.className = "type-btn flex flex-col items-center gap-2 p-3 rounded-xl border border-slate-800/80 bg-slate-900/50 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-all";
        }
    });

    // Toggle Input Wrappers
    document.querySelectorAll('.input-wrapper').forEach(wrapper => {
        wrapper.classList.add('hidden');
    });
    document.getElementById(`input-${type}-wrapper`).classList.remove('hidden');
    
    updateQR();
}

// Realtime QR Generator Builder
function updateQR() {
    let finalData = "";

    // Gather data according to type
    if (qrType === 'url') {
        finalData = inputs.url.value || "https://google.com";
    } else if (qrType === 'text') {
        finalData = inputs.text.value || "";
    } else if (qrType === 'wifi') {
        const ssid = inputs.wifiSSID.value || "";
        const pass = inputs.wifiPass.value || "";
        const enc = inputs.wifiType.value || "nopass";
        finalData = `WIFI:S:${ssid};T:${enc};P:${pass};;`;
    } else if (qrType === 'whatsapp') {
        const phone = inputs.waPhone.value || "";
        const text = encodeURIComponent(inputs.waText.value || "");
        finalData = `https://wa.me/${phone}?text=${text}`;
    }

    // Dots Options configuration
    const dotsOptions = {
        type: inputs.styleDots.value,
    };

    if (isGradient) {
        dotsOptions.gradient = {
            type: "linear",
            rotation: 45,
            colorStops: [
                { offset: 0, color: inputs.colorPrimary.value },
                { offset: 1, color: inputs.colorSecondary.value }
            ]
        };
    } else {
        dotsOptions.color = inputs.colorPrimary.value;
    }

    // Corner Options
    const cornersSquareOptions = {
        type: inputs.styleCorners.value,
        color: inputs.colorPrimary.value
    };

    // Background Options
    const backgroundOptions = {
        color: inputs.colorBg.value || "#ffffff"
    };

    // Update qrCode Instance
    qrCode.update({
        data: finalData || " ",
        dotsOptions: dotsOptions,
        backgroundOptions: backgroundOptions,
        cornersSquareOptions: cornersSquareOptions,
        image: customLogoData || ""
    });
}

// Toggle between Solid & Gradient Dots
function toggleGradient(bool) {
    isGradient = bool;
    const solidBtn = document.getElementById('color-solid-btn');
    const gradientBtn = document.getElementById('color-gradient-btn');
    const secondaryWrapper = document.getElementById('color-secondary-wrapper');
    const primaryLabel = document.getElementById('color-one-label');

    if (isGradient) {
        gradientBtn.className = "px-3 py-1.5 rounded-md bg-indigo-600 text-white font-semibold transition-all";
        solidBtn.className = "px-3 py-1.5 rounded-md text-slate-400 hover:text-slate-100 font-semibold transition-all";
        secondaryWrapper.classList.remove('opacity-50', 'pointer-events-none');
        primaryLabel.innerText = "Gradient Color 1";
    } else {
        solidBtn.className = "px-3 py-1.5 rounded-md bg-indigo-600 text-white font-semibold transition-all";
        gradientBtn.className = "px-3 py-1.5 rounded-md text-slate-400 hover:text-slate-100 font-semibold transition-all";
        secondaryWrapper.classList.add('opacity-50', 'pointer-events-none');
        primaryLabel.innerText = "Foreground Color";
    }
    updateQR();
}

// Set background to fully transparent
function setTransparentBg() {
    inputs.colorBg.value = "#ffffff";
    inputs.colorBgText.value = "TRANSPARENT";
    qrCode.update({
        backgroundOptions: {
            color: "rgba(0,0,0,0)"
        }
    });
}

// Select preset Center Logo
function selectPresetLogo(logoKey) {
    document.querySelectorAll('.logo-preset-btn').forEach(btn => {
        btn.classList.remove('active', 'border-indigo-500', 'bg-indigo-600/15');
        btn.classList.add('border-slate-800/80', 'bg-slate-950');
    });

    const activeBtn = event.currentTarget;
    activeBtn.classList.add('active', 'border-indigo-500', 'bg-indigo-600/15');
    activeBtn.classList.remove('border-slate-800/80', 'bg-slate-950');

    if (logoKey === 'none') {
        customLogoData = null;
        document.getElementById('remove-logo-btn').classList.add('hidden');
    } else {
        customLogoData = presetLogos[logoKey];
        document.getElementById('remove-logo-btn').classList.remove('hidden');
    }
    updateQR();
}

// Upload custom logo
function uploadCustomLogo(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            customLogoData = e.target.result;
            document.getElementById('remove-logo-btn').classList.remove('hidden');
            updateQR();
        };
        reader.readAsDataURL(file);
    }
}

function removeLogo() {
    customLogoData = null;
    document.getElementById('remove-logo-btn').classList.add('hidden');
    document.querySelectorAll('.logo-preset-btn').forEach(btn => {
        btn.classList.remove('active', 'border-indigo-500', 'bg-indigo-600/15');
        btn.classList.add('border-slate-800/80', 'bg-slate-950');
    });
    updateQR();
}

// Downloads
function downloadQR(format) {
    saveToHistory();
    qrCode.download({ name: "qrcraft-design", extension: format });
    showToast(`QR Code downloaded as ${format.toUpperCase()}`);
}

// Copy QR canvas image to clipboard
async function copyImageToClipboard() {
    try {
        const canvas = document.querySelector('#canvas-container canvas');
        if (!canvas) return;
        
        canvas.toBlob(async (blob) => {
            const item = new ClipboardItem({ "image/png": blob });
            await navigator.clipboard.write([item]);
            showToast("Copied QR image to clipboard!");
        });
    } catch (err) {
        showToast("Unable to copy image. Use Chrome/Edge or download instead.");
    }
}

// Reset Controls
function resetAll() {
    inputs.url.value = "https://google.com";
    inputs.text.value = "";
    inputs.wifiSSID.value = "";
    inputs.wifiPass.value = "";
    inputs.waPhone.value = "";
    inputs.waText.value = "";
    inputs.colorPrimary.value = "#6366f1";
    inputs.colorPrimaryText.value = "#6366F1";
    inputs.colorSecondary.value = "#a855f7";
    inputs.colorSecondaryText.value = "#A855F7";
    inputs.colorBg.value = "#ffffff";
    inputs.colorBgText.value = "#FFFFFF";
    inputs.styleDots.value = "square";
    inputs.styleCorners.value = "square";
    customLogoData = null;
    toggleGradient(false);
    switchType('url');
    removeLogo();
    showToast("Customizer options reset.");
}

// Toast Handler
function showToast(message) {
    const toast = document.getElementById('toast');
    document.getElementById('toast-msg').innerText = message;
    toast.classList.remove('translate-y-20', 'opacity-0', 'pointer-events-none');
    
    setTimeout(() => {
        toast.classList.add('translate-y-20', 'opacity-0', 'pointer-events-none');
    }, 3000);
}

// Local History Manager
function saveToHistory() {
    let history = JSON.parse(localStorage.getItem('qr_history') || '[]');
    let value = "";
    if (qrType === 'url') value = inputs.url.value || "https://google.com";
    else if (qrType === 'text') value = inputs.text.value || "Plain text";
    else if (qrType === 'wifi') value = `WiFi: ${inputs.wifiSSID.value}`;
    else if (qrType === 'whatsapp') value = `WhatsApp to ${inputs.waPhone.value}`;

    const newItem = {
        id: Date.now(),
        type: qrType.toUpperCase(),
        content: value
    };

    history.unshift(newItem);
    if (history.length > 5) history.pop();
    localStorage.setItem('qr_history', JSON.stringify(history));
    loadHistory();
}

function loadHistory() {
    const list = document.getElementById('history-list');
    const noHist = document.getElementById('no-history-msg');
    const history = JSON.parse(localStorage.getItem('qr_history') || '[]');

    if (history.length === 0) {
        noHist.classList.remove('hidden');
        return;
    } else {
        noHist.classList.add('hidden');
    }

    list.innerHTML = '';
    history.forEach(item => {
        const div = document.createElement('div');
        div.className = "flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-300";
        div.innerHTML = `
            <div>
                <span class="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-semibold mr-2">${item.type}</span>
                <span class="truncate max-w-[150px] inline-block align-middle">${item.content}</span>
            </div>
            <button onclick="reapplyHistory('${item.content}', '${item.type.toLowerCase()}')" class="text-indigo-400 hover:text-indigo-300 font-semibold">Load</button>
        `;
        list.appendChild(div);
    });
}

function clearHistory() {
    localStorage.removeItem('qr_history');
    loadHistory();
    showToast("History cleared!");
}

function reapplyHistory(content, type) {
    if (type === 'url') {
        switchType('url');
        inputs.url.value = content;
    } else if (type === 'plain text' || type === 'text') {
        switchType('text');
        inputs.text.value = content;
    } else if (type.startsWith('wifi')) {
        switchType('wifi');
        inputs.wifiSSID.value = content.replace('WiFi: ', '');
    } else {
        switchType('url');
        inputs.url.value = content;
    }
    updateQR();
    showToast("Recent template loaded!");
}