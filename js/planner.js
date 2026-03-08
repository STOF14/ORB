/* ── OrbitDesk — Planner Logic ── */
/* Requires: firebase-config.js loaded first */

let unsubscribeSnapshot = null;

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
                return cachedData;
            }
        } catch (e) {
            console.warn('Firestore read failed, using local:', e);
        }
    }
    cachedData = loadDataLocal(key);
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
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'];

let currentDate = new Date();

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

    TIME_SLOTS.forEach((slot, i) => {
        const hasClass = !!daySchedule[slot.start];
        if ((data['slot_' + i] && data['slot_' + i].trim()) || hasClass) filled++;
        if (data['check_' + i]) checked++;
    });

    document.getElementById('stats').innerHTML =
        '<span>' + filled + '</span> / ' + total + ' planned — ' +
        '<span>' + checked + '</span> / ' + total + ' done';
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

// Init
renderPlanner();

// Update current-slot highlighting every minute
setInterval(() => {
    if (dateKey(new Date()) === dateKey(currentDate)) {
        renderPlanner();
    }
}, 60000);

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
};
renderPlanner();
