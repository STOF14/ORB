/* ── Orb — Dashboard Logic ── */
/* Requires: firebase-config.js loaded first */

// ── Auth listener ──
auth.onAuthStateChanged(user => {
    currentUser = user;
    renderWeeklyReview();
});

// ── Firestore doc path helpers ──
function docRefPlanner(dateStr) {
    return db.collection('users').doc(currentUser.uid)
             .collection('planner').doc(dateStr);
}
function docRefStats() {
    return db.collection('users').doc(currentUser.uid)
             .collection('meta').doc('focus_stats');
}
function docRefSleep(dateStr) {
    return db.collection('users').doc(currentUser.uid)
             .collection('sleep').doc(dateStr);
}

// ── Data loaders (Firestore → localStorage fallback) ──
async function loadPlannerData(key) {
    if (currentUser) {
        try {
            const snap = await docRefPlanner(key).get();
            if (snap.exists) {
                localStorage.setItem('planner_' + key, JSON.stringify(snap.data()));
                return snap.data();
            }
        } catch (e) { console.warn('Firestore planner read failed:', e); }
    }
    try { return JSON.parse(localStorage.getItem('planner_' + key)) || {}; }
    catch { return {}; }
}

async function loadStatsData() {
    if (currentUser) {
        try {
            const snap = await docRefStats().get();
            if (snap.exists) {
                localStorage.setItem('focus_stats', JSON.stringify(snap.data()));
                return snap.data();
            }
        } catch (e) { console.warn('Firestore stats read failed:', e); }
    }
    try { return JSON.parse(localStorage.getItem('focus_stats')) || {}; }
    catch { return {}; }
}

async function loadSleepData(key) {
    if (currentUser) {
        try {
            const snap = await docRefSleep(key).get();
            if (snap.exists) {
                localStorage.setItem('sleep_' + key, JSON.stringify(snap.data()));
                return snap.data();
            }
        } catch (e) { console.warn('Firestore sleep read failed:', e); }
    }
    try { return JSON.parse(localStorage.getItem('sleep_' + key)) || null; }
    catch { return null; }
}

// ── Mobile: collapsible module cards ──
if (window.innerWidth <= 768) {
    document.querySelectorAll('.module-header').forEach(header => {
        header.addEventListener('click', () => {
            header.closest('.module').classList.toggle('collapsed');
        });
    });
    const modules = document.querySelectorAll('.module');
    modules.forEach((mod, i) => {
        if (i > 0) mod.classList.add('collapsed');
    });
}

// ── Hash scroll (from timetable links) ──
if (window.location.hash) {
    const target = document.querySelector(window.location.hash);
    if (target) {
        target.classList.remove('collapsed');
        setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }
}

