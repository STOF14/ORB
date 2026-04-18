/* ── Orb — Planner Logic ── */
/* Requires: firebase-config.js loaded first */

let unsubscribeSnapshot = null;
let plannerMode = localStorage.getItem('planner_mode_preference') || 'timed';
let modeTransitionTimer = null;
let roughCarrySyncedKey = null;
const MODE_TRANSITION_MS = 320;
const ROUGH_CARRY_LOOKBACK_DAYS = 45;

const ROUGH_BUCKETS = ['PHY 255', 'WTW 211', 'WTW 218', 'COS 210', 'COS 212', 'Life/Admin'];
const ROUGH_BUCKET_ELEMENT_IDS = {
    'PHY 255': 'roughBucketPhy',
    'WTW 211': 'roughBucketWtw211',
    'WTW 218': 'roughBucketWtw218',
    'COS 210': 'roughBucketCos210',
    'COS 212': 'roughBucketCos212',
    'Life/Admin': 'roughBucketLife'
};
const ROUGH_TEMPLATE_SUGGESTIONS = {
    'PHY 255': ['revise lecture notes', 'finish tutorial questions', 'summarize practical work'],
    'WTW 211': ['review proofs', 'do 5 algebra questions', 'rewrite weak concepts'],
    'WTW 218': ['practice multivariable problems', 'review tutorial mistakes', 'do quick derivative drill'],
    'COS 210': ['review lecture examples', 'trace one algorithm by hand', 'clean up notes'],
    'COS 212': ['practice coding question', 'review practical prep', 'read ahead for next topic'],
    'Life/Admin': ['sort admin task', 'reset room and desk', 'plan tomorrow']
};

// ── Auth handler ──
auth.onAuthStateChanged(user => {
    currentUser = user;
    const authContent = document.getElementById('authContent');
    const syncStatus = document.getElementById('syncStatus');

    if (user) {
        authContent.innerHTML =
            '<div class="user-info">' +
            (user.photoURL ? '<img class="user-avatar" src="' + user.photoURL + '" alt="">' : '') +
            '<span class="user-name">' + (user.displayName || user.email) + '</span>' +
            '</div>' +
            '<button class="auth-btn sign-out" onclick="signOutUser()">Sign Out</button>';
        syncStatus.textContent = 'Synced';
        syncStatus.className = 'sync-status synced';
        migrateLocalToFirestore();
    } else {
        authContent.innerHTML =
            '<button class="auth-btn" onclick="signInWithGoogle()">Sign in with Google</button>';
        syncStatus.textContent = 'Local only';
        syncStatus.className = 'sync-status offline';
        if (unsubscribeSnapshot) {
            unsubscribeSnapshot();
            unsubscribeSnapshot = null;
        }
    }

    renderPlanner();
});

// ── Firestore doc path ──
function docRef(dateStr) {
    return db.collection('users').doc(currentUser.uid)
             .collection('planner').doc(dateStr);
}

function habitsDocRef(dateStr) {
    return db.collection('users').doc(currentUser.uid)
             .collection('habits').doc(dateStr);
}

function sleepDocRef(dateStr) {
    return db.collection('users').doc(currentUser.uid)
             .collection('sleep').doc(dateStr);
}

// ── Data: load / save ──
let cachedData = {};

function loadDataLocal(key) {
    try { return JSON.parse(localStorage.getItem('planner_' + key)) || {}; }
    catch { return {}; }
}

function saveDataLocal(key, data) {
    localStorage.setItem('planner_' + key, JSON.stringify(data));
}

async function loadData(key) {
    if (currentUser) {
        try {
            const snap = await docRef(key).get();
            if (snap.exists) {
                cachedData = snap.data();
                saveDataLocal(key, cachedData);
                validateAndMigrateData(cachedData);
                return cachedData;
            }
        } catch (e) {
            console.warn('Firestore read failed, using local:', e);
        }
    }
    cachedData = loadDataLocal(key);
    validateAndMigrateData(cachedData);
    return cachedData;
}

function saveData(key, data) {
    saveDataLocal(key, data);
    if (currentUser) {
        const syncEl = document.getElementById('syncStatus');
        syncEl.textContent = 'Syncing...';
        syncEl.className = 'sync-status syncing';
        docRef(key).set(data, { merge: true }).then(() => {
            syncEl.textContent = 'Synced';
            syncEl.className = 'sync-status synced';
        }).catch(err => {
            console.error('Firestore write error:', err);
            syncEl.textContent = 'Sync error';
            syncEl.className = 'sync-status offline';
        });
    }
}

// ── Real-time listener ──
function listenToDate(key) {
    if (unsubscribeSnapshot) unsubscribeSnapshot();
    if (!currentUser) return;
    unsubscribeSnapshot = docRef(key).onSnapshot(snap => {
        if (snap.exists && snap.metadata.hasPendingWrites === false) {
            cachedData = snap.data();
            saveDataLocal(key, cachedData);
            updateFieldsFromData(cachedData);
            updateStats();
        }
    });
}

function updateFieldsFromData(data) {
    const focused = document.activeElement;
    const focusIndex = focused && focused.dataset ? focused.dataset.index : null;

    document.querySelectorAll('.activity-input').forEach(input => {
        const idx = input.dataset.index;
        if (idx !== focusIndex) {
            const val = data['slot_' + idx] || '';
            if (input.value !== val) {
                input.value = val;
                autoResize(input);
            }
        }
    });

    document.querySelectorAll('.check-cell input[type="checkbox"]').forEach(cb => {
        const idx = cb.dataset.index;
        const checked = data['check_' + idx] || false;
        if (cb.checked !== checked) {
            cb.checked = checked;
            cb.closest('tr').classList.toggle('checked-row', checked);
        }
    });

    const notesEl = document.getElementById('roughNotes');
    if (notesEl && focused !== notesEl) {
        const notes = data.roughNotes || '';
        if (notesEl.value !== notes) notesEl.value = notes;
    }

    renderRoughPlan();
}

