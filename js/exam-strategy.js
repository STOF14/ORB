(function () {
    var DAY_PLANS = [
        {
            date: '2026-08-07',
            label: 'Friday 7 Aug',
            note: 'COS 284 Class Test 1 (online, ClickUP).',
            sessions: [
                { time: '09:00', module: 'COS 284', key: 'cos-284', method: 'flash recall', type: 'study', task: 'Quick pass over L1-L6 slides before the window opens.' },
                { time: '09:30', module: 'COS 284', key: 'cos-284', method: 'test day', type: 'test', task: 'COS 284 Class Test 1 — 45 min, window 09:30-12:30, online.' }
            ]
        },
        {
            date: '2026-08-18',
            label: 'Tuesday 18 Aug',
            note: 'Final prep stretch before COS 284 Test 1.',
            sessions: [
                { time: '17:30', module: 'COS 284', key: 'cos-284', method: 'active recall', type: 'study', task: 'Summarize all L1-L2 concepts from memory and fill gaps.' },
                { time: '19:00', module: 'COS 284', key: 'cos-284', method: 'problem drill', type: 'study', task: 'Complete one timed question set without notes.' },
                { time: '21:00', module: 'Meta', key: 'meta', method: 'shutdown', type: 'meta', task: 'Pack stationery and sleep early.' }
            ]
        },
        {
            date: '2026-08-21',
            label: 'Friday 21 Aug',
            note: 'Light load and confidence reset before test day.',
            sessions: [
                { time: '16:30', module: 'COS 284', key: 'cos-284', method: 'flash recall', type: 'study', task: 'Quick concept run-through and weak-point checklist.' },
                { time: '18:00', module: 'COS 330', key: 'cos-330', method: 'preview', type: 'study', task: 'Prep Monday lecture and practical notes.' },
                { time: '20:30', module: 'Meta', key: 'meta', method: 'sleep', type: 'meta', task: 'Hard stop and rest.' }
            ]
        },
        {
            date: '2026-08-22',
            label: 'Saturday 22 Aug',
            note: 'COS 284 Test 1 day.',
            sessions: [
                { time: '08:45', module: 'Meta', key: 'meta', method: 'warm-up', type: 'meta', task: 'Short warm-up and travel buffer.' },
                { time: '10:00', module: 'COS 284', key: 'cos-284', method: 'test day', type: 'test', task: 'COS 284 Test 1 (Hatfield Informatorium).' },
                { time: '14:00', module: 'COS 330', key: 'cos-330', method: 'light review', type: 'study', task: 'Review practical workflow for next week.' }
            ]
        },
        {
            date: '2026-08-24',
            label: 'Monday 24 Aug',
            note: 'WTW 224 Test 1 day.',
            sessions: [
                { time: '10:00', module: 'WTW 224', key: 'wtw-224', method: 'test day', type: 'test', task: 'WTW 224 Test 1 (Hatfield, IT 4-2).' }
            ]
        },
        {
            date: '2026-08-27',
            label: 'Thursday 27 Aug',
            note: 'Final prep before COS 330 Test 1.',
            sessions: [
                { time: '17:30', module: 'COS 330', key: 'cos-330', method: 'timed drill', type: 'study', task: 'Run one full timed test-style set.' },
                { time: '19:15', module: 'COS 330', key: 'cos-330', method: 'error log', type: 'study', task: 'Review mistakes and write fixed patterns.' },
                { time: '21:00', module: 'Meta', key: 'meta', method: 'sleep', type: 'meta', task: 'Early cutoff for test day.' }
            ]
        },
        {
            date: '2026-08-28',
            label: 'Friday 28 Aug',
            note: 'COS 330 Test 1 day.',
            sessions: [
                { time: '10:00', module: 'COS 330', key: 'cos-330', method: 'test day', type: 'test', task: 'COS 330 Test 1 (Hatfield Informatorium).' },
                { time: '15:00', module: 'COS 284', key: 'cos-284', method: 'maintenance', type: 'study', task: 'Quick recap so COS 284 momentum stays steady.' }
            ]
        },
        {
            date: '2026-09-11',
            label: 'Friday 11 Sep',
            note: 'COS 284 Class Test 2 (online, ClickUP).',
            sessions: [
                { time: '09:00', module: 'COS 284', key: 'cos-284', method: 'flash recall', type: 'study', task: 'Quick pass over material since Test 1 before the window opens.' },
                { time: '09:30', module: 'COS 284', key: 'cos-284', method: 'test day', type: 'test', task: 'COS 284 Class Test 2 — 45 min, window 09:30-12:30, online.' }
            ]
        },
        {
            date: '2026-10-10',
            label: 'Saturday 10 Oct',
            note: 'WTW 224 Test 2 day; also last major revision block before COS 284 Test 2.',
            sessions: [
                { time: '09:00', module: 'COS 284', key: 'cos-284', method: 'past-paper', type: 'study', task: 'Complete one timed paper and mark immediately.' },
                { time: '10:00', module: 'WTW 224', key: 'wtw-224', method: 'test day', type: 'test', task: 'WTW 224 Test 2 (Hatfield, IT 4-2).' },
                { time: '12:00', module: 'COS 284', key: 'cos-284', method: 'targeted fix', type: 'study', task: 'Redo all weak sections from the timed run.' },
                { time: '16:00', module: 'Meta', key: 'meta', method: 'reset', type: 'meta', task: 'Short walk and early night.' }
            ]
        },
        {
            date: '2026-10-12',
            label: 'Monday 12 Oct',
            note: 'COS 284 Test 2 day.',
            sessions: [
                { time: '10:00', module: 'COS 284', key: 'cos-284', method: 'test day', type: 'test', task: 'COS 284 Test 2 (Hatfield Informatorium).' },
                { time: '18:00', module: 'COS 330', key: 'cos-330', method: 'bridge', type: 'study', task: 'Resume COS 330 exam prep plan.' }
            ]
        },
        {
            date: '2026-10-30',
            label: 'Friday 30 Oct',
            note: 'COS 284 Class Test 3 (online, ClickUP).',
            sessions: [
                { time: '09:00', module: 'COS 284', key: 'cos-284', method: 'flash recall', type: 'study', task: 'Quick pass over material since Test 2 before the window opens.' },
                { time: '09:30', module: 'COS 284', key: 'cos-284', method: 'test day', type: 'test', task: 'COS 284 Class Test 3 — 45 min, window 09:30-12:30, online.' }
            ]
        },
        {
            date: '2026-11-09',
            label: 'Monday 9 Nov',
            note: 'WTW 224 exam day; also final 48-hour phase before COS 284 exam.',
            sessions: [
                { time: '07:30', module: 'WTW 224', key: 'wtw-224', method: 'exam day', type: 'exam', task: 'WTW 224 Exam (PRELIM, Hatfield) — verify time on portal before travelling.' },
                { time: '08:30', module: 'COS 284', key: 'cos-284', method: 'exam drill', type: 'study', task: 'Write one condensed formula and concept sheet from memory.' },
                { time: '14:00', module: 'COS 284', key: 'cos-284', method: 'timed mix', type: 'study', task: 'Mixed timed questions across all major topics.' },
                { time: '20:30', module: 'Meta', key: 'meta', method: 'sleep', type: 'meta', task: 'No late-night studying.' }
            ]
        },
        {
            date: '2026-11-11',
            label: 'Wednesday 11 Nov',
            note: 'COS 284 Exam (Paper 1, PRELIM).',
            sessions: [
                { time: '08:00', module: 'COS 284', key: 'cos-284', method: 'exam day', type: 'exam', task: 'COS 284 Exam Paper 1 at Hatfield (study guide says 08:00; portal PRELIM shows 07:30 — arrive by 07:15 either way).' },
                { time: '13:30', module: 'COS 330', key: 'cos-330', method: 're-focus', type: 'study', task: 'Switch focus to COS 330 exam prep.' }
            ]
        },
        {
            date: '2026-11-19',
            label: 'Thursday 19 Nov',
            note: 'Final revision before COS 330 exam.',
            sessions: [
                { time: '09:00', module: 'COS 330', key: 'cos-330', method: 'timed paper', type: 'study', task: 'Complete one final full timed paper.' },
                { time: '13:00', module: 'COS 330', key: 'cos-330', method: 'mistake sweep', type: 'study', task: 'Only revise recurring mistakes and edge cases.' },
                { time: '20:00', module: 'Meta', key: 'meta', method: 'sleep', type: 'meta', task: 'Pack docs and sleep early.' }
            ]
        },
        {
            date: '2026-11-21',
            label: 'Saturday 21 Nov',
            note: 'COS 330 Exam (Paper 1, PRELIM).',
            sessions: [
                { time: '15:00', module: 'COS 330', key: 'cos-330', method: 'exam day', type: 'exam', task: 'COS 330 Exam Paper 1 at Hatfield.' },
                { time: '19:30', module: 'Meta', key: 'meta', method: 'recover', type: 'meta', task: 'Shut down and recover after exam block.' }
            ]
        }
    ];

    var selectedFilter = 'all';
    var selectedDate = normalizeDate(new Date(DAY_PLANS[0].date + 'T00:00:00'));

    function normalizeDate(date) {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }

    function isoDate(date) {
        var y = date.getFullYear();
        var m = String(date.getMonth() + 1).padStart(2, '0');
        var d = String(date.getDate()).padStart(2, '0');
        return y + '-' + m + '-' + d;
    }

    function parseIso(iso) {
        return new Date(iso + 'T00:00:00');
    }

    var minMappedDate = parseIso(DAY_PLANS[0].date);
    var maxMappedDate = parseIso(DAY_PLANS[DAY_PLANS.length - 1].date);

    function clampToMappedRange(date) {
        if (date < minMappedDate) return normalizeDate(minMappedDate);
        if (date > maxMappedDate) return normalizeDate(maxMappedDate);
        return normalizeDate(date);
    }

    function isSameDate(a, b) {
        return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
    }

    function startOfWeek(date) {
        var d = normalizeDate(date);
        var day = d.getDay();
        var mondayDelta = day === 0 ? -6 : 1 - day;
        d.setDate(d.getDate() + mondayDelta);
        return d;
    }

    function formatDateLabel(date) {
        return date.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' });
    }

    function planForDate(date) {
        var key = isoDate(date);
        for (var i = 0; i < DAY_PLANS.length; i += 1) {
            if (DAY_PLANS[i].date === key) return DAY_PLANS[i];
        }
        return null;
    }

    function filteredSessions(plan) {
        if (!plan) return [];
        if (selectedFilter === 'all') return plan.sessions;
        return plan.sessions.filter(function (session) { return session.key === selectedFilter; });
    }

    function dayHasTest(plan) {
        return plan.sessions.some(function (session) { return session.type === 'test' || session.type === 'exam'; });
    }

    function renderWeekStrip() {
        var weekStart = startOfWeek(selectedDate);
        var weekTitle = document.getElementById('weekTitle');
        var weekDays = document.getElementById('weekDays');
        if (!weekTitle || !weekDays) return;

        var end = new Date(weekStart);
        end.setDate(end.getDate() + 6);
        weekTitle.textContent = weekStart.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) + ' - ' + end.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });

        var today = normalizeDate(new Date());
        var html = '';
        for (var i = 0; i < 7; i += 1) {
            var day = new Date(weekStart);
            day.setDate(weekStart.getDate() + i);
            var plan = planForDate(day);
            var classes = ['week-day'];
            if (isSameDate(day, selectedDate)) classes.push('week-day--selected');
            if (isSameDate(day, today)) classes.push('week-day--today');
            if (day < today) classes.push('week-day--past');
            if (!plan) classes.push('week-day--outside');

            var dots = '';
            if (plan) {
                var hasStudy = plan.sessions.some(function (s) { return s.type === 'study'; });
                var hasMeta = plan.sessions.some(function (s) { return s.type === 'meta'; });
                if (dayHasTest(plan)) dots += '<span class="week-day__dot week-day__dot--test"></span>';
                if (hasStudy) dots += '<span class="week-day__dot week-day__dot--lecture"></span>';
                if (hasMeta) dots += '<span class="week-day__dot week-day__dot--university"></span>';
            }

            html += [
                '<div class="' + classes.join(' ') + '" data-date="' + isoDate(day) + '">',
                '<div class="week-day__label">' + day.toLocaleDateString(undefined, { weekday: 'short' }) + '</div>',
                '<div class="week-day__num">' + day.getDate() + '</div>',
                '<div class="week-day__dots">' + dots + '</div>',
                '</div>'
            ].join('');
        }

        weekDays.innerHTML = html;
        weekDays.querySelectorAll('.week-day').forEach(function (el) {
            el.addEventListener('click', function () {
                var clickedDate = parseIso(el.getAttribute('data-date'));
                if (!planForDate(clickedDate)) return;
                selectedDate = clickedDate;
                renderAll();
            });
        });
    }

    function sessionEventClass(session) {
        if (session.type === 'test') return 'day-event--test';
        if (session.type === 'exam') return 'day-event--exam';
        if (session.type === 'meta') return 'day-event--meta';
        return 'day-event--' + session.key;
    }

    function renderDayDetail() {
        var title = document.getElementById('dayDetailTitle');
        var content = document.getElementById('dayDetailContent');
        if (!title || !content) return;

        var plan = planForDate(selectedDate);
        title.textContent = formatDateLabel(selectedDate);

        if (!plan) {
            content.innerHTML = '<div class="day-event day-event--recess"><div class="day-event__info"><div class="day-event__title">No mapped sessions for this date.</div><div class="day-event__meta">Select another date in the mapped range.</div></div></div>';
            return;
        }

        var sessions = filteredSessions(plan);
        if (!sessions.length) {
            content.innerHTML = '<div class="day-event day-event--recess"><div class="day-event__info"><div class="day-event__title">No sessions for this filter.</div><div class="day-event__meta">Use All to see the full day.</div></div></div>';
            return;
        }

        var html = sessions.map(function (session) {
            return [
                '<div class="day-event ' + sessionEventClass(session) + '">',
                '<div class="day-event__badge">' + session.time + '</div>',
                '<div class="day-event__info">',
                '<div class="day-event__module">' + session.module + '</div>',
                '<div class="day-event__title">' + session.task + '</div>',
                '<div class="day-event__meta">' + plan.note + '</div>',
                '<span class="day-event__method">' + session.method + '</span>',
                '</div>',
                '</div>'
            ].join('');
        }).join('');

        content.innerHTML = html;
    }

    function renderFilters() {
        var root = document.getElementById('filterChips');
        if (!root) return;
        root.querySelectorAll('.chip').forEach(function (chip) {
            var active = chip.getAttribute('data-filter') === selectedFilter;
            chip.classList.toggle('chip--active', active);
        });
    }

    function renderRangeMeta() {
        var meta = document.getElementById('rangeMeta');
        if (!meta) return;

        var visibleDays = DAY_PLANS.filter(function (plan) {
            return filteredSessions(plan).length > 0;
        }).length;

        meta.textContent = DAY_PLANS[0].date + ' - ' + DAY_PLANS[DAY_PLANS.length - 1].date + ' · ' + visibleDays + '/' + DAY_PLANS.length + ' days visible';
    }

    function renderDateRail() {
        var root = document.getElementById('dateRail');
        if (!root) return;

        var html = DAY_PLANS.map(function (plan) {
            var date = parseIso(plan.date);
            var sessions = filteredSessions(plan);
            var classes = ['date-chip'];
            if (isSameDate(date, selectedDate)) classes.push('date-chip--active');
            if (dayHasTest(plan)) classes.push('date-chip--test');
            if (!sessions.length) classes.push('date-chip--empty');

            var flag = dayHasTest(plan) ? '<span class="date-chip__flag">test</span>' : '';

            return [
                '<button class="' + classes.join(' ') + '" data-date="' + plan.date + '" type="button">',
                '<div class="date-chip__dow">' + date.toLocaleDateString(undefined, { weekday: 'short' }) + '</div>',
                '<div class="date-chip__date">' + date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) + '</div>',
                '<div class="date-chip__count">' + sessions.length + ' sessions</div>',
                flag,
                '</button>'
            ].join('');
        }).join('');

        root.innerHTML = html;
        root.querySelectorAll('.date-chip').forEach(function (chip) {
            chip.addEventListener('click', function () {
                selectedDate = parseIso(chip.getAttribute('data-date'));
                renderAll();
            });
        });
    }

    function renderHeaderSubtitle() {
        var el = document.getElementById('headerSubtitle');
        if (!el) return;
        var plan = planForDate(selectedDate);
        if (!plan) {
            el.textContent = 'Select a mapped date in the semester 2 test/exam window.';
            return;
        }

        var sessions = filteredSessions(plan);
        el.textContent = plan.label + ' - ' + sessions.length + ' visible session(s). ' + plan.note;
    }

    function renderAll() {
        renderFilters();
        renderWeekStrip();
        renderDayDetail();
        renderRangeMeta();
        renderDateRail();
        renderHeaderSubtitle();
    }

    function attachUiEvents() {
        var weekPrev = document.getElementById('weekPrev');
        var weekNext = document.getElementById('weekNext');
        var filters = document.getElementById('filterChips');

        if (weekPrev) {
            weekPrev.addEventListener('click', function () {
                var next = new Date(selectedDate);
                next.setDate(next.getDate() - 7);
                selectedDate = clampToMappedRange(next);
                renderAll();
            });
        }

        if (weekNext) {
            weekNext.addEventListener('click', function () {
                var next = new Date(selectedDate);
                next.setDate(next.getDate() + 7);
                selectedDate = clampToMappedRange(next);
                renderAll();
            });
        }

        if (filters) {
            filters.addEventListener('click', function (event) {
                var target = event.target;
                if (!target || !target.classList.contains('chip')) return;
                selectedFilter = target.getAttribute('data-filter') || 'all';
                renderAll();
            });
        }
    }

    attachUiEvents();
    renderAll();
})();
