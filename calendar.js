/* ============================================================
   Orb — Calendar Logic
   All semester events, week strip, month grid, agenda view
   ============================================================ */

// ── Module colour map ──
const MOD_COLORS = {
    'cos-284': 'var(--blue)',
    'cos-330': 'var(--dark-blue)',
    'university': '#888'
};

// CRITICAL_DATES loaded from shared-dates.js

// ── UNIVERSITY DATES (from UP Academic Calendar 2026) ──
const UNIVERSITY_DATES = [];

// ── RECESS / NON-LECTURE PERIODS ──
const RECESS_RANGES = [];

const TEST_WEEK_RANGES = [
    { start: '2026-08-22', end: '2026-08-28', label: 'Test Week 1' },
    { start: '2026-10-12', end: '2026-10-12', label: 'Test Week 2' },
];

const EXAM_RANGE = { start: '2026-11-11', end: '2026-11-21' };

// ── Merge all events & assign stable IDs ──
function makeEventId(e) {
    return (e.date + '|' + e.event + '|' + (e.module || e.type)).replace(/[^a-zA-Z0-9|]/g, '_');
}

(function assignIds() {
    const seen = {};
    [CRITICAL_DATES, UNIVERSITY_DATES].forEach(arr => {
        arr.forEach(e => {
            let id = makeEventId(e);
            if (seen[id]) { seen[id]++; id += '_' + seen[id]; }
            else { seen[id] = 1; }
            e._id = id;
        });
    });
})();

const BASE_EVENTS = [
    ...CRITICAL_DATES,
    ...UNIVERSITY_DATES,
];

// ── Edits overlay ──
// Structure: { eventId: { date?, event?, time?, venue?, type?, module?, deleted? } }
// Custom events: { "custom_xxx": { date, event, type, module, time?, venue?, custom: true } }
let calendarEdits = {};
const LS_KEY = 'orb_calendar_edits';

function loadEditsLocal() {
    try { return JSON.parse(localStorage.getItem(LS_KEY)) || {}; }
    catch { return {}; }
}

function saveEditsLocal() {
    localStorage.setItem(LS_KEY, JSON.stringify(calendarEdits));
}

async function saveEditsRemote() {
    saveEditsLocal();
    if (currentUser) {
        try {
            await db.collection('users').doc(currentUser.uid)
                .collection('calendar').doc('edits')
                .set(calendarEdits);
        } catch (e) { console.warn('Calendar edits write failed:', e); }
    }
}

async function loadEditsRemote() {
    if (!currentUser) return loadEditsLocal();
    try {
        const snap = await db.collection('users').doc(currentUser.uid)
            .collection('calendar').doc('edits').get();
        if (snap.exists) {
            calendarEdits = snap.data();
            saveEditsLocal();
            return calendarEdits;
        }
    } catch (e) { console.warn('Calendar edits read failed:', e); }
    return loadEditsLocal();
}

let editUnsub = null;

function listenToEdits() {
    if (editUnsub) editUnsub();
    if (!currentUser) return;
    editUnsub = db.collection('users').doc(currentUser.uid)
        .collection('calendar').doc('edits')
        .onSnapshot(snap => {
            if (snap.metadata.hasPendingWrites) return;
            if (snap.exists) {
                calendarEdits = snap.data();
                saveEditsLocal();
                renderAll();
            }
        });
}

// ── Build effective events list (base + edits overlay) ──
function getEffectiveEvents() {
    const events = [];
    BASE_EVENTS.forEach(e => {
        const edit = calendarEdits[e._id];
        if (edit && edit.deleted) return; // skip deleted
        if (edit) {
            events.push({
                ...e,
                date: edit.date || e.date,
                event: edit.event !== undefined ? edit.event : e.event,
                time: edit.time !== undefined ? edit.time : e.time,
                venue: edit.venue !== undefined ? edit.venue : e.venue,
                type: edit.type || e.type,
                module: edit.module !== undefined ? edit.module : e.module,
                _id: e._id,
                _edited: true
            });
        } else {
            events.push({ ...e });
        }
    });
    // Add custom events
    Object.keys(calendarEdits).forEach(id => {
        if (id.startsWith('custom_') && !calendarEdits[id].deleted) {
            events.push({ ...calendarEdits[id], _id: id, _custom: true });
        }
    });
    return events;
}