// ── Migrate localStorage → Firestore ──
async function migrateLocalToFirestore() {
    if (!currentUser) return;
    const migrated = localStorage.getItem('planner_migrated_' + currentUser.uid);
    if (migrated) return;

    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k.startsWith('planner_') && !k.includes('migrated')) {
            keys.push(k);
        }
    }

    if (keys.length === 0) {
        localStorage.setItem('planner_migrated_' + currentUser.uid, 'true');
        return;
    }

    const batch = db.batch();
    keys.forEach(k => {
        const dateStr = k.replace('planner_', '');
        try {
            const data = JSON.parse(localStorage.getItem(k));
            if (data && Object.keys(data).length > 0) {
                batch.set(docRef(dateStr), data, { merge: true });
            }
        } catch {}
    });

    try {
        await batch.commit();
        localStorage.setItem('planner_migrated_' + currentUser.uid, 'true');
        console.log('Migrated', keys.length, 'days to Firestore');
    } catch (e) {
        console.error('Migration failed:', e);
    }

    // Migrate habits and sleep too
    const habitKeys = [];
    const sleepKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith('habits_')) habitKeys.push(k);
        if (k && k.startsWith('sleep_')) sleepKeys.push(k);
    }
    if (habitKeys.length > 0 || sleepKeys.length > 0) {
        const batch2 = db.batch();
        habitKeys.forEach(k => {
            const dateStr = k.replace('habits_', '');
            try {
                const data = JSON.parse(localStorage.getItem(k));
                if (data && Object.keys(data).length > 0) {
                    batch2.set(habitsDocRef(dateStr), data, { merge: true });
                }
            } catch {}
        });
        sleepKeys.forEach(k => {
            const dateStr = k.replace('sleep_', '');
            try {
                const data = JSON.parse(localStorage.getItem(k));
                if (data && Object.keys(data).length > 0) {
                    batch2.set(sleepDocRef(dateStr), data, { merge: true });
                }
            } catch {}
        });
        try {
            await batch2.commit();
            console.log('Migrated habits/sleep to Firestore');
        } catch (e) {
            console.error('Habits/sleep migration failed:', e);
        }
    }
}

// ── Timetable auto-fill data (Semester 1) ──
const TIMETABLE = {
    1: { // Monday
        '08:30': { code: 'phy-255', text: 'PHY 255 Lecture (NS1 5-42)' },
        '11:30': { code: 'cos-210', text: 'COS 210 Lecture (IT 2-26)' },
        '12:30': { code: 'wtw-211', text: 'WTW 211 Lecture (Centenary 5)' },
        '13:30': { code: 'phy-255', text: 'PHY 255 Practical (NS1 5-42)' },
        '14:30': { code: 'phy-255', text: 'PHY 255 Practical (NS1 5-42)' },
        '15:30': { code: 'phy-255', text: 'PHY 255 Practical (NS1 5-42)' },
        '16:30': { code: 'cos-212', text: 'COS 212 Lecture (Large Chemistry Hall)' },
    },
    2: { // Tuesday
        '08:30': { code: 'wtw-218', text: 'WTW 218 Lecture (HB 4-3) G02' },
        '14:30': { code: 'phy-255', text: 'PHY 255 Lecture (NS1 5-42)' },
        '15:30': { code: 'phy-255', text: 'PHY 255 Tutorial (NS1 5-42)' },
        '16:30': { code: 'phy-255', text: 'PHY 255 Tutorial (NS1 5-42)' },
    },
    3: { // Wednesday
        '08:30': { code: 'cos-210', text: 'COS 210 Lecture (IT 2-26)' },
        '09:30': { code: 'cos-212', text: 'COS 212 Lecture (Louw Hall)' },
        '11:30': { code: 'wtw-218', text: 'WTW 218 Tutorial (HB 4-9) T03' },
        '12:30': { code: 'wtw-218', text: 'WTW 218 Tutorial (HB 4-9) T03 [Ends at 12:50]' },
        '15:30': { code: 'wtw-211', text: 'WTW 211 Tutorial (Roos Hall) T02 [Starts at 16:00]' },
        '16:30': { code: 'wtw-211', text: 'WTW 211 Tutorial (Roos Hall) T02' },
    },
    4: { // Thursday
        '08:30': { code: 'wtw-218', text: 'WTW 218 Lecture (HB 4-3) G01' },
        '12:30': { code: 'phy-255', text: 'PHY 255 Tutorial (NS1 5-42)' },
        '13:30': { code: 'phy-255', text: 'PHY 255 Lecture (NS1 5-42)' },
        '16:30': { code: 'cos-212', text: 'COS 212 Lecture (Roos Hall)' },
    },
    5: { // Friday
        '07:30': { code: 'wtw-211', text: 'WTW 211 Lecture (Centenary 5)' },
        '08:30': { code: 'phy-255', text: 'PHY 255 Lecture (NS1 5-42)' },
        '09:30': { code: 'cos-212', text: 'COS 212 Tutorial [Lecture] (Louw Hall)' },
        '11:30': { code: 'cos-212', text: 'COS 212 Practical (Informatorium CBT 1,2,3 Labs)' },
        '12:30': { code: 'cos-212', text: 'COS 212 Practical (Informatorium CBT 1,2,3 Labs)' },
        '13:30': { code: 'cos-212', text: 'COS 212 Practical (Informatorium CBT 1,2,3 Labs)' },
        '14:30': { code: 'cos-210', text: 'COS 210 Tutorial (IT 2-26)' },
    },
};

function getClassForSlot(date, slotStart) {
    const jsDay = date.getDay();
    if (jsDay === 0 || jsDay === 6) return null;
    const daySchedule = TIMETABLE[jsDay];
    if (!daySchedule) return null;
    return daySchedule[slotStart] || null;
}

