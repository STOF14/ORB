/* ============================================================
   Orb — Assignments & Deadlines Logic
   Firebase-synced kanban board for tracking work
   ============================================================ */

// ── Constants ──
const MODULE_COLORS = {
    'PHY 255': 'var(--mod-red)',
    'WTW 211': 'var(--mod-orange)',
    'WTW 218': 'var(--mod-yellow)',
    'COS 210': 'var(--mod-blue)',
    'COS 212': 'var(--mod-dark-blue)',
    'Other':   'var(--grid-line)'
};

const MONTHS = MONTHS_SHORT;
const DAYS   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

let assignments = [];
let activeStatusFilter = 'all';
let activeModuleFilter = 'all';
let unsubscribe = null;

// ── Firestore helpers ──
function assignmentsCol() {
    return db.collection('users').doc(currentUser.uid).collection('assignments');
}

// ── Auth ──
auth.onAuthStateChanged(user => {
    currentUser = user;
    updateAuthUI();
    if (user) {
        migrateLocalToFirestore();
        listenAssignments();
    } else {
        if (unsubscribe) { unsubscribe(); unsubscribe = null; }
        loadLocal();
        render();
    }
});

function updateAuthUI() {
    const bar = document.getElementById('authContent');
    const status = document.getElementById('syncStatus');
    if (!bar) return;
    if (currentUser) {
        status.textContent = 'Synced';
        status.className = 'sync-status online';
        const photo = currentUser.photoURL
            ? '<img class="user-avatar" src="' + currentUser.photoURL + '" alt="" />'
            : '';
        bar.innerHTML = '<div class="user-info">' + photo +
            '<span class="user-name">' + (currentUser.displayName || currentUser.email) + '</span>' +
            '<button class="signout-btn" onclick="signOutUser()">Sign out</button></div>';
    } else {
        status.textContent = 'Local only';
        status.className = 'sync-status offline';
        bar.innerHTML = '<button class="auth-btn" onclick="signInWithGoogle()">Sign in with Google</button>';
    }
}

// ── Local storage fallback ──
function saveLocal() {
    localStorage.setItem('orbitdesk_assignments', JSON.stringify(assignments));
}
function loadLocal() {
    try {
        assignments = JSON.parse(localStorage.getItem('orbitdesk_assignments')) || [];
    } catch { assignments = []; }
}

// ── Migration ──
function migrateLocalToFirestore() {
    const raw = localStorage.getItem('orbitdesk_assignments');
    if (!raw) return;
    try {
        const items = JSON.parse(raw);
        if (!items.length) return;
        const batch = db.batch();
        items.forEach(item => {
            if (!item.id) item.id = genId();
            batch.set(assignmentsCol().doc(item.id), item);
        });
        batch.commit().then(() => {
            localStorage.removeItem('orbitdesk_assignments');
        }).catch(e => console.warn('Migration failed:', e));
    } catch { /* ignore */ }
}

// ── Real-time listener ──
function listenAssignments() {
    if (unsubscribe) unsubscribe();
    unsubscribe = assignmentsCol().orderBy('date').onSnapshot(snap => {
        assignments = [];
        snap.forEach(doc => {
            assignments.push({ id: doc.id, ...doc.data() });
        });
        render();
    }, err => {
        console.warn('Firestore assignments listen error:', err);
        loadLocal();
        render();
    });
}

// ── Generate ID ──
function genId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

// ── Add assignment ──
document.getElementById('addForm').addEventListener('submit', e => {
    e.preventDefault();
    const title = document.getElementById('addTitle').value.trim();
    const mod   = document.getElementById('addModule').value;
    const type  = document.getElementById('addType').value;
    const date  = document.getElementById('addDate').value;
    const time  = document.getElementById('addTime').value || '23:59';
    const prio  = document.getElementById('addPriority').value;
    const notes = document.getElementById('addNotes').value.trim();

    if (!title || !date) return;

    const item = {
        id: genId(),
        title, module: mod, type, date, time,
        priority: prio,
        notes,
        status: 'todo',
        created: new Date().toISOString()
    };

    if (currentUser) {
        assignmentsCol().doc(item.id).set(item).catch(e => console.warn('Save failed:', e));
    } else {
        assignments.push(item);
        saveLocal();
        render();
    }

    document.getElementById('addForm').reset();
    document.getElementById('addTime').value = '23:59';
});

