let allLeads = [];
let activePlatform = 'All';
let activeSelectedLead = null;

// Initial Setup
document.addEventListener('DOMContentLoaded', () => {
  fetchConfig();
  fetchLeads();
  fetchPipeline();
});

// Fetch User Config Settings
async function fetchConfig() {
  try {
    const res = await fetch('/api/config');
    const data = await res.json();
    
    // populate UI config inputs
    document.getElementById('cfg-name').value = data.name;
    document.getElementById('cfg-skills').value = data.skills;
    document.getElementById('cfg-portfolio').value = data.portfolio;
    document.getElementById('cfg-keywords').value = data.keywords.join(', ');

    // Render small keyword visualizer
    const container = document.getElementById('settings-badges-container');
    container.innerHTML = '';
    data.keywords.forEach(kw => {
      container.innerHTML += `<span class="text-xs bg-slate-800 text-cyan-400 border border-slate-700/60 px-2.5 py-1 rounded-full">#${kw}</span>`;
    });
    document.getElementById('keywords-badge').innerText = data.keywords.slice(0,4).join(', ');
  } catch (err) {
    console.error('Error fetching configuration', err);
  }
}

// Save User Config
async function saveConfig() {
  const name = document.getElementById('cfg-name').value;
  const skills = document.getElementById('cfg-skills').value;
  const portfolio = document.getElementById('cfg-portfolio').value;
  const keywords = document.getElementById('cfg-keywords').value.split(',').map(s => s.trim().toLowerCase());

  try {
    const res = await fetch('/api/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, skills, portfolio, keywords })
    });
    if (res.ok) {
      closeConfigModal();
      await fetchConfig();
      await fetchLeads();
    }
  } catch (err) {
    console.error('Error saving config', err);
  }
}

// Fetch Leads list
async function fetchLeads() {
  const container = document.getElementById('gigs-container');
  container.innerHTML = `
    <div class="flex flex-col items-center justify-center py-12 space-y-3">
      <i class="fa-solid fa-spinner fa-spin text-4xl text-cyan-500"></i>
      <p class="text-sm text-gray-400">Scanning Upwork feeds, Reddit listings, and social signals...</p>
    </div>
  `;
  try {
    const res = await fetch('/api/leads');
    allLeads = await res.json();
    renderLeads();
  } catch (err) {
    container.innerHTML = `<p class="text-red-400 text-sm">Unable to retrieve fresh gigs. Please retry or verify backend connection.</p>`;
  }
}

