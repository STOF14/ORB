/* ============================================================
   Orb — Timetable Logic
   Edit persistence, auth, highlight today, What's Next,
   toggle empty, Bauhaus animation
   Requires: firebase-config.js loaded first
   Requires: window.EDIT_STORAGE_KEY set before this script
   ============================================================ */

const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
const MODULE_CLASSES = ['phy-255', 'cos-210', 'cos-212', 'wtw-211', 'wtw-218', 'cos-284', 'cos-330', 'wtw-224'];
let editMode = false;

/* ── Edit Persistence (Firestore + localStorage) ── */

function docRefEdits() {
    return db.collection('users').doc(currentUser.uid)
             .collection('meta').doc(EDIT_STORAGE_KEY);
}

async function loadEdits() {
    if (currentUser) {
        try {
            const snap = await docRefEdits().get();
            if (snap.exists) {
                localStorage.setItem(EDIT_STORAGE_KEY, JSON.stringify(snap.data().edits || {}));
                return snap.data().edits || {};
            }
        } catch (e) { console.warn('Firestore read failed:', e); }
    }
    try { return JSON.parse(localStorage.getItem(EDIT_STORAGE_KEY)) || {}; }
    catch { return {}; }
}

async function saveEdits(edits) {
    localStorage.setItem(EDIT_STORAGE_KEY, JSON.stringify(edits));
    if (currentUser) {
        try {
            await docRefEdits().set({ edits }, { merge: true });
        } catch (e) { console.error('Firestore write error:', e); }
    }
}

/* ── Rendering helpers ── */

function renderEventDisplay(eventEl, timeText, activityText, isOverride) {
    const timeEl     = eventEl.querySelector('.time');
    const activityEl = eventEl.querySelector('.activity');
    timeEl.textContent = timeText;

    const defaultActivity = eventEl.dataset.defaultActivity || '';
    const defaultHref     = eventEl.dataset.defaultHref || '';

    activityEl.innerHTML = '';
    if (!isOverride && defaultHref && activityText === defaultActivity) {
        const link = document.createElement('a');
        link.href = defaultHref;
        link.textContent = activityText;
        activityEl.appendChild(link);
    } else {
        activityEl.textContent = activityText;
    }
}

function detectModuleClass(text) {
    const val = text.toLowerCase();
    if (/\bphy\s*-?\s*255\b/.test(val)) return 'phy-255';
    if (/\bcos\s*-?\s*210\b/.test(val)) return 'cos-210';
    if (/\bcos\s*-?\s*212\b/.test(val)) return 'cos-212';
    if (/\bcos\s*-?\s*284\b/.test(val)) return 'cos-284';
    if (/\bcos\s*-?\s*330\b/.test(val)) return 'cos-330';
    if (/\bwtw\s*-?\s*211\b/.test(val)) return 'wtw-211';
    if (/\bwtw\s*-?\s*218\b/.test(val)) return 'wtw-218';
    if (/\bwtw\s*-?\s*224\b/.test(val)) return 'wtw-224';
    return null;
}

function updateModuleClass(eventEl, activityText, isOverride) {
    MODULE_CLASSES.forEach(cls => eventEl.classList.remove(cls));
    const defaultModule = eventEl.dataset.defaultModule || '';
    const moduleClass   = isOverride ? detectModuleClass(activityText) : defaultModule;
    if (moduleClass) eventEl.classList.add(moduleClass);
    if (activityText.trim()) eventEl.classList.remove('empty');
    else eventEl.classList.add('empty');
}

async function persistEdit(eventEl, timeValue, activityValue) {
    const edits           = await loadEdits();
    const id              = eventEl.dataset.eventId;
    const defaultTime     = eventEl.dataset.defaultTime || '';
    const defaultActivity = eventEl.dataset.defaultActivity || '';

    if (timeValue === defaultTime && activityValue === defaultActivity) {
        delete edits[id];
    } else {
        edits[id] = { time: timeValue, activity: activityValue };
    }
    saveEdits(edits);
}