// ── Live Countdowns ──
const CRITICAL_DATES = [
    // ── Semester Tests ──
    { date: '2026-03-16', event: 'WTW 218 Semester Test 1', type: 'test', day: 'Monday',    time: '07:30 – 09:00', venue: 'Louw Hall / Roos Hall' },
    { date: '2026-03-17', event: 'WTW 211 Semester Test 1', type: 'test', day: 'Tuesday',   time: '12:30 – 14:00', venue: 'AE Annex / AE du Toit Auditorium' },
    { date: '2026-03-18', event: 'COS 210 Semester Test 1', type: 'test', day: 'Wednesday', time: '07:30 – 09:00', venue: 'Informatorium Labs' },
    { date: '2026-03-19', event: 'PHY 255 Thermo ST + Modern CT1', type: 'test', day: 'Thursday',  time: '15:00 – 18:00', venue: 'HB 4-8' },
    { date: '2026-03-28', event: 'COS 212 Semester Test 1', type: 'test', day: 'Saturday',  time: '10:00 – 11:30', venue: 'Centenary 4 / 5 / 6' },
    { date: '2026-04-21', event: 'PHY 255 Modern Physics ST1', type: 'test', day: 'Tuesday',  time: '14:30 – 17:30', venue: 'NS1 5-42 (Tutorial slot)' },
    { date: '2026-05-02', event: 'WTW 218 Semester Test 2', type: 'test', day: 'Saturday',  time: '07:30 – 09:00', venue: 'AE Annex / AE du Toit Auditorium' },
    { date: '2026-05-07', event: 'COS 212 Semester Test 2', type: 'test', day: 'Thursday',  time: '10:00 – 11:30', venue: 'Centenary 4 / 5 / 6' },
    { date: '2026-05-08', event: 'WTW 211 Semester Test 2', type: 'test', day: 'Friday',    time: '12:30 – 14:00', venue: 'AE Annex / AE du Toit Auditorium' },
    { date: '2026-05-16', event: 'COS 210 Semester Test 2', type: 'test', day: 'Saturday',  time: '12:30 – 14:00', venue: 'Informatorium Labs' },
    { date: '2026-05-16', event: 'PHY 255 Semester Test 2', type: 'test', day: 'Saturday',  time: '15:00 – 18:00', venue: 'Consult Department' },
    // ── Exams ──
    { date: '2026-06-01', event: 'WTW 211 Exam',            type: 'exam', day: 'Monday',    time: '15:00',          venue: 'TBA' },
    { date: '2026-06-03', event: 'PHY 255 Exam (Paper 1)',   type: 'exam', day: 'Wednesday', time: '11:15',          venue: 'TBA' },
    { date: '2026-06-05', event: 'COS 210 Exam',             type: 'exam', day: 'Friday',    time: '07:30',          venue: 'TBA' },
    { date: '2026-06-08', event: 'COS 212 Exam',             type: 'exam', day: 'Monday',    time: '11:15',          venue: 'TBA' },
    { date: '2026-06-10', event: 'PHY 255 Exam (Paper 2)',   type: 'exam', day: 'Wednesday', time: '07:30',          venue: 'TBA' },
    { date: '2026-06-13', event: 'WTW 218 Exam',             type: 'exam', day: 'Saturday',  time: '07:30',          venue: 'TBA' },
];

function renderCountdowns() {
    const grid = document.getElementById('countdownGrid');
    if (!grid) return;
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const relevant = CRITICAL_DATES.filter(item => {
        const d = new Date(item.date + 'T00:00:00');
        const diff = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
        return diff >= -2;
    });

    grid.innerHTML = relevant.map(item => {
        const d = new Date(item.date + 'T00:00:00');
        const diff = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
        let urgency = 'normal';
        let dayText = diff;
        let unitText = 'days';

        if (diff < 0) {
            urgency = 'past';
            dayText = Math.abs(diff);
            unitText = diff === -1 ? 'day ago' : 'days ago';
        } else if (diff === 0) {
            urgency = 'urgent';
            dayText = 'TODAY';
            unitText = '';
        } else if (diff === 1) {
            urgency = 'urgent';
            dayText = '1';
            unitText = 'day';
        } else if (diff <= 7) {
            urgency = 'urgent';
            unitText = 'days';
        } else if (diff <= 21) {
            urgency = 'soon';
            unitText = 'days';
        }

        const dateStr = (item.day || '') + ', ' + d.getDate() + ' ' + MONTHS[d.getMonth()];

        let extra = '';
        if (item.time) extra += '<div class="countdown-time">' + item.time + '</div>';
        if (item.venue && item.venue !== 'TBA') extra += '<div class="countdown-venue">' + item.venue + '</div>';

        return '<div class="countdown-card ' + urgency + ' ' + item.type + '">' +
            '<div class="countdown-days">' + dayText + '</div>' +
            '<div class="countdown-unit">' + unitText + '</div>' +
            '<div class="countdown-event">' + item.event + '</div>' +
            '<div class="countdown-date">' + dateStr + '</div>' +
            extra +
            '</div>';
    }).join('');
}