// ── Update status ──
function moveItem(id, newStatus) {
    if (currentUser) {
        assignmentsCol().doc(id).update({ status: newStatus }).catch(e => console.warn(e));
    } else {
        const item = assignments.find(a => a.id === id);
        if (item) { item.status = newStatus; saveLocal(); render(); }
    }
}

// ── Delete ──
function deleteItem(id) {
    if (currentUser) {
        assignmentsCol().doc(id).delete().catch(e => console.warn(e));
    } else {
        assignments = assignments.filter(a => a.id !== id);
        saveLocal();
        render();
    }
}

// ── Filters ──
document.querySelectorAll('.filter-btn[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn[data-filter]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeStatusFilter = btn.dataset.filter;
        render();
    });
});
document.querySelectorAll('.filter-btn[data-module]').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn[data-module]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeModuleFilter = btn.dataset.module;
        render();
    });
});

// ── Render ──
function render() {
    renderStats();
    renderKanban();
    renderDeadlines();
}

function filtered() {
    return assignments.filter(a => {
        if (activeStatusFilter !== 'all' && a.status !== activeStatusFilter) return false;
        if (activeModuleFilter !== 'all' && a.module !== activeModuleFilter) return false;
        return true;
    });
}

function daysUntil(dateStr) {
    const now = new Date(); now.setHours(0,0,0,0);
    const d = new Date(dateStr + 'T00:00:00');
    return Math.ceil((d - now) / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr) {
    const d = new Date(dateStr + 'T00:00:00');
    return DAYS[d.getDay()].slice(0,3) + ', ' + d.getDate() + ' ' + MONTHS[d.getMonth()];
}

function dueClass(dateStr, status) {
    if (status === 'done') return '';
    const diff = daysUntil(dateStr);
    if (diff < 0) return 'overdue';
    if (diff === 0) return 'today';
    if (diff <= 3) return 'soon';
    return '';
}

function dueText(dateStr, status) {
    if (status === 'done') return 'Completed';
    const diff = daysUntil(dateStr);
    if (diff < 0) return Math.abs(diff) + ' day' + (Math.abs(diff)===1?'':'s') + ' overdue';
    if (diff === 0) return 'Due today';
    if (diff === 1) return 'Due tomorrow';
    return diff + ' days left';
}

function renderStats() {
    const el = document.getElementById('headerStats');
    if (!el) return;
    const todo = assignments.filter(a => a.status === 'todo').length;
    const prog = assignments.filter(a => a.status === 'in-progress').length;
    const done = assignments.filter(a => a.status === 'done').length;
    const overdue = assignments.filter(a => a.status !== 'done' && daysUntil(a.date) < 0).length;

    el.innerHTML =
        '<div class="header-stat">' +
            '<div class="header-stat-number">' + (todo + prog) + '</div>' +
            '<div class="header-stat-label">Active</div>' +
        '</div>' +
        '<div class="header-stat">' +
            '<div class="header-stat-number" style="color:' + (overdue ? 'var(--secondary)' : 'inherit') + '">' + overdue + '</div>' +
            '<div class="header-stat-label">Overdue</div>' +
        '</div>' +
        '<div class="header-stat">' +
            '<div class="header-stat-number">' + done + '</div>' +
            '<div class="header-stat-label">Done</div>' +
        '</div>';
}

function cardHTML(item) {
    const dc = dueClass(item.date, item.status);
    const prioClass = item.priority === 'high' ? ' card-priority-high' : '';
    let actions = '';
    if (item.status === 'todo') {
        actions = '<button class="card-action-btn" onclick="moveItem(\'' + item.id + '\',\'in-progress\')">Start</button>' +
                  '<button class="card-action-btn" onclick="moveItem(\'' + item.id + '\',\'done\')">Done</button>';
    } else if (item.status === 'in-progress') {
        actions = '<button class="card-action-btn" onclick="moveItem(\'' + item.id + '\',\'todo\')">Back</button>' +
                  '<button class="card-action-btn" onclick="moveItem(\'' + item.id + '\',\'done\')">Done</button>';
    } else {
        actions = '<button class="card-action-btn" onclick="moveItem(\'' + item.id + '\',\'todo\')">Reopen</button>';
    }
    actions += '<button class="card-action-btn delete" onclick="deleteItem(\'' + item.id + '\')">Delete</button>';

    return '<div class="kanban-card' + prioClass + '" data-module="' + item.module + '">' +
        '<div class="card-top">' +
            '<span class="card-module">' + item.module + '</span>' +
            '<span class="card-type">' + item.type + '</span>' +
        '</div>' +
        '<div class="card-title">' + escapeHtml(item.title) + '</div>' +
        '<div class="card-due ' + dc + '">' + formatDate(item.date) +
            (item.time ? ' · ' + item.time : '') +
            ' — ' + dueText(item.date, item.status) +
        '</div>' +
        (item.notes ? '<div class="card-notes">' + escapeHtml(item.notes) + '</div>' : '') +
        '<div class="card-actions">' + actions + '</div>' +
    '</div>';
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function renderKanban() {
    const items = filtered();
    const todo = items.filter(a => a.status === 'todo').sort((a,b) => a.date.localeCompare(b.date));
    const prog = items.filter(a => a.status === 'in-progress').sort((a,b) => a.date.localeCompare(b.date));
    const done = items.filter(a => a.status === 'done').sort((a,b) => b.date.localeCompare(a.date));

    document.getElementById('colTodo').innerHTML = todo.map(cardHTML).join('') || '<div style="color:var(--text-muted);font-size:12px;padding:10px;">No items</div>';
    document.getElementById('colProgress').innerHTML = prog.map(cardHTML).join('') || '<div style="color:var(--text-muted);font-size:12px;padding:10px;">No items</div>';
    document.getElementById('colDone').innerHTML = done.map(cardHTML).join('') || '<div style="color:var(--text-muted);font-size:12px;padding:10px;">No items</div>';

    document.getElementById('countTodo').textContent = todo.length;
    document.getElementById('countProgress').textContent = prog.length;
    document.getElementById('countDone').textContent = done.length;
}

function renderDeadlines() {
    const el = document.getElementById('deadlineList');
    if (!el) return;
    const upcoming = assignments
        .filter(a => a.status !== 'done')
        .sort((a,b) => a.date.localeCompare(b.date))
        .slice(0, 10);

    if (!upcoming.length) {
        el.innerHTML = '<div style="color:var(--text-muted);font-size:13px;padding:15px;">No upcoming deadlines — nice work!</div>';
        return;
    }

    el.innerHTML = upcoming.map(item => {
        const diff = daysUntil(item.date);
        const dc = dueClass(item.date, item.status);
        let dayText = diff;
        let dayLabel = 'days';
        if (diff < 0) { dayText = Math.abs(diff); dayLabel = 'overdue'; }
        else if (diff === 0) { dayText = '!'; dayLabel = 'today'; }
        else if (diff === 1) { dayLabel = 'day'; }

        return '<div class="deadline-row">' +
            '<div><div class="deadline-days" style="color:' +
                (dc === 'overdue' || dc === 'today' ? 'var(--secondary)' : dc === 'soon' ? 'var(--mod-orange)' : 'inherit') +
            '">' + dayText + '</div><div class="deadline-days-label">' + dayLabel + '</div></div>' +
            '<div class="deadline-module">' + item.module + '</div>' +
            '<div class="deadline-title">' + escapeHtml(item.title) + '</div>' +
            '<div class="deadline-date">' + formatDate(item.date) + (item.time ? ' · ' + item.time : '') + '</div>' +
            '<div class="deadline-status">' + item.status.replace('-',' ') + '</div>' +
        '</div>';
    }).join('');
}

// Initial render
loadLocal();
render();

// ── Collapsible add form (mainly for mobile) ──
const addToggle = document.getElementById('addToggle');
const addSection = document.getElementById('addSection');
if (addToggle && addSection) {
    // Start collapsed on mobile
    if (window.innerWidth <= 768) {
        addSection.classList.add('collapsed');
    }
    addToggle.addEventListener('click', () => {
        addSection.classList.toggle('collapsed');
    });
}
