/* ============================================================
   Orb — Analytics & Review Logic
   Aggregates planner, focus, sleep, habit, and assignment data
   ============================================================ */

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAY_LABELS = ['S','M','T','W','T','F','S'];
const DAY_NAMES  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

let activePeriod = 'week';

// ── Firestore helpers ──
function plannerDoc(dateStr) {
    return db.collection('users').doc(currentUser.uid).collection('planner').doc(dateStr);
}
function statsDoc() {
    return db.collection('users').doc(currentUser.uid).collection('meta').doc('focus_stats');
}
function sleepDoc(dateStr) {
    return db.collection('users').doc(currentUser.uid).collection('sleep').doc(dateStr);
}
function habitsDoc(dateStr) {
    return db.collection('users').doc(currentUser.uid).collection('habits').doc(dateStr);
}
function assignmentsCol() {
    return db.collection('users').doc(currentUser.uid).collection('assignments');
}

// ── Auth ──
auth.onAuthStateChanged(user => {
    currentUser = user;
    updateAuthUI();
    refresh();
});

function updateAuthUI() {
    const bar = document.getElementById('authContent');
    const status = document.getElementById('syncStatus');
    if (!bar) return;
    if (currentUser) {
        status.textContent = 'Synced';
        status.className = 'sync-status online';
        const photo = currentUser.photoURL
            ? '<img class="user-avatar" src="' + currentUser.photoURL + '" alt="" />' : '';
        bar.innerHTML = '<div class="user-info">' + photo +
            '<span class="user-name">' + (currentUser.displayName || currentUser.email) + '</span>' +
            '<button class="signout-btn" onclick="signOutUser()">Sign out</button></div>';
    } else {
        status.textContent = 'Local only';
        status.className = 'sync-status offline';
        bar.innerHTML = '<button class="auth-btn" onclick="signInWithGoogle()">Sign in with Google</button>';
    }
}

// ── Period buttons ──
document.querySelectorAll('.period-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activePeriod = btn.dataset.period;
        refresh();
    });
});

// ── Date range for period ── (defined at bottom with mobile optimization)

function fmtKey(d) {
    return d.getFullYear() + '-' +
        String(d.getMonth()+1).padStart(2,'0') + '-' +
        String(d.getDate()).padStart(2,'0');
}

// ── Data loaders ──
async function loadPlanner(key) {
    if (currentUser) {
        try {
            const snap = await plannerDoc(key).get();
            if (snap.exists) return snap.data();
        } catch(e) { /* fallback */ }
    }
    try { return JSON.parse(localStorage.getItem('planner_' + key)) || {}; } catch { return {}; }
}

async function loadFocusStats() {
    if (currentUser) {
        try {
            const snap = await statsDoc().get();
            if (snap.exists) return snap.data();
        } catch(e) { /* fallback */ }
    }
    try { return JSON.parse(localStorage.getItem('focus_stats')) || {}; } catch { return {}; }
}

async function loadSleep(key) {
    if (currentUser) {
        try {
            const snap = await sleepDoc(key).get();
            if (snap.exists) return snap.data();
        } catch(e) { /* fallback */ }
    }
    try { return JSON.parse(localStorage.getItem('sleep_' + key)) || null; } catch { return null; }
}

async function loadHabits(key) {
    if (currentUser) {
        try {
            const snap = await habitsDoc(key).get();
            if (snap.exists) return snap.data();
        } catch(e) { /* fallback */ }
    }
    try { return JSON.parse(localStorage.getItem('habits_' + key)) || null; } catch { return null; }
}

async function loadAssignments() {
    if (currentUser) {
        try {
            const snap = await assignmentsCol().get();
            const items = [];
            snap.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
            return items;
        } catch(e) { /* fallback */ }
    }
    try { return JSON.parse(localStorage.getItem('orbitdesk_assignments')) || []; } catch { return []; }
}