// ── Time slots ──
const TIME_SLOTS = [
    { start: '05:30', end: '06:20', section: 'early' },
    { start: '06:30', end: '07:20', section: 'early' },
    { start: '07:30', end: '08:20', section: 'morning' },
    { start: '08:30', end: '09:20', section: 'morning' },
    { start: '09:30', end: '10:20', section: 'morning' },
    { start: '10:30', end: '11:20', section: 'morning' },
    { start: '11:30', end: '12:20', section: 'morning' },
    { start: '12:30', end: '13:20', section: 'afternoon' },
    { start: '13:30', end: '14:20', section: 'afternoon' },
    { start: '14:30', end: '15:20', section: 'afternoon' },
    { start: '15:30', end: '16:20', section: 'afternoon' },
    { start: '16:30', end: '17:20', section: 'afternoon' },
    { start: '17:30', end: '18:20', section: 'evening' },
    { start: '18:30', end: '19:20', section: 'evening' },
    { start: '19:30', end: '20:20', section: 'evening' },
    { start: '20:30', end: '21:20', section: 'evening' },
    { start: '21:30', end: '22:20', section: 'night' },
    { start: '22:30', end: '23:20', section: 'night' },
    { start: '23:30', end: '00:00', section: 'night' },
];

const SECTION_LABELS = {
    early:     'Early Morning',
    morning:   'Morning',
    afternoon: 'Afternoon',
    evening:   'Evening',
    night:     'Night',
};

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = MONTHS_LONG;

let currentDate = new Date();

function genRoughTaskId() {
    return 'rough_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function getRoughTasks(data = cachedData) {
    const tasks = data.roughTasks;
    if (!tasks || typeof tasks !== 'object' || Array.isArray(tasks)) return {};
    return tasks;
}

function getBucketTasks(bucket, data = cachedData) {
    const tasks = getRoughTasks(data)[bucket];
    return Array.isArray(tasks) ? tasks : [];
}

function normalizeRoughTask(task, fallbackDateKey) {
    const id = task && task.id ? task.id : genRoughTaskId();
    // Ensure carryId is always a valid string
    let carryId = task && task.carryId ? task.carryId : id;
    if (!carryId || typeof carryId !== 'string' || !carryId.trim()) {
        carryId = id;  // Fallback to id if carryId is invalid
    }
    return {
        id,
        carryId,
        text: task && typeof task.text === 'string' ? task.text : '',
        done: !!(task && task.done),
        createdOn: task && task.createdOn ? task.createdOn : fallbackDateKey,
        carriedFrom: task && task.carriedFrom ? task.carriedFrom : null
    };
}

function normalizeRoughTasksInData(data, fallbackDateKey) {
    if (!data || typeof data !== 'object') return false;
    const roughTasks = getRoughTasks(data);
    let changed = false;

    ROUGH_BUCKETS.forEach(bucket => {
        const tasks = Array.isArray(roughTasks[bucket]) ? roughTasks[bucket] : null;
        if (!tasks) return;
        const normalized = tasks.map(task => {
            const nextTask = normalizeRoughTask(task, fallbackDateKey);
            if (!task || task.id !== nextTask.id || task.carryId !== nextTask.carryId || task.createdOn !== nextTask.createdOn || task.carriedFrom !== nextTask.carriedFrom || task.done !== nextTask.done || task.text !== nextTask.text) {
                changed = true;
            }
            return nextTask;
        });
        data.roughTasks[bucket] = normalized;
    });

    return changed;
}

// Validate and migrate old planner data to new format
function validateAndMigrateData(data) {
    if (!data || typeof data !== 'object') return;
    
    // Ensure deletedCarryIds array exists
    if (!Array.isArray(data.deletedCarryIds)) {
        data.deletedCarryIds = [];
    }
    
    // Ensure all tasks have valid carryIds
    if (data.roughTasks && typeof data.roughTasks === 'object' && !Array.isArray(data.roughTasks)) {
        ROUGH_BUCKETS.forEach(bucket => {
            if (Array.isArray(data.roughTasks[bucket])) {
                data.roughTasks[bucket].forEach(task => {
                    // If task lacks carryId or it's invalid, assign one
                    if (!task.carryId || typeof task.carryId !== 'string' || !task.carryId.trim()) {
                        task.carryId = task.id || genRoughTaskId();
                    }
                    // Ensure task has an id
                    if (!task.id || typeof task.id !== 'string' || !task.id.trim()) {
                        task.id = genRoughTaskId();
                    }
                });
            }
        });
    }
}

async function readPlannerDataForKey(key) {
    if (currentUser) {
        try {
            const snap = await docRef(key).get();
            if (snap.exists) {
                const data = snap.data() || {};
                saveDataLocal(key, data);
                return data;
            }
        } catch (e) {
            console.warn('Planner carry read failed, using local:', e);
        }
    }
    return loadDataLocal(key);
}

function buildRoughCarryClone(task, fromDateKey) {
    // Ensure the carried task has a valid carryId
    const carryId = (task.carryId && typeof task.carryId === 'string' && task.carryId.trim())
        ? task.carryId
        : genRoughTaskId();
    return {
        id: genRoughTaskId(),
        carryId: carryId,
        text: task.text || '',
        done: false,
        createdOn: task.createdOn || fromDateKey,
        carriedFrom: fromDateKey
    };
}

// Clean up old deletions from 45+ days ago to prevent unbounded growth
function cleanupOldDeletions() {
    if (!cachedData.deletedCarryIds || cachedData.deletedCarryIds.length === 0) return false;
    
    // Periodically (e.g., weekly) clear the list to prevent unbounded growth
    const lastCleanup = parseInt(localStorage.getItem('planner_cleanup_time') || '0');
    const now = Date.now();
    if (now - lastCleanup > 7 * 24 * 60 * 60 * 1000) {  // Weekly cleanup
        cachedData.deletedCarryIds = [];
        localStorage.setItem('planner_cleanup_time', now.toString());
        console.log('[Planner] Cleared old deletion tracking (weekly cleanup)');
        return true;
    }
    return false;
}

