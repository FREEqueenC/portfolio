import { initRealtime } from './realtime.js';

// DOM Elements
const wsList = document.getElementById('workspaces-list');
const wsForm = document.getElementById('new-workspace-form');
const wsNameInput = document.getElementById('ws-name');
const wsPathInput = document.getElementById('ws-path');

const chatMessages = document.getElementById('chat-messages');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');

const taskForm = document.getElementById('new-task-form');
const taskTitleInput = document.getElementById('task-title');
const taskWsSelect = document.getElementById('task-ws-select');

const listTodo = document.getElementById('list-todo');
const listInProgress = document.getElementById('list-inprogress');
const listDone = document.getElementById('list-done');

const agentsList = document.getElementById('agents-list');
const consoleLogs = document.getElementById('console-logs');

// State Variables
let workspaces = [];
let tasks = [];
let agents = [];
let logs = [];

// Fallback Mock State for Standalone Portfolio Showcase
const DEFAULT_WORKSPACES = [
    { id: 'ws-1', name: 'Aetheris Autonomous Mesh', path: 'C:\\projects\\aetheris-hub' },
    { id: 'ws-2', name: 'Levity Protocol Smart Contracts', path: 'C:\\projects\\levity-contracts' },
    { id: 'ws-3', name: 'SPARC Urban Matrix Simulator', path: 'C:\\projects\\sparc-clean-tech' }
];

const DEFAULT_TASKS = [
    { id: 't-1', title: 'Audit Base Mainnet Liquidity Pool & Slippage', status: 'TODO', workspace_id: 'ws-2' },
    { id: 't-2', title: 'Synthesize 13-node Metatron frequency lattice', status: 'TODO', workspace_id: '' },
    { id: 't-3', title: 'Realtime WebSocket telemetry integration for agent mesh', status: 'In Progress', workspace_id: 'ws-1' },
    { id: 't-4', title: 'Configure Zero-Knowledge Merkle Root Attestation', status: 'In Progress', workspace_id: 'ws-1' },
    { id: 't-5', title: 'Deploy 100M LEV Smart Wallet contract on Base', status: 'Done', workspace_id: 'ws-2' },
    { id: 't-6', title: 'Compile standalone client-side AST auditor bundle', status: 'Done', workspace_id: '' }
];

const DEFAULT_AGENTS = [
    { name: 'NICOLE Oracle', status: 'Running' },
    { name: 'Amp Reasoning Engine', status: 'Idle' },
    { name: 'Base Telemetry Monitor', status: 'Running' }
];

const DEFAULT_LOGS = [
    { id: 'l-1', source: 'SYSTEM', created_at: new Date(Date.now() - 180000).toISOString(), message: 'Orchestration Engine online in autonomous node mode.' },
    { id: 'l-2', source: 'ORACLE', created_at: new Date(Date.now() - 120000).toISOString(), message: 'Base Mainnet Oracle: sync height #24891024 verified.' },
    { id: 'l-3', source: 'AGENT', created_at: new Date(Date.now() - 60000).toISOString(), message: 'NICOLE active on 3 workspaces. 6 tasks synchronized.' },
    { id: 'l-4', source: 'SYSTEM', created_at: new Date().toISOString(), message: 'Ready for operator instruction or real-time event dispatch.' }
];

// Initialize Page
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Fetch initial states
    await fetchAll();

    // 2. Initialize Realtime WebSocket Connection (graceful failover)
    try {
        initRealtime(handleRealtimeEvent);
    } catch (e) {
        console.warn("Realtime Centrifuge service not running on this host; falling back to memory state.");
    }

    // 3. Register Event Listeners
    wsForm.addEventListener('submit', handleAddWorkspace);
    taskForm.addEventListener('submit', handleAddTask);
    chatForm.addEventListener('submit', handleChatSubmit);
});

// Fetch all data from REST endpoints with fallback
async function fetchAll() {
    try {
        const [wsRes, tasksRes, agentsRes, logsRes] = await Promise.all([
            fetch('/api/workspaces'),
            fetch('/api/tasks'),
            fetch('/api/agents'),
            fetch('/api/logs')
        ]);

        if (!wsRes.ok) throw new Error("REST API endpoints offline");

        workspaces = await wsRes.json() || [];
        tasks = await tasksRes.json() || [];
        agents = await agentsRes.json() || [];
        logs = await logsRes.json() || [];
    } catch (err) {
        console.warn("REST backend offline; activating interactive client showcase mode.");
        workspaces = [...DEFAULT_WORKSPACES];
        tasks = [...DEFAULT_TASKS];
        agents = [...DEFAULT_AGENTS];
        logs = [...DEFAULT_LOGS];
    } finally {
        renderWorkspaces();
        renderTasks();
        renderAgents();
        renderLogs();
    }
}