// ── Main refresh ──
async function refresh() {
    const dates = getDateRange();
    const keys = dates.map(fmtKey);

    // Load all data in parallel batches
    const focusStats = await loadFocusStats();

    const plannerData = {};
    const sleepData = {};
    const habitData = {};

    // Process in small batches to avoid overwhelming Firestore
    for (let i = 0; i < keys.length; i += 7) {
        const batch = keys.slice(i, i + 7);
        const results = await Promise.all(batch.map(async k => ({
            key: k,
            planner: await loadPlanner(k),
            sleep: await loadSleep(k),
            habits: await loadHabits(k)
        })));
        results.forEach(r => {
            plannerData[r.key] = r.planner;
            sleepData[r.key] = r.sleep;
            habitData[r.key] = r.habits;
        });
    }

    const assignmentsList = await loadAssignments();

    renderSummary(dates, keys, focusStats, plannerData, sleepData, assignmentsList);
    renderFocusChart(dates, keys, focusStats);
    renderSleepChart(dates, keys, sleepData);
    renderTaskChart(dates, keys, plannerData);
    renderModuleBreakdown(assignmentsList);
    renderHabitGrid(dates, keys, habitData);
}

// ── Summary cards ──
function renderSummary(dates, keys, focusStats, plannerData, sleepData, assignments) {
    let totalSessions = 0, totalMinutes = 0;
    let tasksDone = 0, tasksPlanned = 0;
    let sleepHours = [];

    keys.forEach(key => {
        if (focusStats[key]) {
            totalSessions += focusStats[key].sessions || 0;
            totalMinutes  += focusStats[key].minutes || 0;
        }

        const p = plannerData[key] || {};
        for (let s = 0; s < 19; s++) {
            if (p['slot_' + s] && p['slot_' + s].trim()) tasksPlanned++;
            if (p['check_' + s]) tasksDone++;
        }

        const sl = sleepData[key];
        if (sl && sl.hours) sleepHours.push(parseFloat(sl.hours));
    });

    const avgSleep = sleepHours.length
        ? (sleepHours.reduce((a,b)=>a+b,0) / sleepHours.length).toFixed(1)
        : '—';
    const minSleep = sleepHours.length ? Math.min(...sleepHours).toFixed(1) : '—';
    const maxSleep = sleepHours.length ? Math.max(...sleepHours).toFixed(1) : '—';
    const completionRate = tasksPlanned > 0
        ? Math.round((tasksDone / tasksPlanned) * 100) + '%'
        : '—';

    const assignDone = assignments.filter(a => a.status === 'done').length;

    document.getElementById('sumFocusSessions').textContent = totalSessions;
    document.getElementById('sumFocusMinutes').textContent = totalMinutes + ' min total';
    document.getElementById('sumTasksDone').textContent = tasksDone;
    document.getElementById('sumTasksPlanned').textContent = tasksPlanned + ' planned';
    document.getElementById('sumAvgSleep').textContent = avgSleep;
    document.getElementById('sumSleepRange').textContent = minSleep + ' – ' + maxSleep + ' hrs range';
    document.getElementById('sumCompletionRate').textContent = completionRate;
    document.getElementById('sumStreak').textContent = assignDone + ' assignments done';
}

// ── Focus chart ──
function renderFocusChart(dates, keys, focusStats) {
    const el = document.getElementById('focusChart');
    const legend = document.getElementById('focusLegend');
    if (!el) return;

    const vals = keys.map(k => (focusStats[k] && focusStats[k].sessions) || 0);
    const max = Math.max(1, ...vals);

    el.innerHTML = dates.map((d, i) => {
        const v = vals[i];
        const h = v > 0 ? Math.max(4, (v / max) * 100) : 2;
        const cls = v === 0 ? 'zero' : v >= 3 ? 'good' : v >= 1 ? 'mid' : 'zero';
        const label = activePeriod === 'all'
            ? (d.getDate() === 1 ? MONTHS[d.getMonth()] : '')
            : DAY_LABELS[d.getDay()];
        return '<div class="bar-wrap">' +
            '<div class="bar-value">' + (v || '') + '</div>' +
            '<div class="bar ' + cls + '" style="height:' + h + 'px"></div>' +
            '<div class="bar-label">' + label + '</div>' +
        '</div>';
    }).join('');

    legend.innerHTML =
        '<div class="legend-item"><div class="legend-dot" style="background:#22c55e"></div>3+ sessions</div>' +
        '<div class="legend-item"><div class="legend-dot" style="background:var(--mod-orange)"></div>1-2</div>' +
        '<div class="legend-item"><div class="legend-dot" style="background:var(--grid-line)"></div>None</div>';
}