async function syncCarriedRoughTasksForDate(key) {
    let changed = normalizeRoughTasksInData(cachedData, key);
    const currentCarryIds = new Set();
    const deletedCarryIds = new Set(cachedData.deletedCarryIds || []);

    ROUGH_BUCKETS.forEach(bucket => {
        getBucketTasks(bucket).forEach(task => {
            const normalized = normalizeRoughTask(task, key);
            currentCarryIds.add(normalized.carryId);
        });
    });

    const latestByCarry = new Map();
    const scanDate = new Date(currentDate);

    for (let offset = 1; offset <= ROUGH_CARRY_LOOKBACK_DAYS; offset++) {
        scanDate.setDate(scanDate.getDate() - 1);
        const prevKey = dateKey(scanDate);
        const prevData = await readPlannerDataForKey(prevKey);
        normalizeRoughTasksInData(prevData, prevKey);

        ROUGH_BUCKETS.forEach(bucket => {
            getBucketTasks(bucket, prevData).forEach(task => {
                const normalized = normalizeRoughTask(task, prevKey);
                if (!normalized.text.trim()) return;
                if (latestByCarry.has(normalized.carryId)) return;
                latestByCarry.set(normalized.carryId, { task: normalized, bucket, dateKey: prevKey });
            });
        });
    }

    latestByCarry.forEach(entry => {
        if (entry.task.done) return;
        if (currentCarryIds.has(entry.task.carryId)) return;
        // Skip tasks that were explicitly deleted
        if (deletedCarryIds.has(entry.task.carryId)) return;
        ensureBucketTasks(entry.bucket).push(buildRoughCarryClone(entry.task, entry.dateKey));
        currentCarryIds.add(entry.task.carryId);
        changed = true;
    });

    // Periodically clean up old deletion records
    if (cleanupOldDeletions()) {
        changed = true;
    }

    if (changed) {
        saveCurrentPlannerData();
    }
}

function ensureBucketTasks(bucket) {
    if (!cachedData.roughTasks || typeof cachedData.roughTasks !== 'object' || Array.isArray(cachedData.roughTasks)) {
        cachedData.roughTasks = {};
    }
    if (!Array.isArray(cachedData.roughTasks[bucket])) {
        cachedData.roughTasks[bucket] = [];
    }
    return cachedData.roughTasks[bucket];
}

function saveCurrentPlannerData() {
    saveData(dateKey(currentDate), cachedData);
}

function setPlannerMode(mode) {
    const nextMode = mode === 'rough' ? 'rough' : 'timed';
    if (nextMode === plannerMode) return;
    plannerMode = nextMode;
    localStorage.setItem('planner_mode_preference', plannerMode);
    updatePlannerModeUI({ animate: true });
}

function setViewVisible(view, visible) {
    if (!view) return;
    view.hidden = !visible;
    view.classList.remove('planner-morph-enter', 'planner-morph-exit');
    view.classList.toggle('planner-morph-active', visible);
}

function updatePlannerModeUI(opts = {}) {
    const animate = !!opts.animate;
    const timedView = document.getElementById('timedPlannerView');
    const roughView = document.getElementById('roughPlan');
    const timedBtn = document.getElementById('timedModeBtn');
    const roughBtn = document.getElementById('roughModeBtn');
    const timedExtras = ['freePeriods', 'habitTracker', 'sleepLogger']
        .map(id => document.getElementById(id))
        .filter(Boolean);
    const showRough = plannerMode === 'rough';
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timedGroup = [timedView].concat(timedExtras).filter(Boolean);
    const roughGroup = [roughView].filter(Boolean);
    const showGroup = showRough ? roughGroup : timedGroup;
    const hideGroup = showRough ? timedGroup : roughGroup;

    if (timedBtn) {
        timedBtn.classList.toggle('active', !showRough);
        timedBtn.setAttribute('aria-pressed', String(!showRough));
    }
    if (roughBtn) {
        roughBtn.classList.toggle('active', showRough);
        roughBtn.setAttribute('aria-pressed', String(showRough));
    }

    if (!animate || reduceMotion) {
        if (modeTransitionTimer) {
            clearTimeout(modeTransitionTimer);
            modeTransitionTimer = null;
        }
        timedGroup.forEach(view => setViewVisible(view, !showRough));
        roughGroup.forEach(view => setViewVisible(view, showRough));
        return;
    }

    if (modeTransitionTimer) {
        clearTimeout(modeTransitionTimer);
        modeTransitionTimer = null;
    }

    showGroup.forEach(view => {
        view.hidden = false;
        view.classList.remove('planner-morph-exit');
        view.classList.add('planner-morph-enter');
        // Force layout so the transition starts from enter state.
        void view.offsetHeight;
        view.classList.add('planner-morph-active');
        view.classList.remove('planner-morph-enter');
    });

    hideGroup.forEach(view => {
        view.classList.remove('planner-morph-enter', 'planner-morph-active');
        view.classList.add('planner-morph-exit');
    });

    modeTransitionTimer = setTimeout(() => {
        hideGroup.forEach(view => {
            view.hidden = true;
            view.classList.remove('planner-morph-enter', 'planner-morph-exit', 'planner-morph-active');
        });
        showGroup.forEach(view => {
            view.hidden = false;
            view.classList.remove('planner-morph-enter', 'planner-morph-exit');
            view.classList.add('planner-morph-active');
        });
        modeTransitionTimer = null;
    }, MODE_TRANSITION_MS);
}

function countClassLoad() {
    const daySchedule = TIMETABLE[currentDate.getDay()] || {};
    const counts = {};
    Object.values(daySchedule).forEach(entry => {
        const bucket = entry.code.replace('-', ' ').toUpperCase();
        counts[bucket] = (counts[bucket] || 0) + 1;
    });
    return counts;
}