// Handle Realtime events published from Go Centrifuge Node
function handleRealtimeEvent(event) {
    const { table, action, data } = event;
    console.log(`Realtime Event: ${action} on ${table}`, data);

    if (table === 'workspaces') {
        if (action === 'INSERT') {
            workspaces.push(data);
        } else if (action === 'DELETE') {
            workspaces = workspaces.filter(w => w.id !== data.id);
        } else if (action === 'UPDATE') {
            workspaces = workspaces.map(w => w.id === data.id ? data : w);
        }
        renderWorkspaces();
    } else if (table === 'tasks') {
        if (action === 'INSERT') {
            tasks.push(data);
        } else if (action === 'DELETE') {
            tasks = tasks.filter(t => t.id !== data.id);
        } else if (action === 'UPDATE') {
            tasks = tasks.map(t => t.id === data.id ? data : t);
        }
        renderTasks();
    } else if (table === 'agent_status') {
        if (action === 'INSERT') {
            agents.push(data);
        } else if (action === 'UPDATE') {
            agents = agents.map(a => a.name === data.name ? data : a);
        }
        renderAgents();
    } else if (table === 'activity_logs') {
        if (action === 'INSERT') {
            logs.unshift(data);
            if (logs.length > 50) logs.pop();
            appendLogLine(data);
        }
    }
}

// Render Functions
function renderWorkspaces() {
    if (workspaces.length === 0) {
        wsList.innerHTML = `<p class="loading-placeholder">No workspaces registered.</p>`;
        taskWsSelect.innerHTML = `<option value="">Global (No Workspace)</option>`;
        return;
    }

    wsList.innerHTML = workspaces.map(w => `
        <div class="ws-item">
            <div class="ws-details">
                <strong>${escapeHTML(w.name)}</strong>
                <span>${escapeHTML(w.path)}</span>
            </div>
            <button class="btn-delete" onclick="window.deleteWorkspace('${w.id}')">
                <span class="material-symbols-outlined">delete</span>
            </button>
        </div>
    `).join('');

    // Populate Task select dropdown
    taskWsSelect.innerHTML = `
        <option value="">Global (No Workspace)</option>
        ${workspaces.map(w => `<option value="${w.id}">${escapeHTML(w.name)}</option>`).join('')}
    `;
}

function renderTasks() {
    listTodo.innerHTML = '';
    listInProgress.innerHTML = '';
    listDone.innerHTML = '';

    tasks.forEach(t => {
        const wsName = getWorkspaceName(t.workspace_id);
        const cardHtml = `
            <div class="task-item-card" id="task-${t.id}">
                <strong>${escapeHTML(t.title)}</strong>
                <div class="task-meta">
                    <span>${escapeHTML(wsName)}</span>
                    <div class="task-actions">
                        ${t.status !== 'TODO' && t.status !== 'todo' ? `<button class="btn-icon-sm" onclick="window.updateTaskStatus('${t.id}', 'TODO')" title="Move to TODO"><span class="material-symbols-outlined">arrow_back</span></button>` : ''}
                        ${t.status !== 'In Progress' && t.status !== 'inprogress' ? `<button class="btn-icon-sm" onclick="window.updateTaskStatus('${t.id}', 'In Progress')" title="Move to In Progress"><span class="material-symbols-outlined">play_arrow</span></button>` : ''}
                        ${t.status !== 'Done' && t.status !== 'done' ? `<button class="btn-icon-sm" onclick="window.updateTaskStatus('${t.id}', 'Done')" title="Complete"><span class="material-symbols-outlined">check_circle</span></button>` : ''}
                    </div>
                </div>
            </div>
        `;

        if (t.status === 'TODO' || t.status === 'todo') {
            listTodo.insertAdjacentHTML('beforeend', cardHtml);
        } else if (t.status === 'In Progress' || t.status === 'inprogress') {
            listInProgress.insertAdjacentHTML('beforeend', cardHtml);
        } else if (t.status === 'Done' || t.status === 'done') {
            listDone.insertAdjacentHTML('beforeend', cardHtml);
        }
    });
}

function renderAgents() {
    agentsList.innerHTML = agents.map(a => `
        <div class="agent-item">
            <div class="agent-info">
                <span class="pulse-dot ${a.status === 'Running' ? 'active' : 'idle'}"></span>
                <strong>${escapeHTML(a.name)}</strong>
            </div>
            <span class="agent-status-badge ${a.status.toLowerCase()}">${escapeHTML(a.status)}</span>
        </div>
    `).join('');
}

function renderLogs() {
    consoleLogs.innerHTML = '';
    const reversedLogs = [...logs].reverse();
    reversedLogs.forEach(l => appendLogLine(l));
}