// ── Sleep chart ──
function renderSleepChart(dates, keys, sleepData) {
    const el = document.getElementById('sleepChart');
    const legend = document.getElementById('sleepLegend');
    if (!el) return;

    const vals = keys.map(k => {
        const s = sleepData[k];
        return s && s.hours ? parseFloat(s.hours) : 0;
    });
    const max = Math.max(10, ...vals);

    el.innerHTML = dates.map((d, i) => {
        const v = vals[i];
        const h = v > 0 ? Math.max(4, (v / max) * 140) : 2;
        const cls = v === 0 ? 'zero' : v < 6 ? 'low' : v < 7 ? 'mid' : 'good';
        const label = activePeriod === 'all'
            ? (d.getDate() === 1 ? MONTHS[d.getMonth()] : '')
            : DAY_LABELS[d.getDay()];
        return '<div class="bar-wrap">' +
            '<div class="bar-value">' + (v ? v.toFixed(1) : '') + '</div>' +
            '<div class="bar ' + cls + '" style="height:' + h + 'px"></div>' +
            '<div class="bar-label">' + label + '</div>' +
        '</div>';
    }).join('');

    legend.innerHTML =
        '<div class="legend-item"><div class="legend-dot" style="background:#22c55e"></div>7+ hrs</div>' +
        '<div class="legend-item"><div class="legend-dot" style="background:var(--mod-orange)"></div>6-7 hrs</div>' +
        '<div class="legend-item"><div class="legend-dot" style="background:var(--secondary)"></div>&lt;6 hrs</div>';
}

// ── Task completion chart ──
function renderTaskChart(dates, keys, plannerData) {
    const el = document.getElementById('taskChart');
    if (!el) return;

    const vals = keys.map(k => {
        const p = plannerData[k] || {};
        let done = 0, total = 0;
        for (let s = 0; s < 19; s++) {
            if (p['slot_' + s] && p['slot_' + s].trim()) total++;
            if (p['check_' + s]) done++;
        }
        return { done, total };
    });
    const maxT = Math.max(1, ...vals.map(v => v.total));

    el.innerHTML = dates.map((d, i) => {
        const { done, total } = vals[i];
        const h = total > 0 ? Math.max(4, (done / maxT) * 100) : 2;
        const pct = total > 0 ? Math.round((done / total) * 100) : 0;
        const cls = total === 0 ? 'zero' : pct >= 80 ? 'good' : pct >= 50 ? 'mid' : pct > 0 ? 'low' : 'zero';
        const label = activePeriod === 'all'
            ? (d.getDate() === 1 ? MONTHS[d.getMonth()] : '')
            : DAY_LABELS[d.getDay()];
        return '<div class="bar-wrap">' +
            '<div class="bar-value">' + (total > 0 ? done + '/' + total : '') + '</div>' +
            '<div class="bar ' + cls + '" style="height:' + h + 'px"></div>' +
            '<div class="bar-label">' + label + '</div>' +
        '</div>';
    }).join('');
}