function addRoughTask(bucket, text) {
    if (!ROUGH_BUCKETS.includes(bucket)) return;
    const items = ensureBucketTasks(bucket);
    const id = genRoughTaskId();
    
    // Validate and prepare task data
    if (!id || typeof id !== 'string' || !id.trim()) {
        console.error('Failed to generate valid task ID');
        return;
    }
    
    const newTask = {
        id: id,
        carryId: id,  // Ensure carryId equals id for new tasks
        text: (typeof text === 'string' ? text : '').trim(),
        done: false,
        createdOn: dateKey(currentDate),
        carriedFrom: null
    };
    
    items.push(newTask);
    saveCurrentPlannerData();
    renderRoughPlan();
}

function toggleRoughTask(bucket, taskId, done) {
    if (!ROUGH_BUCKETS.includes(bucket)) return;
    const items = ensureBucketTasks(bucket);
    const task = items.find(item => item.id === taskId);
    if (!task) return;
    task.done = done;
    saveCurrentPlannerData();
    renderRoughPlan();
    updateStats();
}

function updateRoughTaskText(bucket, taskId, text) {
    if (!ROUGH_BUCKETS.includes(bucket)) return;
    const items = ensureBucketTasks(bucket);
    const task = items.find(item => item.id === taskId);
    if (!task) return;
    task.text = text;
    saveCurrentPlannerData();
    renderRoughPlanSummary();
    renderRoughSuggestions();
    updateStats();
}

function deleteRoughTask(bucket, taskId) {
    if (!ROUGH_BUCKETS.includes(bucket)) return;
    const items = ensureBucketTasks(bucket);
    const taskToDelete = items.find(item => item.id === taskId);
    
    // Track the carryId of deleted tasks so they don't get re-carried forward
    if (taskToDelete && taskToDelete.carryId) {
        if (!cachedData.deletedCarryIds) {
            cachedData.deletedCarryIds = [];
        }
        if (!cachedData.deletedCarryIds.includes(taskToDelete.carryId)) {
            cachedData.deletedCarryIds.push(taskToDelete.carryId);
        }
    }
    
    cachedData.roughTasks[bucket] = items.filter(item => item.id !== taskId);
    saveCurrentPlannerData();
    renderRoughPlan();
    updateStats();
}

function getRoughTaskCounts() {
    let total = 0;
    let done = 0;
    ROUGH_BUCKETS.forEach(bucket => {
        getBucketTasks(bucket).forEach(task => {
            if (!task.text || !task.text.trim()) return;
            total++;
            if (task.done) done++;
        });
    });
    return { total, done, pending: total - done };
}

function getSuggestedModules() {
    const classLoad = countClassLoad();
    const modules = ROUGH_BUCKETS.map(bucket => {
        if (bucket === 'Life/Admin') return null;
        const tasks = getBucketTasks(bucket).filter(task => task.text && task.text.trim());
        const pending = tasks.filter(task => !task.done).length;
        return {
            bucket,
            pending,
            classCount: classLoad[bucket] || 0,
            score: pending * 3 + (classLoad[bucket] || 0)
        };
    }).filter(Boolean).sort((a, b) => b.score - a.score);

    return modules;
}

function renderRoughPlanSummary() {
    const summary = document.getElementById('roughPlanSummary');
    if (!summary) return;
    const counts = getRoughTaskCounts();
    const noteCount = (cachedData.roughNotes || '').trim().length;
    summary.innerHTML =
        '<div class="rough-plan__summary-number">' + counts.pending + '</div>' +
        '<div class="rough-plan__summary-copy">pending tasks' + (noteCount ? ' · notes saved' : '') + '</div>';
}

function renderRoughSuggestions() {
    const el = document.getElementById('roughSuggestions');
    if (!el) return;

    const classLoad = countClassLoad();
    const ranked = getSuggestedModules();
    const counts = getRoughTaskCounts();
    const cards = [];

    if (ranked.length && ranked[0].score > 0) {
        const top = ranked[0];
        cards.push({
            title: top.bucket,
            body: top.pending > 0
                ? top.pending + ' rough task' + (top.pending === 1 ? '' : 's') + ' still open. This is your best focus block.'
                : 'You have class load here today. Add one small review task so the day has direction.'
        });
    }

    const busyModule = Object.entries(classLoad).sort((a, b) => b[1] - a[1])[0];
    if (busyModule && !cards.some(card => card.title === busyModule[0])) {
        cards.push({
            title: busyModule[0],
            body: 'Heaviest class presence today. Good place for a short prep or recap task.'
        });
    }

    if (counts.total === 0) {
        cards.push({
            title: 'Start simple',
            body: 'Add 1 to 3 tasks only. One academic task, one catch-up task, one life/admin task is enough.'
        });
    } else if ((cachedData.roughNotes || '').trim().length < 20) {
        cards.push({
            title: 'Use the notes box',
            body: 'Drop deadlines, worries, or random reminders there so your task buckets stay clean.'
        });
    }

    while (cards.length < 3) {
        const bucket = ROUGH_BUCKETS[cards.length] || 'Life/Admin';
        const templates = ROUGH_TEMPLATE_SUGGESTIONS[bucket] || ROUGH_TEMPLATE_SUGGESTIONS['Life/Admin'];
        cards.push({
            title: bucket,
            body: 'Try: ' + templates[0]
        });
    }

    el.innerHTML = cards.slice(0, 3).map(card =>
        '<article class="rough-suggestion-card">' +
            '<div class="rough-suggestion-card__title">' + escapeHtml(card.title) + '</div>' +
            '<p>' + escapeHtml(card.body) + '</p>' +
        '</article>'
    ).join('');
}