/* ── Apply / Enter / Exit Edit Mode ── */

async function applyEdits() {
    const edits = await loadEdits();
    document.querySelectorAll('.event').forEach((eventEl, index) => {
        if (!eventEl.dataset.eventId) eventEl.dataset.eventId = String(index);

        const timeEl       = eventEl.querySelector('.time');
        const activityEl   = eventEl.querySelector('.activity');
        const timeInput    = eventEl.querySelector('.edit-time');
        const activityInput = eventEl.querySelector('.edit-activity');
        const hasInputs    = Boolean(timeInput || activityInput);

        if (!eventEl.dataset.defaultTime && !hasInputs)
            eventEl.dataset.defaultTime = timeEl.textContent.trim();

        if (!eventEl.dataset.defaultActivity && !hasInputs) {
            const link = activityEl ? activityEl.querySelector('a') : null;
            eventEl.dataset.defaultActivity = link ? link.textContent.trim() : activityEl.textContent.trim();
            eventEl.dataset.defaultHref     = link ? link.getAttribute('href') : '';
        }

        if (!eventEl.dataset.defaultModule && !hasInputs) {
            const cls = MODULE_CLASSES.find(c => eventEl.classList.contains(c));
            if (cls) eventEl.dataset.defaultModule = cls;
        }

        const defaultTime     = eventEl.dataset.defaultTime     || (timeInput    ? timeInput.value.trim()    : timeEl.textContent.trim());
        const defaultActivity = eventEl.dataset.defaultActivity || (activityInput ? activityInput.value.trim() : activityEl.textContent.trim());
        const defaultHref     = eventEl.dataset.defaultHref || '';

        const override    = edits[eventEl.dataset.eventId];
        const timeText    = override && override.time ? override.time : defaultTime;
        const activityText = override && override.activity !== undefined ? override.activity : defaultActivity;
        eventEl.dataset.defaultHref = defaultHref;
        renderEventDisplay(eventEl, timeText, activityText, Boolean(override));
        updateModuleClass(eventEl, activityText, Boolean(override));
    });
}