function appendLogLine(logItem) {
    const line = document.createElement('div');
    const sourceClass = (logItem.source || 'sys').toLowerCase();
    line.className = `log-line ${sourceClass}`;
    const dateObj = logItem.created_at ? new Date(logItem.created_at) : new Date();
    const timeStr = dateObj.toLocaleTimeString();
    line.innerHTML = `[${timeStr}] [${escapeHTML(logItem.source || 'SYS')}] ${escapeHTML(logItem.message)}`;
    consoleLogs.appendChild(line);
    consoleLogs.scrollTop = consoleLogs.scrollHeight;
}

// REST Handlers with In-Memory Simulation
async function handleAddWorkspace(e) {
    e.preventDefault();
    const name = wsNameInput.value.trim();
    const path = wsPathInput.value.trim();
    if (!name || !path) return;

    try {
        const res = await fetch('/api/workspaces', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, path })
        });
        if (!res.ok) throw new Error("API Offline");
    } catch (err) {
        console.warn("Adding workspace to local state:", name);
        const newWs = { id: 'ws-' + Date.now(), name, path };
        workspaces.push(newWs);
        renderWorkspaces();
        appendLogLine({ source: 'SYSTEM', message: `Registered workspace [${name}] locally.`, created_at: new Date().toISOString() });
    }
    wsNameInput.value = '';
    wsPathInput.value = '';
}

async function handleAddTask(e) {
    e.preventDefault();
    const title = taskTitleInput.value.trim();
    const workspaceId = taskWsSelect.value || null;
    if (!title) return;

    try {
        const res = await fetch('/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, workspace_id: workspaceId })
        });
        if (!res.ok) throw new Error("API Offline");
    } catch (err) {
        console.warn("Adding task to local state:", title);
        const newTask = { id: 't-' + Date.now(), title, status: 'TODO', workspace_id: workspaceId };
        tasks.push(newTask);
        renderTasks();
        appendLogLine({ source: 'ORACLE', message: `Dispatched new task: "${title}".`, created_at: new Date().toISOString() });
    }
    taskTitleInput.value = '';
}

async function handleChatSubmit(e) {
    e.preventDefault();
    const message = chatInput.value.trim();
    if (!message) return;

    appendChatMessage('user', 'Ash', message);
    chatInput.value = '';

    const typingId = appendChatMessage('nicole', 'NICOLE', 'Analyzing system state...');

    try {
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message, session_id: 'default' })
        });
        if (!res.ok) throw new Error("Chat endpoint offline");
        const data = await res.json();
        document.getElementById(typingId).querySelector('.text').innerText = data.response;
    } catch (err) {
        setTimeout(() => {
            const replies = [
                `Acknowledged, Ash. The Base Mainnet LEV token contract is verified healthy. Task orchestration active across ${workspaces.length} workspaces.`,
                `Analyzing operator query: "${message}". Telemetry registers harmonic convergence. Task queue updated.`,
                `Cognitive oracle response: Synchronizing local state with Aetheris Hub nodes. All systems operational.`
            ];
            const chosen = replies[Math.floor(Math.random() * replies.length)];
            const targetEl = document.getElementById(typingId);
            if (targetEl) {
                targetEl.querySelector('.text').innerText = chosen;
            }
            appendLogLine({ source: 'ORACLE', message: `NICOLE processed query: "${message}"`, created_at: new Date().toISOString() });
        }, 500);
    }
}

function appendChatMessage(role, sender, text) {
    const msgId = 'msg-' + Math.random().toString(36).substr(2, 9);
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${role}`;
    msgDiv.id = msgId;
    msgDiv.innerHTML = `
        <span class="sender">${sender}:</span>
        <span class="text">${escapeHTML(text)}</span>
    `;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return msgId;
}

// Global actions exposed on window for inline HTML onclick handlers
window.deleteWorkspace = async (id) => {
    try {
        await fetch(`/api/workspaces/${id}`, { method: 'DELETE' });
    } catch (err) {
        console.warn("Deleting workspace from local state:", id);
    }
    workspaces = workspaces.filter(w => w.id !== id);
    renderWorkspaces();
};

window.updateTaskStatus = async (id, status) => {
    try {
        await fetch(`/api/tasks/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
    } catch (err) {
        console.warn("Updating task status in local state:", id, status);
    }
    tasks = tasks.map(t => t.id === id ? { ...t, status } : t);
    renderTasks();
    appendLogLine({ source: 'TASK', message: `Task [${id}] transitioned to [${status}].`, created_at: new Date().toISOString() });
};

// Utils
function getWorkspaceName(workspaceId) {
    if (!workspaceId) return 'Global';
    const ws = workspaces.find(w => w.id === workspaceId);
    return ws ? ws.name : 'Unknown';
}

function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}