function renderRoughBuckets() {
    ROUGH_BUCKETS.forEach(bucket => {
        const el = document.getElementById(ROUGH_BUCKET_ELEMENT_IDS[bucket]);
        if (!el) { console.warn('[Planner] Missing DOM element for bucket:', bucket); return; }
        const tasks = getBucketTasks(bucket);

        if (!tasks.length) {
            const suggestions = ROUGH_TEMPLATE_SUGGESTIONS[bucket] || [];
            el.innerHTML = '<div class="rough-task-empty">' +
                'Nothing here yet' + (suggestions[0] ? ' · try “' + escapeHtml(suggestions[0]) + '”' : '') +
                '</div>';
            return;
        }

        el.innerHTML = tasks.map(task =>
            '<div class="rough-task' + (task.done ? ' is-done' : '') + '">' +
                '<label class="rough-task__checkwrap">' +
                    '<input type="checkbox" data-role="rough-check" data-bucket="' + escapeHtml(bucket) + '" data-task-id="' + task.id + '" ' + (task.done ? 'checked' : '') + '>' +
                    '<span></span>' +
                '</label>' +
                '<input class="rough-task__input" type="text" data-role="rough-text" data-bucket="' + escapeHtml(bucket) + '" data-task-id="' + task.id + '" value="' + escapeHtml(task.text || '') + '" placeholder="Write one clear task...">' +
                '<button type="button" class="rough-task__delete" data-role="rough-delete" data-bucket="' + escapeHtml(bucket) + '" data-task-id="' + task.id + '" aria-label="Delete task">×</button>' +
            '</div>'
        ).join('');
    });
}

function renderRoughPlan() {
    const notesEl = document.getElementById('roughNotes');
    if (notesEl && document.activeElement !== notesEl && notesEl.value !== (cachedData.roughNotes || '')) {
        notesEl.value = cachedData.roughNotes || '';
    }
    renderRoughPlanSummary();
    renderRoughSuggestions();
    renderRoughBuckets();
}

function dateKey(d) {
    return d.getFullYear() + '-' +
           String(d.getMonth() + 1).padStart(2, '0') + '-' +
           String(d.getDate()).padStart(2, '0');
}

function formatDate(d) {
    return d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear();
}

function getPeriodLabel(start) {
    const h = parseInt(start.split(':')[0]);
    if (h < 7) return 'Early';
    if (h < 12) return 'AM';
    if (h < 17) return 'PM';
    if (h < 21) return 'Eve';
    return 'Night';
}

function timeToMinutes(t) {
    const [h, m] = t.split(':').map(Number);
    return h === 0 ? 24 * 60 : h * 60 + m;
}

// ── Render planner ──
async function renderPlanner() {
    const key = dateKey(currentDate);
    const data = await loadData(key);
    if (roughCarrySyncedKey !== key) {
        const roughPlanEl = document.getElementById('roughPlan');
        if (roughPlanEl) roughPlanEl.classList.add('rough-loading');
        await syncCarriedRoughTasksForDate(key);
        roughCarrySyncedKey = key;
        if (roughPlanEl) roughPlanEl.classList.remove('rough-loading');
    }
    listenToDate(key);
    const tbody = document.getElementById('plannerBody');
    const now = new Date();
    const isToday = dateKey(now) === key;
    const currentMin = now.getHours() * 60 + now.getMinutes();

    tbody.innerHTML = '';
    let lastSection = '';

    TIME_SLOTS.forEach((slot, i) => {
        if (slot.section !== lastSection) {
            lastSection = slot.section;
            const sectionRow = document.createElement('tr');
            sectionRow.className = 'section-row';
            sectionRow.innerHTML = '<td colspan="3">' + SECTION_LABELS[slot.section] + '</td>';
            tbody.appendChild(sectionRow);
        }

        const tr = document.createElement('tr');
        const slotStart = timeToMinutes(slot.start);
        const slotEnd = timeToMinutes(slot.end);
        const classInfo = getClassForSlot(currentDate, slot.start);

        if (isToday) {
            if (currentMin >= slotStart && currentMin < slotEnd) {
                tr.classList.add('current-slot');
            } else if (currentMin >= slotEnd) {
                tr.classList.add('past-slot');
            }
        }

        const checked = data['check_' + i] || false;
        if (checked) tr.classList.add('checked-row');

        const timeCellHtml =
            '<td class="time-cell">' +
                slot.start + '\u2013' + slot.end +
                '<span class="time-period">' + getPeriodLabel(slot.start) + '</span>' +
            '</td>';

        if (classInfo) {
            tr.classList.add('class-slot');
            const savedText = data['slot_' + i];
            const displayText = (savedText !== undefined && savedText !== '') ? savedText : classInfo.text;
            tr.innerHTML = timeCellHtml +
                '<td class="activity-cell">' +
                    '<textarea class="activity-input" rows="1" placeholder="' + classInfo.text + '" ' +
                    'data-index="' + i + '" data-class="' + classInfo.code + '">' +
                    (savedText || '') +
                    '</textarea>' +
                    '<span class="class-badge ' + classInfo.code + '">' + classInfo.code.replace('-', ' ').toUpperCase() + '</span>' +
                '</td>' +
                '<td class="check-cell">' +
                    '<input type="checkbox" data-index="' + i + '" ' +
                    (checked ? 'checked' : '') + '>' +
                '</td>';
        } else {
            tr.innerHTML = timeCellHtml +
                '<td class="activity-cell">' +
                    '<textarea class="activity-input" rows="1" placeholder="Plan something..." ' +
                    'data-index="' + i + '">' +
                    (data['slot_' + i] || '') +
                    '</textarea>' +
                '</td>' +
                '<td class="check-cell">' +
                    '<input type="checkbox" data-index="' + i + '" ' +
                    (checked ? 'checked' : '') + '>' +
                '</td>';
        }

        tbody.appendChild(tr);
    });

    document.getElementById('dateDisplay').textContent = formatDate(currentDate);
    document.getElementById('dayLabel').textContent = DAYS[currentDate.getDay()];

    tbody.querySelectorAll('.activity-input').forEach(input => {
        input.addEventListener('input', function () {
            autoResize(this);
            cachedData['slot_' + this.dataset.index] = this.value;
            saveData(dateKey(currentDate), cachedData);
            updateStats();
        });
        autoResize(input);
    });

    tbody.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', function () {
            cachedData['check_' + this.dataset.index] = this.checked;
            saveData(dateKey(currentDate), cachedData);
            const row = this.closest('tr');
            row.classList.toggle('checked-row', this.checked);
            updateStats();
        });
    });

    updateStats();
    renderRoughPlan();
    updatePlannerModeUI();

    if (isToday) {
        const cur = tbody.querySelector('.current-slot');
        if (cur) {
            setTimeout(() => cur.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
        }
    }
}