// ── Module breakdown ──
function renderModuleBreakdown(assignments) {
    const el = document.getElementById('moduleBreakdown');
    if (!el) return;

    const modules = ['PHY 255', 'WTW 211', 'WTW 218', 'COS 210', 'COS 212'];
    const colors = {
        'PHY 255': 'var(--mod-red)',
        'WTW 211': 'var(--mod-orange)',
        'WTW 218': 'var(--mod-yellow)',
        'COS 210': 'var(--mod-blue)',
        'COS 212': 'var(--mod-dark-blue)'
    };

    const counts = {};
    const doneCounts = {};
    modules.forEach(m => { counts[m] = 0; doneCounts[m] = 0; });
    assignments.forEach(a => {
        if (counts[a.module] !== undefined) {
            counts[a.module]++;
            if (a.status === 'done') doneCounts[a.module]++;
        }
    });
    const maxCount = Math.max(1, ...Object.values(counts));

    el.innerHTML = modules.map(m => {
        const pct = (counts[m] / maxCount) * 100;
        const donePct = counts[m] > 0 ? Math.round((doneCounts[m] / counts[m]) * 100) : 0;
        return '<div class="module-row">' +
            '<div class="module-row-label">' + m + '</div>' +
            '<div class="module-bar-track"><div class="module-bar-fill" style="width:' + pct + '%;background:' + colors[m] + '"></div></div>' +
            '<div class="module-row-count">' + doneCounts[m] + '/' + counts[m] + ' (' + donePct + '%)</div>' +
        '</div>';
    }).join('');

    if (!assignments.length) {
        el.innerHTML = '<div style="color:var(--text-muted);font-size:13px;">No assignments tracked yet — add some on the Assignments page</div>';
    }
}

// ── Habit consistency grid ──
function renderHabitGrid(dates, keys, habitData) {
    const el = document.getElementById('habitGrid');
    if (!el) return;

    // Collect all habit names
    const habitNames = new Set();
    keys.forEach(k => {
        const h = habitData[k];
        if (h) Object.keys(h).forEach(name => habitNames.add(name));
    });

    if (!habitNames.size) {
        el.innerHTML = '<div style="color:var(--text-muted);font-size:13px;">No habit data yet — track habits in the Day Planner</div>';
        return;
    }

    el.innerHTML = Array.from(habitNames).map(name => {
        let doneCount = 0;
        const dots = keys.map(k => {
            const h = habitData[k];
            const done = h && h[name];
            if (done) doneCount++;
            return '<div class="habit-dot ' + (done ? 'done' : 'missed') + '" title="' +
                k + ': ' + (done ? 'Done' : 'Missed') + '"></div>';
        }).join('');

        const pct = keys.length > 0 ? Math.round((doneCount / keys.length) * 100) : 0;

        return '<div class="habit-row">' +
            '<div class="habit-name">' + escapeHtml(name) + '</div>' +
            '<div class="habit-dots">' + dots + '</div>' +
            '<div class="habit-pct">' + pct + '%</div>' +
        '</div>';
    }).join('');
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ── Mobile: limit "All Time" bar charts to last 30 days to keep them usable ──
function getDateRange() {
    const now = new Date();
    now.setHours(0,0,0,0);
    const dates = [];

    if (activePeriod === 'week') {
        const dow = now.getDay();
        const mondayOff = dow === 0 ? -6 : 1 - dow;
        const monday = new Date(now);
        monday.setDate(now.getDate() + mondayOff);
        for (let i = 0; i < 7; i++) {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            dates.push(d);
        }
    } else if (activePeriod === 'month') {
        const first = new Date(now.getFullYear(), now.getMonth(), 1);
        const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        for (let d = new Date(first); d <= last; d.setDate(d.getDate() + 1)) {
            dates.push(new Date(d));
        }
    } else {
        const start = new Date('2026-02-09T00:00:00');
        // On mobile, cap to last 30 days for usability
        const mobileStart = window.innerWidth <= 768
            ? new Date(Math.max(start.getTime(), now.getTime() - 30 * 86400000))
            : start;
        for (let d = new Date(mobileStart); d <= now; d.setDate(d.getDate() + 1)) {
            dates.push(new Date(d));
        }
    }
    return dates;
}

// Initial load
refresh();