// Render Cards inside UI stream
function renderLeads() {
  const container = document.getElementById('gigs-container');
  container.innerHTML = '';
  
  const filtered = activePlatform === 'All' ? allLeads : allLeads.filter(l => l.source.toLowerCase() === activePlatform.toLowerCase());

  // Update counter metric
  document.getElementById('total-leads-count').innerText = filtered.length;

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="bg-[#111827] border border-slate-800 rounded-2xl p-8 text-center">
        <i class="fa-solid fa-folder-open text-gray-600 text-3xl mb-2"></i>
        <p class="text-sm text-gray-400">No items found match platform filter: "${activePlatform}"</p>
      </div>
    `;
    return;
  }

  filtered.forEach(lead => {
    const sourceColor = 
      lead.source === 'Upwork' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
      lead.source === 'Reddit' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
      lead.source === 'Fiverr' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
      'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';

    const scoreColor = lead.score >= 90 ? 'text-emerald-400' : 'text-cyan-400';

    const card = document.createElement('div');
    card.className = `bg-[#111827] border border-slate-800 hover:border-slate-700/80 transition p-6 rounded-2xl cursor-pointer relative group ${activeSelectedLead?.id === lead.id ? 'ring-2 ring-cyan-500/60' : ''}`;
    card.onclick = () => selectLead(lead);
    card.innerHTML = `
      <div class="flex justify-between items-start gap-4 mb-3">
        <div class="space-y-1">
          <div class="flex items-center space-x-2 flex-wrap gap-y-1">
            <span class="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider border ${sourceColor}">${lead.source}</span>
            <span class="text-[10px] bg-slate-800 text-slate-300 font-semibold px-2 py-0.5 rounded-full">${lead.category}</span>
            <span class="text-[10px] bg-red-500/10 text-red-400 border border-red-500/15 font-semibold px-2 py-0.5 rounded-full">${lead.urgency} Urgency</span>
          </div>
          <h3 class="text-base font-bold text-white group-hover:text-cyan-400 transition mt-1">${lead.title}</h3>
        </div>
        <div class="text-right flex-shrink-0">
          <span class="text-lg font-black text-white block">${lead.budget}</span>
          <span class="text-xs text-gray-500">Budget</span>
        </div>
      </div>
      
      <p class="text-xs text-gray-400 mb-4 line-clamp-2">${lead.description}</p>

      <div class="flex justify-between items-center border-t border-slate-800/80 pt-4">
        <div class="flex items-center space-x-2">
          <span class="text-xs text-gray-500">Match Score:</span>
          <span class="text-xs font-black ${scoreColor}">${lead.score}% Match</span>
        </div>
        <div class="flex items-center space-x-2">
          <a href="${lead.url}" target="_blank" class="text-[11px] text-gray-400 hover:text-white transition flex items-center space-x-1 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700/80" onclick="event.stopPropagation()">
            <span>View Post</span>
            <i class="fa-solid fa-arrow-up-right-from-square text-[9px]"></i>
          </a>
          <button class="text-[11px] font-bold text-slate-900 bg-cyan-400 hover:bg-cyan-500 px-3 py-1.5 rounded-lg transition">
            Draft Proposal
          </button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

// Handle selecting a single Lead for Proposal compilation
async function selectLead(lead) {
  activeSelectedLead = lead;
  document.getElementById('pitch-job-title').value = lead.title;
  document.getElementById('pitch-proposal-text').value = 'Generating customized high-conversion proposal...';
  
  // Force re-render to update the visual borders on cards
  renderLeads();

  try {
    const res = await fetch('/api/generate-proposal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lead })
    });
    const data = await res.json();
    document.getElementById('pitch-proposal-text').value = data.proposal;
  } catch (err) {
    document.getElementById('pitch-proposal-text').value = 'Failed to compile auto-proposal. Please write manually.';
  }
}

// Platform Filter Switcher
function filterPlatform(platform) {
  activePlatform = platform;
  const buttons = document.querySelectorAll('#platform-filters button');
  buttons.forEach(btn => {
    if (btn.getAttribute('data-platform') === platform) {
      btn.className = "px-4 py-2 rounded-lg text-sm font-semibold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 transition";
    } else {
      btn.className = "px-4 py-2 rounded-lg text-sm font-semibold text-gray-400 hover:text-white transition";
    }
  });
  renderLeads();
}

// Copy generated text
function copyProposal() {
  const el = document.getElementById('pitch-proposal-text');
  el.select();
  document.execCommand('copy');
  
  const toast = document.getElementById('copy-toast');
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 2000);
}

// Add to local Pipeline tracking from draft workspaces
async function addToPipelineFromPitch() {
  if (!activeSelectedLead) {
    alert('Please pick a job from the stream first.');
    return;
  }
  try {
    const res = await fetch('/api/pipeline', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lead: activeSelectedLead, status: 'discovered' })
    });
    if (res.ok) {
      // Increase proposals metric
      const currentCount = parseInt(document.getElementById('proposals-sent-count').innerText) || 0;
      document.getElementById('proposals-sent-count').innerText = currentCount + 1;
      fetchPipeline();
    }
  } catch (e) {
    console.error(e);
  }
}

// CRM Board operations
async function fetchPipeline() {
  try {
    const res = await fetch('/api/pipeline');
    const data = await res.json();
    renderCRM(data);
  } catch (e) {
    console.error("Pipeline CRM failed to sync", e);
  }
}

function renderCRM(pipelineList) {
  const cols = {
    discovered: document.getElementById('col-discovered'),
    shortlisted: document.getElementById('col-shortlisted'),
    applied: document.getElementById('col-applied'),
    won: document.getElementById('col-won')
  };

  // Clear out columns
  Object.keys(cols).forEach(key => {
    cols[key].innerHTML = '';
    document.getElementById(`count-${key}`).innerText = '0';
  });

  let counters = { discovered: 0, shortlisted: 0, applied: 0, won: 0 };
  let calculatedValue = 0;

  pipelineList.forEach(item => {
    const status = item.status || 'discovered';
    counters[status]++;

    const budgetVal = parseInt(item.budget.replace(/[^0-9]/g, '')) || 500;
    calculatedValue += budgetVal;

    const pipelineCard = document.createElement('div');
    pipelineCard.className = "bg-[#111827] border border-slate-800 p-4 rounded-xl space-y-2 cursor-grab shadow-md hover:border-slate-700 transition relative";
    pipelineCard.draggable = true;
    pipelineCard.ondragstart = (e) => {
      e.dataTransfer.setData('text/plain', item.id);
    };
    
    // Status dynamic visual selector dropdown inside pipeline card for high interactivity
    pipelineCard.innerHTML = `
      <div class="flex justify-between items-start">
        <span class="text-[10px] font-bold uppercase text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md">${item.source}</span>
        <span class="text-xs font-bold text-white">${item.budget}</span>
      </div>
      <h4 class="text-xs font-bold text-white line-clamp-1">${item.title}</h4>
      
      <div class="flex items-center justify-between pt-2 border-t border-slate-800 mt-2">
        <select onchange="movePipelineLead('${item.id}', this.value)" class="bg-[#0B0F19] border border-slate-700 text-[10px] text-gray-300 rounded px-1.5 py-0.5 outline-none">
          <option value="discovered" ${status === 'discovered' ? 'selected' : ''}>Discovered</option>
          <option value="shortlisted" ${status === 'shortlisted' ? 'selected' : ''}>Shortlisted</option>
          <option value="applied" ${status === 'applied' ? 'selected' : ''}>Applied</option>
          <option value="won" ${status === 'won' ? 'selected' : ''}>Won</option>
        </select>
        <button onclick="removeFromPipeline('${item.id}')" class="text-red-400 hover:text-red-300 text-[10px] transition">
          <i class="fa-regular fa-trash-can"></i>
        </button>
      </div>
    `;
    if (cols[status]) {
      cols[status].appendChild(pipelineCard);
    }
  });

  // Update metrics counts
  Object.keys(counters).forEach(key => {
    document.getElementById(`count-${key}`).innerText = counters[key];
  });
  document.getElementById('estimated-value').innerText = `$${calculatedValue.toLocaleString()}`;
}

// Update single pipeline lead status dynamically
async function movePipelineLead(id, status) {
  try {
    const res = await fetch('/api/pipeline/update-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status })
    });
    if (res.ok) {
      fetchPipeline();
    }
  } catch (e) {
    console.error(e);
  }
}

// Drag and Drop implementation support
function allowDrop(e) {
  e.preventDefault();
}

async function drop(e, targetStatus) {
  e.preventDefault();
  const leadId = e.dataTransfer.getData('text/plain');
  if (leadId) {
    await movePipelineLead(leadId, targetStatus);
  }
}

// Open/Close modal selectors
function openConfigModal() {
  document.getElementById('config-modal').classList.remove('hidden');
}
function closeConfigModal() {
  document.getElementById('config-modal').classList.add('hidden');
}