function autoResize(el) {
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
}

function updateStats() {
    const data = cachedData;
    let filled = 0, checked = 0, total = TIME_SLOTS.length;
    const jsDay = currentDate.getDay();
    const daySchedule = (jsDay >= 1 && jsDay <= 5) ? (TIMETABLE[jsDay] || {}) : {};
    const roughCounts = getRoughTaskCounts();

    TIME_SLOTS.forEach((slot, i) => {
        const hasClass = !!daySchedule[slot.start];
        if ((data['slot_' + i] && data['slot_' + i].trim()) || hasClass) filled++;
        if (data['check_' + i]) checked++;
    });

    document.getElementById('stats').innerHTML =
        '<span>' + filled + '</span> / ' + total + ' planned — ' +
        '<span>' + checked + '</span> / ' + total + ' done' +
        (roughCounts.total ? ' · <span>' + roughCounts.pending + '</span> rough tasks left' : '');

    renderRoughPlanSummary();
}

function changeDate(delta) {
    currentDate.setDate(currentDate.getDate() + delta);
    renderPlanner();
}

function goToday() {
    currentDate = new Date();
    renderPlanner();
}

async function clearDay() {
    if (!confirm('Clear all entries for ' + formatDate(currentDate) + '?')) return;
    const key = dateKey(currentDate);
    localStorage.removeItem('planner_' + key);
    if (currentUser) {
        try { await docRef(key).delete(); } catch (e) { console.warn(e); }
    }
    cachedData = {};
    renderPlanner();
}

function bindPlannerModeToggle() {
    const timedBtn = document.getElementById('timedModeBtn');
    const roughBtn = document.getElementById('roughModeBtn');
    if (timedBtn) timedBtn.addEventListener('click', () => setPlannerMode('timed'));
    if (roughBtn) roughBtn.addEventListener('click', () => setPlannerMode('rough'));
}

function bindRoughPlanEvents() {
    const notesEl = document.getElementById('roughNotes');
    const bucketsEl = document.getElementById('roughBuckets');

    if (notesEl) {
        notesEl.addEventListener('input', function () {
            cachedData.roughNotes = this.value;
            saveCurrentPlannerData();
            renderRoughPlanSummary();
            renderRoughSuggestions();
        });
    }

    if (bucketsEl) {
        bucketsEl.addEventListener('click', event => {
            const addBtn = event.target.closest('.rough-add-btn');
            if (addBtn) {
                addRoughTask(addBtn.dataset.bucket, '');
                setTimeout(() => {
                    const list = document.getElementById(ROUGH_BUCKET_ELEMENT_IDS[addBtn.dataset.bucket]);
                    const lastInput = list ? list.querySelector('.rough-task:last-child .rough-task__input') : null;
                    if (lastInput) lastInput.focus();
                }, 0);
                return;
            }

            const deleteBtn = event.target.closest('[data-role="rough-delete"]');
            if (deleteBtn) {
                deleteRoughTask(deleteBtn.dataset.bucket, deleteBtn.dataset.taskId);
            }
        });

        bucketsEl.addEventListener('change', event => {
            if (event.target.matches('[data-role="rough-check"]')) {
                toggleRoughTask(event.target.dataset.bucket, event.target.dataset.taskId, event.target.checked);
            }
        });

        bucketsEl.addEventListener('input', event => {
            if (event.target.matches('[data-role="rough-text"]')) {
                updateRoughTaskText(event.target.dataset.bucket, event.target.dataset.taskId, event.target.value);
            }
        });

        bucketsEl.addEventListener('focusout', event => {
            if (event.target.matches('[data-role="rough-text"]') && !event.target.value.trim()) {
                deleteRoughTask(event.target.dataset.bucket, event.target.dataset.taskId);
            }
        });
    }
}


// ── Free Period Optimizer ──
const STUDY_SUGGESTIONS = [
    'Review lecture notes',
    'Practice problems',
    'Read textbook chapter',
    'Work on assignment',
    'Flashcard review',
    'Past paper practice',
    'Group study prep',
    'Lab report writing',
];

function renderFreePeriods() {
    const container = document.getElementById('freePeriods');
    const list = document.getElementById('freeSlotsList');
    const jsDay = currentDate.getDay();
    if (jsDay === 0 || jsDay === 6) { container.style.display = 'none'; return; }
    const daySchedule = TIMETABLE[jsDay] || {};
    const classSlots = new Set(Object.keys(daySchedule));
    const uniSlots = TIME_SLOTS.filter(s => {
        const h = parseInt(s.start.split(':')[0]);
        return h >= 7 && h < 17;
    });
    const freeSlots = [];
    let blockStart = null, blockSlots = [];
    uniSlots.forEach(slot => {
        if (!classSlots.has(slot.start)) {
            if (!blockStart) blockStart = slot.start;
            blockSlots.push(slot);
        } else {
            if (blockStart) {
                freeSlots.push({ start: blockStart, end: blockSlots[blockSlots.length - 1].end, duration: blockSlots.length * 50 });
                blockStart = null; blockSlots = [];
            }
        }
    });
    if (blockStart) freeSlots.push({ start: blockStart, end: blockSlots[blockSlots.length - 1].end, duration: blockSlots.length * 50 });
    if (freeSlots.length === 0) { container.style.display = 'none'; return; }
    container.style.display = 'block';
    list.innerHTML = freeSlots.map((slot, i) => {
        const suggestion = STUDY_SUGGESTIONS[i % STUDY_SUGGESTIONS.length];
        const dur = slot.duration >= 60 ? Math.floor(slot.duration / 60) + 'h ' + (slot.duration % 60) + 'm' : slot.duration + ' min';
        return '<div class="free-slot">' +
            '<span class="free-slot-time">' + slot.start + ' \u2013 ' + slot.end + '</span>' +
            '<span class="free-slot-suggestion">' + suggestion + '</span>' +
            '<span class="free-slot-duration">' + dur + '</span></div>';
    }).join('');
}

