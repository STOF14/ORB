/* ── OrbitDesk — Focus Timer Logic ── */
/* No Firebase required — localStorage only */

const DURATIONS = {
    focus: 25 * 60,
    short: 5 * 60,
    long: 15 * 60,
};

const MODE_LABELS = {
    focus: 'Focus Session',
    short: 'Short Break',
    long: 'Long Break',
};

let mode = 'focus';
let timeLeft = DURATIONS.focus;
let totalTime = DURATIONS.focus;
let running = false;
let interval = null;
let sessionsCompleted = 0;
let totalFocusMinutes = 0;
let currentMod = null;

const circumference = 2 * Math.PI * 140;
const progressEl = document.getElementById('progress');
progressEl.style.strokeDasharray = circumference;
progressEl.style.strokeDashoffset = 0;

function updateDisplay() {
    const mins = Math.floor(timeLeft / 60);
    const secs = timeLeft % 60;
    document.getElementById('timeDisplay').textContent =
        String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');

    // Progress ring
    const fraction = 1 - (timeLeft / totalTime);
    progressEl.style.strokeDashoffset = circumference * (1 - fraction);

    // Progress color
    progressEl.classList.remove('break-mode', 'long-break-mode');
    if (mode === 'short') progressEl.classList.add('break-mode');
    if (mode === 'long') progressEl.classList.add('long-break-mode');

    document.getElementById('sessionLabel').textContent = MODE_LABELS[mode];

    // Stats
    document.getElementById('focusCount').textContent = sessionsCompleted;
    document.getElementById('totalMinutes').textContent = totalFocusMinutes;
    document.getElementById('currentModule').textContent =
        currentMod ? currentMod.replace('-', ' ').toUpperCase() : '\u2014';

    // Update title
    document.title = (running ? '\u25B6 ' : '') +
        String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0') +
        ' \u2014 Focus Timer';
}

function toggleTimer() {
    if (running) pauseTimer();
    else startTimer();
}

function startTimer() {
    running = true;
    document.getElementById('playBtn').textContent = '\u275A\u275A';
    document.getElementById('playBtn').classList.add('running');

    interval = setInterval(() => {
        timeLeft--;
        if (timeLeft <= 0) {
            clearInterval(interval);
            interval = null;
            running = false;
            document.getElementById('playBtn').textContent = '\u25B6';
            document.getElementById('playBtn').classList.remove('running');
            onSessionComplete();
        }
        updateDisplay();
    }, 1000);
}

function pauseTimer() {
    running = false;
    clearInterval(interval);
    interval = null;
    document.getElementById('playBtn').textContent = '\u25B6';
    document.getElementById('playBtn').classList.remove('running');
    updateDisplay();
}

function resetTimer() {
    pauseTimer();
    timeLeft = totalTime;
    updateDisplay();
}

function setMode(newMode) {
    pauseTimer();
    mode = newMode;
    totalTime = DURATIONS[mode];
    timeLeft = totalTime;

    document.querySelectorAll('.mode-tab').forEach(t => {
        t.classList.toggle('active', t.dataset.mode === mode);
    });

    updateDisplay();
}

function skipSession() {
    pauseTimer();
    onSessionComplete();
}

function onSessionComplete() {
    // Notification sound (Web Audio)
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 800;
        gain.gain.value = 0.3;
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
        osc.stop(ctx.currentTime + 0.8);
    } catch (e) {}

    // Browser notification
    if (Notification.permission === 'granted') {
        new Notification(MODE_LABELS[mode] + ' complete!', {
            body: mode === 'focus' ? 'Time for a break.' : 'Ready to focus?',
            icon: '\u25C9'
        });
    }

    if (mode === 'focus') {
        sessionsCompleted++;
        totalFocusMinutes += Math.round(DURATIONS.focus / 60);
        saveStats();

        // Update dots
        const dots = document.querySelectorAll('.session-dot');
        const dotIndex = (sessionsCompleted - 1) % 4;
        if (dotIndex < dots.length) {
            dots[dotIndex].classList.add('completed');
        }

        // After 4 focus sessions → long break, otherwise short break
        if (sessionsCompleted % 4 === 0) {
            dots.forEach(d => { d.classList.remove('completed'); d.classList.remove('break-completed'); });
            setMode('long');
        } else {
            setMode('short');
        }
    } else {
        setMode('focus');
    }
}

function selectModule(btn) {
    const wasActive = btn.classList.contains('active');
    document.querySelectorAll('.mod-btn').forEach(b => b.classList.remove('active'));

    if (!wasActive) {
        btn.classList.add('active');
        currentMod = btn.dataset.mod;
    } else {
        currentMod = null;
    }

    updateDisplay();
}

// ── Persist stats per day ──
function saveStats() {
    const today = new Date().toISOString().slice(0, 10);
    const data = JSON.parse(localStorage.getItem('focus_stats') || '{}');
    if (!data[today]) data[today] = { sessions: 0, minutes: 0, modules: {} };
    data[today].sessions = sessionsCompleted;
    data[today].minutes = totalFocusMinutes;
    if (currentMod) {
        data[today].modules[currentMod] = (data[today].modules[currentMod] || 0) + Math.round(DURATIONS.focus / 60);
    }
    localStorage.setItem('focus_stats', JSON.stringify(data));
}

function loadStats() {
    const today = new Date().toISOString().slice(0, 10);
    const data = JSON.parse(localStorage.getItem('focus_stats') || '{}');
    if (data[today]) {
        sessionsCompleted = data[today].sessions || 0;
        totalFocusMinutes = data[today].minutes || 0;
    }

    const dots = document.querySelectorAll('.session-dot');
    const filled = sessionsCompleted % 4;
    for (let i = 0; i < filled; i++) {
        if (dots[i]) dots[i].classList.add('completed');
    }
}

// Request notification permission
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}

// Init
loadStats();
updateDisplay();