// ── State ──
let currentWeekStart = getMonday(new Date());
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let selectedDate = null;
let activeFilter = 'all';

// ── Helpers ──
function getMonday(d) {
    const dt = new Date(d);
    const day = dt.getDay();
    const diff = dt.getDate() - day + (day === 0 ? -6 : 1);
    dt.setDate(diff);
    dt.setHours(0, 0, 0, 0);
    return dt;
}

function fmtDate(d) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dd}`;
}

function sameDay(a, b) {
    return a.getFullYear() === b.getFullYear() &&
           a.getMonth() === b.getMonth() &&
           a.getDate() === b.getDate();
}

function isInRange(dateStr, start, end) {
    return dateStr >= start && dateStr <= end;
}

function getEventsForDate(dateStr) {
    let events = getEffectiveEvents().filter(e => e.date === dateStr);
    if (activeFilter !== 'all') {
        events = events.filter(e => e.module === activeFilter || e.type === activeFilter);
    }
    return events;
}

const MONTHS = MONTHS_LONG;
const DAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// ── Week Strip ──
function renderWeekStrip() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const container = document.getElementById('weekDays');
    const title = document.getElementById('weekTitle');

    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    if (sameDay(currentWeekStart, getMonday(today))) {
        title.textContent = 'This Week';
    } else {
        const opts = { month: 'short', day: 'numeric' };
        title.textContent = currentWeekStart.toLocaleDateString('en-ZA', opts) + ' — ' +
                            weekEnd.toLocaleDateString('en-ZA', opts);
    }

    container.innerHTML = '';
    for (let i = 0; i < 7; i++) {
        const d = new Date(currentWeekStart);
        d.setDate(d.getDate() + i);
        const ds = fmtDate(d);
        const events = getEventsForDate(ds);
        const isToday = sameDay(d, today);
        const isPast = d < today && !isToday;
        const isSelected = selectedDate && sameDay(d, selectedDate);

        let cls = 'week-day';
        if (isToday) cls += ' week-day--today';
        if (isPast) cls += ' week-day--past';
        if (isSelected) cls += ' week-day--selected';

        const dots = buildDots(events);

        const el = document.createElement('div');
        el.className = cls;
        el.innerHTML = `
            <div class="week-day__label">${DAYS_SHORT[i]}</div>
            <div class="week-day__num">${d.getDate()}</div>
            <div class="week-day__dots">${dots}</div>
        `;
        el.addEventListener('click', () => selectDay(d));
        container.appendChild(el);
    }
}

function buildDots(events) {
    const types = new Set();
    events.forEach(e => {
        if (e.type === 'test' || e.type === 'exam') types.add(e.type);
        else if (e.type === 'assignment') types.add('assignment');
        else if (e.type === 'university' || e.type === 'recess') types.add('university');
        else types.add('lecture');
    });
    return [...types].slice(0, 4).map(t =>
        `<span class="week-day__dot week-day__dot--${t}"></span>`
    ).join('');
}

function selectDay(d) {
    selectedDate = d;
    renderWeekStrip();
    renderDayDetail();
    renderMonthGrid();
}

// ── Day Detail ──
let editingEventId = null;

function escHtml(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
}

function renderDayDetail() {
    const panel = document.getElementById('dayDetail');
    const titleEl = document.getElementById('dayDetailTitle');
    const content = document.getElementById('dayDetailContent');

    if (!selectedDate) {
        panel.classList.remove('open');
        return;
    }

    const ds = fmtDate(selectedDate);
    const events = getEventsForDate(ds);
    const opts = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
    titleEl.textContent = selectedDate.toLocaleDateString('en-ZA', opts);

    let html = '';

    if (events.length === 0) {
        const inRecess = RECESS_RANGES.some(r => isInRange(ds, r.start, r.end));
        if (inRecess) {
            html = '<div class="day-event day-event--recess"><div class="day-event__info"><div class="day-event__title">Recess — No lectures</div></div></div>';
        } else {
            html = '<div style="color: var(--text-muted); font-size: 13px; padding: 8px 0;">No events scheduled</div>';
        }
    } else {
        html = events.map(e => {
            const cls = e.type === 'test' ? 'day-event--test' :
                        e.type === 'exam' ? 'day-event--exam' :
                        e.type === 'university' || e.type === 'recess' ? 'day-event--university' :
                        e.type === 'assignment' ? 'day-event--assignment' : '';
            const badge = e.module ? e.module.replace('-', ' ').toUpperCase() : e.type.toUpperCase();
            const meta = [e.time, e.venue].filter(Boolean).join(' \u2022 ');
            const editedTag = (e._edited || e._custom) ? '<span class="event-edited-tag">edited</span>' : '';

            if (editingEventId === e._id) {
                return renderEditForm(e, ds);
            }

            return `
                <div class="day-event ${cls}">
                    <div class="day-event__badge">${badge}</div>
                    <div class="day-event__info">
                        <div class="day-event__title">${escHtml(e.event)} ${editedTag}</div>
                        ${meta ? `<div class="day-event__meta">${escHtml(meta)}</div>` : ''}
                    </div>
                    <button class="event-edit-btn" data-id="${e._id}" title="Edit event">&#9998;</button>
                </div>`;
        }).join('');
    }

    // Add event button
    html += '<button class="add-event-btn" id="addEventBtn">+ Add event</button>';

    content.innerHTML = html;
    panel.classList.add('open');

    // Wire edit buttons
    content.querySelectorAll('.event-edit-btn').forEach(btn => {
        btn.addEventListener('click', (ev) => {
            ev.stopPropagation();
            editingEventId = btn.dataset.id;
            renderDayDetail();
        });
    });

    // Wire add event button
    const addBtn = document.getElementById('addEventBtn');
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            const id = 'custom_' + Date.now();
            calendarEdits[id] = {
                date: ds,
                event: 'New event',
                type: 'university',
                module: '',
                time: '',
                venue: '',
                custom: true
            };
            saveEditsRemote();
            editingEventId = id;
            renderAll();
        });
    }

    // Wire edit form buttons (if editing)
    wireEditForm(content, ds);
}

function renderEditForm(e, dateStr) {
    const types = ['lecture', 'test', 'exam', 'assignment', 'university'];
    const modules = [
        { val: '', label: 'None' },
        { val: 'cos-284', label: 'COS 284' },
        { val: 'cos-330', label: 'COS 330' },
    ];

    const typeOptions = types.map(t =>
        '<option value="' + t + '"' + (e.type === t ? ' selected' : '') + '>' + t.charAt(0).toUpperCase() + t.slice(1) + '</option>'
    ).join('');

    const modOptions = modules.map(m =>
        '<option value="' + m.val + '"' + ((e.module || '') === m.val ? ' selected' : '') + '>' + m.label + '</option>'
    ).join('');

    const isCustom = e._custom;
    const resetBtn = !isCustom ?
        '<button class="edit-form__reset" data-action="reset" data-id="' + e._id + '">Reset</button>' : '';

    return '<div class="edit-form" data-edit-id="' + e._id + '">' +
        '<div class="edit-form__row">' +
            '<label>Name</label>' +
            '<input type="text" class="edit-form__input" name="event" value="' + escHtml(e.event) + '" />' +
        '</div>' +
        '<div class="edit-form__row">' +
            '<label>Date</label>' +
            '<input type="date" class="edit-form__input" name="date" value="' + e.date + '" />' +
        '</div>' +
        '<div class="edit-form__row edit-form__row--half">' +
            '<div><label>Time</label>' +
            '<input type="text" class="edit-form__input" name="time" value="' + escHtml(e.time || '') + '" placeholder="e.g. 07:30 – 09:00" /></div>' +
            '<div><label>Venue</label>' +
            '<input type="text" class="edit-form__input" name="venue" value="' + escHtml(e.venue || '') + '" placeholder="e.g. HB 4-8" /></div>' +
        '</div>' +
        '<div class="edit-form__row edit-form__row--half">' +
            '<div><label>Type</label>' +
            '<select class="edit-form__input" name="type">' + typeOptions + '</select></div>' +
            '<div><label>Module</label>' +
            '<select class="edit-form__input" name="module">' + modOptions + '</select></div>' +
        '</div>' +
        '<div class="edit-form__actions">' +
            '<button class="edit-form__save" data-action="save" data-id="' + e._id + '">Save</button>' +
            '<button class="edit-form__cancel" data-action="cancel">Cancel</button>' +
            '<button class="edit-form__delete" data-action="delete" data-id="' + e._id + '">Delete</button>' +
            resetBtn +
        '</div>' +
    '</div>';
}

function wireEditForm(container, dateStr) {
    const form = container.querySelector('.edit-form');
    if (!form) return;

    form.querySelectorAll('button[data-action]').forEach(btn => {
        btn.addEventListener('click', (ev) => {
            ev.stopPropagation();
            const action = btn.dataset.action;
            const id = btn.dataset.id;

            if (action === 'cancel') {
                editingEventId = null;
                renderDayDetail();
                return;
            }

            if (action === 'delete') {
                if (id.startsWith('custom_')) {
                    delete calendarEdits[id];
                } else {
                    calendarEdits[id] = { deleted: true };
                }
                editingEventId = null;
                saveEditsRemote();
                renderAll();
                return;
            }

            if (action === 'reset') {
                delete calendarEdits[id];
                editingEventId = null;
                saveEditsRemote();
                renderAll();
                return;
            }

            if (action === 'save') {
                const eventName = form.querySelector('[name="event"]').value.trim();
                const date = form.querySelector('[name="date"]').value;
                const time = form.querySelector('[name="time"]').value.trim();
                const venue = form.querySelector('[name="venue"]').value.trim();
                const type = form.querySelector('[name="type"]').value;
                const mod = form.querySelector('[name="module"]').value;

                if (!eventName) return;

                if (id.startsWith('custom_')) {
                    calendarEdits[id] = { date: date, event: eventName, type: type, module: mod, time: time, venue: venue, custom: true };
                } else {
                    const base = BASE_EVENTS.find(e => e._id === id);
                    const edit = {};
                    if (date !== base.date) edit.date = date;
                    if (eventName !== base.event) edit.event = eventName;
                    if (time !== (base.time || '')) edit.time = time;
                    if (venue !== (base.venue || '')) edit.venue = venue;
                    if (type !== base.type) edit.type = type;
                    if (mod !== (base.module || '')) edit.module = mod;
                    if (Object.keys(edit).length > 0) {
                        calendarEdits[id] = edit;
                    } else {
                        delete calendarEdits[id];
                    }
                }

                editingEventId = null;
                if (date !== dateStr) {
                    selectedDate = new Date(date + 'T00:00:00');
                    currentWeekStart = getMonday(selectedDate);
                    currentMonth = selectedDate.getMonth();
                    currentYear = selectedDate.getFullYear();
                }
                saveEditsRemote();
                renderAll();
                return;
            }
        });
    });
}

// ── Month Grid ──
function renderMonthGrid() {
    const grid = document.getElementById('calGrid');
    const title = document.getElementById('monthTitle');

    title.textContent = `${MONTHS[currentMonth]} ${currentYear}`;

    // Clear old cells (keep headers)
    grid.querySelectorAll('.cal-cell').forEach(el => el.remove());

    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);

    // Monday-based: 0=Mon, 6=Sun
    let startOffset = firstDay.getDay() - 1;
    if (startOffset < 0) startOffset = 6;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Previous month padding
    for (let i = startOffset - 1; i >= 0; i--) {
        const d = new Date(firstDay);
        d.setDate(d.getDate() - i - 1);
        grid.appendChild(createCell(d, true, today));
    }

    // Current month
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const d = new Date(currentYear, currentMonth, day);
        grid.appendChild(createCell(d, false, today));
    }

    // Next month padding
    const totalCells = startOffset + lastDay.getDate();
    const remaining = (7 - (totalCells % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
        const d = new Date(lastDay);
        d.setDate(d.getDate() + i);
        grid.appendChild(createCell(d, true, today));
    }
}

function createCell(d, isOutside, today) {
    const ds = fmtDate(d);
    const events = getEventsForDate(ds);
    const isToday = sameDay(d, today);
    const isSelected = selectedDate && sameDay(d, selectedDate);
    const dayOfWeek = d.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const inRecess = RECESS_RANGES.some(r => isInRange(ds, r.start, r.end));
    const inTestWeek = TEST_WEEK_RANGES.some(r => isInRange(ds, r.start, r.end));
    const inExam = isInRange(ds, EXAM_RANGE.start, EXAM_RANGE.end);

    let cls = 'cal-cell';
    if (isOutside) cls += ' cal-cell--outside';
    if (isToday) cls += ' cal-cell--today';
    if (isSelected) cls += ' cal-cell--selected';
    if (isWeekend) cls += ' cal-cell--weekend';
    if (inRecess) cls += ' cal-cell--recess';
    if (inTestWeek) cls += ' cal-cell--test-week';

    const cell = document.createElement('div');
    cell.className = cls;

    const MAX_PIPS = 3;
    const pips = events.slice(0, MAX_PIPS).map(e => {
        const pipCls = e.type === 'test' ? 'cal-event-pip--test' :
                       e.type === 'exam' ? 'cal-event-pip--exam' :
                       e.type === 'assignment' ? 'cal-event-pip--assignment' :
                       e.type === 'university' || e.type === 'recess' ? 'cal-event-pip--university' :
                       'cal-event-pip--lecture';
        const short = e.event.length > 20 ? e.event.slice(0, 18) + '…' : e.event;
        return `<div class="cal-event-pip ${pipCls}">${short}</div>`;
    }).join('');

    const moreCount = events.length - MAX_PIPS;
    const moreHtml = moreCount > 0 ? `<div class="cal-cell__more">+${moreCount} more</div>` : '';

    // Show recess label if in recess and no events
    let recessLabel = '';
    if (inRecess && events.length === 0 && !isOutside) {
        recessLabel = '<div class="cal-event-pip cal-event-pip--recess">Recess</div>';
    }
    if (inExam && events.length === 0 && !isOutside && !inRecess) {
        recessLabel = '<div class="cal-event-pip cal-event-pip--exam">Exam Period</div>';
    }

    cell.innerHTML = `
        <div class="cal-cell__num">${d.getDate()}</div>
        <div class="cal-cell__events">${pips}${recessLabel}${moreHtml}</div>
    `;

    cell.addEventListener('click', () => selectDay(d));
    return cell;
}

// ── Agenda ──
function renderAgenda() {
    const list = document.getElementById('agendaList');
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Show important events: tests, exams, assignments, university dates (no lectures)
    let agendaEvents = getEffectiveEvents().filter(e =>
        e.type === 'test' || e.type === 'exam' || e.type === 'assignment' || e.type === 'university' || e.type === 'recess'
    );

    if (activeFilter !== 'all') {
        agendaEvents = agendaEvents.filter(e => e.module === activeFilter || e.type === activeFilter);
    }

    agendaEvents.sort((a, b) => a.date.localeCompare(b.date));

    // Group by past vs upcoming, show all upcoming + last 5 past
    const past = agendaEvents.filter(e => new Date(e.date + 'T00:00:00') < today);
    const upcoming = agendaEvents.filter(e => new Date(e.date + 'T00:00:00') >= today);

    const displayEvents = [...past.slice(-3), ...upcoming.slice(0, 30)];

    list.innerHTML = displayEvents.map(e => {
        const d = new Date(e.date + 'T00:00:00');
        const isPast = d < today;
        const isToday = sameDay(d, today);
        const dateStr = d.toLocaleDateString('en-ZA', { day: '2-digit', month: 'short' });

        let dateCls = 'agenda-date';
        if (isToday) dateCls += ' agenda-date--today';
        else if (e.type === 'test') dateCls += ' agenda-date--test';
        else if (e.type === 'exam') dateCls += ' agenda-date--exam';

        const tag = `<span class="agenda-tag agenda-tag--${e.type}">${e.type}</span>`;
        const meta = [e.time, e.venue].filter(Boolean).join(' • ');

        return `
            <div class="agenda-item${isPast ? ' agenda-item--past' : ''}">
                <div class="${dateCls}">${dateStr}</div>
                <div class="agenda-body">
                    <div class="agenda-title">${tag}${e.event}</div>
                    ${meta ? `<div class="agenda-meta">${meta}</div>` : ''}
                </div>
            </div>`;
    }).join('');
}

// ── Filters ──
function initFilters() {
    document.querySelectorAll('.chip').forEach(chip => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('.chip').forEach(c => c.classList.remove('chip--active'));
            chip.classList.add('chip--active');
            activeFilter = chip.dataset.filter;
            renderAll();
        });
    });
}

// ── Navigation ──
function initNavigation() {
    document.getElementById('weekPrev').addEventListener('click', () => {
        currentWeekStart.setDate(currentWeekStart.getDate() - 7);
        renderWeekStrip();
    });
    document.getElementById('weekNext').addEventListener('click', () => {
        currentWeekStart.setDate(currentWeekStart.getDate() + 7);
        renderWeekStrip();
    });
    document.getElementById('monthPrev').addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) { currentMonth = 11; currentYear--; }
        renderMonthGrid();
    });
    document.getElementById('monthNext').addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) { currentMonth = 0; currentYear++; }
        renderMonthGrid();
    });
    document.getElementById('monthToday').addEventListener('click', () => {
        const today = new Date();
        currentMonth = today.getMonth();
        currentYear = today.getFullYear();
        currentWeekStart = getMonday(today);
        selectedDate = today;
        renderAll();
    });
}

// ── Render All ──
function renderAll() {
    renderWeekStrip();
    renderDayDetail();
    renderMonthGrid();
    renderAgenda();
}

// ── Auth ──
auth.onAuthStateChanged(user => {
    currentUser = user;
    const authContent = document.getElementById('authContent');
    const syncStatus  = document.getElementById('syncStatus');

    if (user) {
        if (authContent) {
            authContent.innerHTML =
                '<span class="user-name">' + escHtml(user.displayName || user.email) + '</span>' +
                '<button class="signout-btn" onclick="signOutUser()">Sign Out</button>';
        }
        if (syncStatus) { syncStatus.textContent = 'Synced'; syncStatus.className = 'sync-status online'; }
        loadEditsRemote().then(() => renderAll());
        listenToEdits();
    } else {
        if (editUnsub) { editUnsub(); editUnsub = null; }
        calendarEdits = {};
        saveEditsLocal();
        if (authContent) {
            authContent.innerHTML = '<button class="auth-btn" onclick="signInWithGoogle()">Sign in with Google</button>';
        }
        if (syncStatus) { syncStatus.textContent = 'Local only'; syncStatus.className = 'sync-status offline'; }
        renderAll();
    }
});

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
    selectedDate = new Date();
    selectedDate.setHours(0, 0, 0, 0);

    loadEditsLocal();
    initFilters();
    initNavigation();
    renderAll();
});