function enterEditMode() {
    editMode = true;
    document.body.classList.add('edit-mode');
    const toggle = document.getElementById('editToggle');
    toggle.textContent = 'Done';
    toggle.setAttribute('aria-pressed', 'true');

    document.querySelectorAll('.event').forEach(eventEl => {
        const timeEl     = eventEl.querySelector('.time');
        const activityEl = eventEl.querySelector('.activity');
        const timeValue  = timeEl.textContent.trim();
        const activityValue = activityEl.textContent.trim();

        timeEl.innerHTML     = '<input class="edit-time" type="text" value="' + timeValue.replace(/"/g, '&quot;') + '">';
        activityEl.innerHTML = '<input class="edit-activity" type="text" placeholder="Add activity" value="' + activityValue.replace(/"/g, '&quot;') + '">';

        const timeInput     = timeEl.querySelector('.edit-time');
        const activityInput = activityEl.querySelector('.edit-activity');

        const autosave = () => {
            persistEdit(eventEl, timeInput.value.trim(), activityInput.value.trim());
            updateModuleClass(eventEl, activityInput.value.trim(), true);
        };

        timeInput.addEventListener('input', autosave);
        activityInput.addEventListener('input', autosave);
    });
}

function exitEditMode() {
    const edits = {};
    document.querySelectorAll('.event').forEach(eventEl => {
        const id            = eventEl.dataset.eventId;
        const timeInput     = eventEl.querySelector('.edit-time');
        const activityInput = eventEl.querySelector('.edit-activity');
        if (!timeInput || !activityInput) return;

        const timeValue     = timeInput.value.trim();
        const activityValue = activityInput.value.trim();
        const defaultTime     = eventEl.dataset.defaultTime || '';
        const defaultActivity = eventEl.dataset.defaultActivity || '';

        if (timeValue !== defaultTime || activityValue !== defaultActivity) {
            edits[id] = { time: timeValue, activity: activityValue };
        }
    });

    saveEdits(edits);
    applyEdits();

    editMode = false;
    document.body.classList.remove('edit-mode');
    const toggle = document.getElementById('editToggle');
    toggle.textContent = 'Edit';
    toggle.setAttribute('aria-pressed', 'false');
    updateWhatsNext();
}

function setupEditToggle() {
    const toggle = document.getElementById('editToggle');
    if (!toggle) return;
    toggle.addEventListener('click', () => {
        if (editMode) exitEditMode();
        else enterEditMode();
    });
}

/* ── Auth handler ── */

auth.onAuthStateChanged(user => {
    currentUser = user;
    applyEdits();
});

/* ── Highlight Today ── */

function highlightToday() {
    const today    = DAYS[new Date().getDay()];
    const dayDivs  = document.querySelectorAll('.day');
    let todayFound = false;

    dayDivs.forEach(day => {
        const dayClass = Array.from(day.classList).find(c => DAYS.includes(c));
        if (dayClass === today) {
            day.classList.add('today');
            todayFound = true;
            if (window.innerWidth <= 768) {
                setTimeout(() => day.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
            }
        } else {
            day.classList.add('not-today');
        }
    });

    if (!todayFound) dayDivs.forEach(d => d.classList.remove('not-today'));
}

/* ── What's Next ── */

function updateWhatsNext() {
    const banner  = document.getElementById('whatsNext');
    const classEl = document.getElementById('nextClass');
    const timeEl  = document.getElementById('nextTime');
    if (!banner) return;

    const now            = new Date();
    const today          = DAYS[now.getDay()];
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const todayBlock = document.querySelector('.day.' + today);
    if (!todayBlock) {
        classEl.textContent = 'No classes today';
        timeEl.textContent  = 'Enjoy your weekend';
        banner.classList.add('done');
        return;
    }

    const events = todayBlock.querySelectorAll('.event:not(.empty)');
    let nextEvent    = null;
    let currentEvent = null;

    events.forEach(ev => {
        const txt = ev.querySelector('.time').textContent;
        const [startStr, endStr] = txt.split('-');
        const [sH, sM] = startStr.split(':').map(Number);
        const [eH, eM] = endStr.split(':').map(Number);
        const startMin = sH * 60 + sM;
        const endMin   = eH * 60 + eM;

        if (currentMinutes >= startMin && currentMinutes < endMin)
            currentEvent = { el: ev, start: startStr, end: endStr };
        else if (currentMinutes < startMin && !nextEvent)
            nextEvent = { el: ev, start: startStr, end: endStr };
    });

    function applyBorderColor(ev, ban) {
        const map = { 'phy-255': '#e63946', 'cos-210': '#457b9d', 'cos-212': '#1d3557', 'wtw-211': '#f4a261', 'wtw-218': '#e9c46a', 'cos-284': '#457b9d', 'cos-330': '#1d3557', 'wtw-224': '#e9c46a' };
        const cls = Array.from(ev.el.classList).find(c => c in map);
        if (cls) ban.style.borderLeftColor = map[cls];
    }

    if (currentEvent) {
        banner.querySelector('.whats-next-label').textContent = 'Right Now';
        classEl.textContent = currentEvent.el.querySelector('.activity').textContent.trim();
        timeEl.textContent  = currentEvent.start + ' — ' + currentEvent.end;
        applyBorderColor(currentEvent, banner);
    } else if (nextEvent) {
        banner.querySelector('.whats-next-label').textContent = 'Next Up';
        classEl.textContent = nextEvent.el.querySelector('.activity').textContent.trim();
        timeEl.textContent  = nextEvent.start + ' — ' + nextEvent.end;
        applyBorderColor(nextEvent, banner);
    } else {
        classEl.textContent = 'Done for today';
        timeEl.textContent  = 'No more classes';
        banner.classList.add('done');
    }
}

/* ── Toggle Empty Slots ── */

let emptyHidden = true;

function toggleEmptySlots() {
    const empties = document.querySelectorAll('.event.empty');
    const btn     = document.getElementById('toggleEmpty');
    emptyHidden   = !emptyHidden;
    empties.forEach(e => e.classList.toggle('hidden-empty', emptyHidden));
    btn.textContent = emptyHidden ? 'Show Free Periods' : 'Hide Free Periods';
    btn.classList.toggle('active', emptyHidden);
}

/* ── Bauhaus Impossible-Cursor Animation (index.html only) ── */

function initBauhausAnimation() {
    const group = document.getElementById('impossible-cursor-group');
    if (!group) return;
    const svg = document.getElementById('bauhaus-svg');
    if (!svg) return;

    const isMobile = window.innerWidth <= 600;
    const shapes = [
        { type: 'circle',  r: isMobile ? 8 : 16,  color: '#fff',    orbit: 60,  speed: 0.012, phase: 0 },
        { type: 'polygon', r: isMobile ? 10 : 20, sides: 3, color: '#e63946', orbit: 90,  speed: 0.009, phase: 1 },
        { type: 'polygon', r: isMobile ? 7 : 14,  sides: 4, color: '#457b9d', orbit: 110, speed: 0.007, phase: 2 },
        { type: 'line',    len: isMobile ? 18 : 36, color: '#f4a261', orbit: 80,  speed: 0.011, phase: 3 }
    ];
    let t = 0;

    function animate() {
        t += 1;
        group.innerHTML = '';
        const cx = isMobile ? 180 : 300;
        const cy = 110;

        shapes.forEach(shape => {
            const angle = shape.phase + t * shape.speed;
            const x = cx + Math.cos(angle) * shape.orbit;
            const y = cy + Math.sin(angle) * shape.orbit;
            let el;

            if (shape.type === 'circle') {
                el = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                el.setAttribute('cx', x); el.setAttribute('cy', y);
                el.setAttribute('r', shape.r); el.setAttribute('fill', shape.color);
                el.setAttribute('filter', 'url(#glow)');
            } else if (shape.type === 'polygon') {
                el = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
                let points = [];
                for (let k = 0; k < shape.sides; k++) {
                    const theta = angle + (2 * Math.PI * k / shape.sides);
                    points.push((x + Math.cos(theta) * shape.r) + ',' + (y + Math.sin(theta) * shape.r));
                }
                el.setAttribute('points', points.join(' '));
                el.setAttribute('fill', shape.color);
                el.setAttribute('filter', 'url(#glow)');
            } else if (shape.type === 'line') {
                el = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                el.setAttribute('x1', x); el.setAttribute('y1', y);
                el.setAttribute('x2', x + Math.cos(angle + Math.PI / 2) * shape.len);
                el.setAttribute('y2', y + Math.sin(angle + Math.PI / 2) * shape.len);
                el.setAttribute('stroke', shape.color);
                el.setAttribute('stroke-width', isMobile ? 3 : 6);
                el.setAttribute('stroke-linecap', 'round');
                el.setAttribute('filter', 'url(#glow)');
            }
            group.appendChild(el);
        });

        requestAnimationFrame(animate);
    }
    animate();
}

/* ── Init ── */

applyEdits();
setupEditToggle();
highlightToday();
updateWhatsNext();
initBauhausAnimation();

// Auto-hide empties on mobile
if (window.innerWidth <= 768) {
    document.querySelectorAll('.event.empty').forEach(e => e.classList.add('hidden-empty'));
}

// Update "What's Next" every minute
let whatsNextInterval = null;
function startWhatsNextInterval() {
    if (whatsNextInterval) clearInterval(whatsNextInterval);
    whatsNextInterval = setInterval(updateWhatsNext, 60000);
}

document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        updateWhatsNext();
        startWhatsNextInterval();
    } else {
        if (whatsNextInterval) clearInterval(whatsNextInterval);
    }
});

startWhatsNextInterval();