// ── Habit Tracker ──
const HABITS = [
    { id: 'exercise', label: 'Exercise / Gym' },
    { id: 'review', label: 'Review lecture notes' },
    { id: 'water', label: 'Drink 2L+ water' },
    { id: 'no_phone', label: 'No phone in lectures' },
    { id: 'sleep8', label: '8 hours sleep' },
    { id: 'meal', label: '3 proper meals' },
];

function loadHabitData(dateStr) {
    try { return JSON.parse(localStorage.getItem('habits_' + dateStr)) || {}; }
    catch { return {}; }
}

function saveHabitData(dateStr, data) {
    localStorage.setItem('habits_' + dateStr, JSON.stringify(data));
    if (currentUser) {
        habitsDocRef(dateStr).set(data, { merge: true }).catch(err => {
            console.warn('Habits sync error:', err);
        });
    }
}

async function loadHabitDataAsync(dateStr) {
    if (currentUser) {
        try {
            const snap = await habitsDocRef(dateStr).get();
            if (snap.exists) {
                const data = snap.data();
                localStorage.setItem('habits_' + dateStr, JSON.stringify(data));
                return data;
            }
        } catch (e) {
            console.warn('Habits Firestore read failed:', e);
        }
    }
    return loadHabitData(dateStr);
}

function getStreak(habitId) {
    let streak = 0;
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 1);
    for (let i = 0; i < 30; i++) {
        const data = loadHabitData(dateKey(d));
        if (data[habitId]) { streak++; d.setDate(d.getDate() - 1); }
        else break;
    }
    return streak;
}

async function renderHabits() {
    const list = document.getElementById('habitList');
    const key = dateKey(currentDate);
    const data = await loadHabitDataAsync(key);
    let doneCount = 0;
    list.innerHTML = HABITS.map(h => {
        const checked = data[h.id] || false;
        if (checked) doneCount++;
        const streak = getStreak(h.id);
        const streakText = streak > 0 ? streak + 'd streak' : '';
        return '<li class="habit-item' + (checked ? ' done' : '') + '">' +
            '<input type="checkbox" id="habit_' + h.id + '" ' + (checked ? 'checked' : '') +
            ' onchange="toggleHabit(\'' + h.id + '\', this.checked)">' +
            '<label for="habit_' + h.id + '">' + h.label + '</label>' +
            (streakText ? '<span class="habit-streak">\uD83D\uDD25 ' + streakText + '</span>' : '') +
            '</li>';
    }).join('');
    document.getElementById('habitScore').textContent = doneCount + ' / ' + HABITS.length + ' completed';
}

function toggleHabit(habitId, checked) {
    const key = dateKey(currentDate);
    const data = loadHabitData(key);
    data[habitId] = checked;
    saveHabitData(key, data);
    renderHabits();
}

// ── Sleep Logger ──
async function loadSleep() {
    const key = dateKey(currentDate);
    let data = null;
    if (currentUser) {
        try {
            const snap = await sleepDocRef(key).get();
            if (snap.exists) {
                data = snap.data();
                localStorage.setItem('sleep_' + key, JSON.stringify(data));
            }
        } catch (e) {
            console.warn('Sleep Firestore read failed:', e);
        }
    }
    if (!data) {
        try { data = JSON.parse(localStorage.getItem('sleep_' + key)); } catch {}
    }
    if (data) {
        document.getElementById('sleepBed').value = data.bed || '23:00';
        document.getElementById('sleepWake').value = data.wake || '06:30';
        calcSleep();
    } else {
        document.getElementById('sleepBed').value = '23:00';
        document.getElementById('sleepWake').value = '06:30';
        document.getElementById('sleepResult').innerHTML = '\u2014<small>hours</small>';
        document.getElementById('sleepQuality').textContent = '';
    }
}

function calcSleep() {
    const bed = document.getElementById('sleepBed').value;
    const wake = document.getElementById('sleepWake').value;
    if (!bed || !wake) return;
    const [bh, bm] = bed.split(':').map(Number);
    const [wh, wm] = wake.split(':').map(Number);
    let bedMin = bh * 60 + bm, wakeMin = wh * 60 + wm;
    if (wakeMin <= bedMin) wakeMin += 24 * 60;
    const hours = ((wakeMin - bedMin) / 60).toFixed(1);
    document.getElementById('sleepResult').innerHTML = hours + '<small>hours</small>';
    const quality = document.getElementById('sleepQuality');
    if (hours >= 7.5) { quality.textContent = '\u2713 Great sleep'; quality.className = 'sleep-quality good'; }
    else if (hours >= 6) { quality.textContent = '\u26A0 Could be better'; quality.className = 'sleep-quality ok'; }
    else { quality.textContent = '\u2717 Not enough sleep'; quality.className = 'sleep-quality bad'; }
    const sleepData = { bed: bed, wake: wake, hours: parseFloat(hours) };
    localStorage.setItem('sleep_' + dateKey(currentDate), JSON.stringify(sleepData));
    if (currentUser) {
        sleepDocRef(dateKey(currentDate)).set(sleepData, { merge: true }).catch(err => {
            console.warn('Sleep sync error:', err);
        });
    }
}

document.getElementById('sleepBed').addEventListener('change', calcSleep);
document.getElementById('sleepWake').addEventListener('change', calcSleep);

// Hook into renderPlanner to also render extra sections
const _origRenderPlanner = renderPlanner;
renderPlanner = async function() {
    await _origRenderPlanner();
    renderFreePeriods();
    renderHabits();
    loadSleep();
    updatePlannerModeUI();
};

bindPlannerModeToggle();
bindRoughPlanEvents();
updatePlannerModeUI();
renderPlanner();

// Update current-slot highlighting every minute
setInterval(() => {
    if (dateKey(new Date()) === dateKey(currentDate)) {
        renderPlanner();
    }
}, 60000);
