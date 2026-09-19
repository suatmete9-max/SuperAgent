const API_URL = ''; // Relative path because they share the same origin

let currentUser = null;
let currentInbox = [];

function switchTab(tab) {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const tabLoginBtn = document.getElementById('tabLoginBtn');
  const tabRegisterBtn = document.getElementById('tabRegisterBtn');

  if (tab === 'login') {
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
    tabLoginBtn.className = 'flex-1 pb-3 text-center font-semibold text-red-500 border-b-2 border-red-500 transition-all';
    tabRegisterBtn.className = 'flex-1 pb-3 text-center font-semibold text-slate-400 hover:text-slate-600 transition-all';
  } else {
    loginForm.classList.add('hidden');
    registerForm.classList.remove('hidden');
    tabLoginBtn.className = 'flex-1 pb-3 text-center font-semibold text-slate-400 hover:text-slate-600 transition-all';
    tabRegisterBtn.className = 'flex-1 pb-3 text-center font-semibold text-red-500 border-b-2 border-red-500 transition-all';
  }
}

async function handleRegister(event) {
  event.preventDefault();
  const fullName = document.getElementById('regFullName').value.trim();
  const prefix = document.getElementById('regEmailPrefix').value.trim();
  const password = document.getElementById('regPassword').value;

  const email = `${prefix}@mockmail.com`;

  try {
    const response = await fetch(`${API_URL}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, fullName })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Registration failed');
    }

    alert(`Success! Email account created: ${data.email}\nYou can now log in.`);
    document.getElementById('loginEmail').value = data.email;
    switchTab('login');
  } catch (error) {
    alert(error.message);
  }
}

async function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  try {
    const response = await fetch(`${API_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Login failed');
    }

    currentUser = data;
    sessionStorage.setItem('mockMailUser', JSON.stringify(currentUser));
    
    enterApp();
  } catch (error) {
    alert(error.message);
  }
}

function enterApp() {
  document.getElementById('authScreen').classList.add('hidden');
  document.getElementById('mailInterface').classList.remove('hidden');
  document.getElementById('userInfo').classList.remove('hidden').classList.add('flex');
  
  document.getElementById('userDisplayName').innerText = currentUser.fullName;
  document.getElementById('activeEmailStr').innerText = currentUser.email;

  loadInbox();
}

async function loadInbox() {
  if (!currentUser) return;

  try {
    const response = await fetch(`${API_URL}/api/inbox/${currentUser.email}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch inbox');
    }

    currentInbox = data;
    renderInbox();
  } catch (error) {
    console.error(error);
  }
}

function renderInbox() {
  const listContainer = document.getElementById('emailList');
  listContainer.innerHTML = '';

  document.getElementById('totalMailCount').innerText = currentInbox.length;
  document.getElementById('unreadCount').innerText = currentInbox.length;

  if (currentInbox.length === 0) {
    listContainer.innerHTML = `
      <div class="p-8 text-center text-slate-400">
        <i class="fa-solid fa-folder-open text-4xl mb-2"></i>
        <p class="text-sm font-medium">Your Inbox is completely empty.</p>
      </div>
    `;
    return;
  }

  currentInbox.forEach(mail => {
    const div = document.createElement('div');
    div.className = 'p-4 hover:bg-slate-50 cursor-pointer border-b border-slate-100 transition flex items-start gap-3';
    div.onclick = () => selectEmail(mail);

    div.innerHTML = `
      <div class="w-10 h-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-sm select-none shrink-0">
        ${mail.fromName ? mail.fromName.charAt(0).toUpperCase() : 'M'}
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between mb-1">
          <h4 class="text-sm font-semibold text-slate-800 truncate">${mail.fromName}</h4>
          <span class="text-xs text-slate-400 whitespace-nowrap">${mail.timestamp.split(',')[1] || mail.timestamp}</span>
        </div>
        <p class="text-xs font-medium text-slate-900 truncate mb-1">${mail.subject}</p>
        <p class="text-xs text-slate-500 truncate">${mail.body}</p>
      </div>
    `;
    listContainer.appendChild(div);
  });
}

function selectEmail(mail) {
  document.getElementById('emptyPreview').classList.add('hidden');
  
  const activePreview = document.getElementById('activePreview');
  activePreview.classList.remove('hidden');

  document.getElementById('previewSubject').innerText = mail.subject;
  document.getElementById('previewFrom').innerText = `${mail.fromName} <${mail.from}>`;
  document.getElementById('previewTimestamp').innerText = mail.timestamp;
  document.getElementById('previewBody').innerText = mail.body;
  
  const avatar = document.getElementById('previewAvatar');
  avatar.innerText = mail.fromName ? mail.fromName.charAt(0).toUpperCase() : 'M';
}

function openCompose() {
  document.getElementById('composeModal').classList.remove('hidden');
}

function closeCompose() {
  document.getElementById('composeModal').classList.add('hidden');
  document.getElementById('composeTo').value = '';
  document.getElementById('composeSubject').value = '';
  document.getElementById('composeBody').value = '';
}

async function handleSendEmail(event) {
  event.preventDefault();
  const to = document.getElementById('composeTo').value.trim();
  const subject = document.getElementById('composeSubject').value.trim();
  const body = document.getElementById('composeBody').value.trim();

  try {
    const response = await fetch(`${API_URL}/api/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: currentUser.email,
        to,
        subject,
        body
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to send email');
    }

    alert('Email Sent successfully!');
    closeCompose();
    loadInbox();
  } catch (error) {
    alert(error.message);
  }
}

function logout() {
  currentUser = null;
  sessionStorage.removeItem('mockMailUser');
  document.getElementById('mailInterface').classList.add('hidden');
  document.getElementById('authScreen').classList.remove('hidden');
  document.getElementById('userInfo').classList.add('hidden').classList.remove('flex');
}

// Auto Load session on boot if exists
window.addEventListener('DOMContentLoaded', () => {
  const cached = sessionStorage.getItem('mockMailUser');
  if (cached) {
    currentUser = JSON.parse(cached);
    enterApp();
  }
});