renderCountdowns();
setInterval(renderCountdowns, 60000);

// ── Semester Progress Bar ──
function renderProgress() {
    const semStart = new Date('2026-02-09T00:00:00');
    const semEnd = new Date('2026-06-13T00:00:00');
    const now = new Date();
    const total = semEnd - semStart;
    const elapsed = now - semStart;
    let pct = Math.min(100, Math.max(0, (elapsed / total) * 100));
    pct = Math.round(pct * 10) / 10;
    const daysLeft = Math.max(0, Math.ceil((semEnd - now) / (1000 * 60 * 60 * 24)));
    const weeksLeft = Math.round(daysLeft / 7);
    document.getElementById('progressFill').style.width = pct + '%';
    document.getElementById('progressMarker').style.left = pct + '%';
    document.getElementById('progressPct').textContent = pct + '%';
    document.getElementById('progressDays').textContent = daysLeft;
    document.getElementById('progressDetail').textContent =
        weeksLeft + ' Weeks Left';
}
renderProgress();

// ── Weekly Review ──
async function renderWeeklyReview() {
    const grid = document.getElementById('reviewGrid');
    if (!grid) return;
    const now = new Date();
    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);

    let totalFocusSessions = 0, totalFocusMinutes = 0;
    let tasksCompleted = 0, tasksTotal = 0;
    let sleepHours = [];
    const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

    const stats = await loadStatsData();

    for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        const key = d.getFullYear() + '-' +
            String(d.getMonth() + 1).padStart(2, '0') + '-' +
            String(d.getDate()).padStart(2, '0');

        if (stats[key]) {
            totalFocusSessions += stats[key].sessions || 0;
            totalFocusMinutes += stats[key].minutes || 0;
        }

        const planner = await loadPlannerData(key);
        for (let s = 0; s < 19; s++) {
            if (planner['slot_' + s] && planner['slot_' + s].trim()) tasksTotal++;
            if (planner['check_' + s]) tasksCompleted++;
        }

        const sleep = await loadSleepData(key);
        sleepHours.push(sleep ? parseFloat(sleep.hours) || 0 : 0);
    }

    const avgSleep = sleepHours.filter(h => h > 0);
    const avgSleepVal = avgSleep.length
        ? (avgSleep.reduce((a, b) => a + b, 0) / avgSleep.length).toFixed(1)
        : '\u2014';

    const maxSleep = 10;
    let sleepChartHtml = '<div class="sleep-chart">';
    sleepHours.forEach((h, i) => {
        const height = h > 0 ? Math.max(4, (h / maxSleep) * 60) : 2;
        const cls = h === 0 ? '' : h < 7 ? 'low' : 'good';
        sleepChartHtml += '<div class="sleep-bar ' + cls + '" style="height:' + height + 'px" title="' + dayLabels[i] + ': ' + h + 'h"></div>';
    });
    sleepChartHtml += '</div><div class="sleep-day-labels">';
    dayLabels.forEach(l => { sleepChartHtml += '<span>' + l + '</span>'; });
    sleepChartHtml += '</div>';

    grid.innerHTML =
        '<div class="review-card">' +
            '<div class="review-value">' + totalFocusSessions + '</div>' +
            '<div class="review-label">Focus Sessions</div>' +
            '<div class="review-sub">' + totalFocusMinutes + ' minutes total</div>' +
        '</div>' +
        '<div class="review-card">' +
            '<div class="review-value">' + tasksCompleted + '</div>' +
            '<div class="review-label">Tasks Done</div>' +
            '<div class="review-sub">' + tasksTotal + ' planned this week</div>' +
        '</div>' +
        '<div class="review-card">' +
            '<div class="review-value">' + avgSleepVal + '</div>' +
            '<div class="review-label">Avg Sleep (hrs)</div>' +
            sleepChartHtml +
        '</div>';
}
renderWeeklyReview();
