/* ============================================================
   Orb — Grades
   Mark tracker, semester-mark calculator, exam predictor
   Firestore: users/{uid}/grades/{module-slug}
   localStorage: orb_grades_{module-slug}
   ============================================================ */

/* ── Module definitions ── */
const MODULES = [
    {
        code: 'PHY 255',
        slug: 'phy-255',
        name: 'Physics',
        credits: 24,
        color: 'var(--red)',
        semWeight: 0.5,
        examWeight: 0.5,
        passRules: [
            '≥40% CAM subminimum for exam entrance',
            '≥40% exam subminimum to pass',
            'All 12 practicals must be completed'
        ],
        components: [
            { key: 'thermo',    label: 'Thermodynamics Continuous', weight: 0.2042 },
            { key: 'mp_ct1',    label: 'Modern Physics Class Test 1', weight: 0.4958 * 0.36 / 6 },
            { key: 'mp_ct2',    label: 'Modern Physics Class Test 2', weight: 0.4958 * 0.36 / 6 },
            { key: 'mp_ct3',    label: 'Modern Physics Class Test 3', weight: 0.4958 * 0.36 / 6 },
            { key: 'mp_ct4',    label: 'Modern Physics Class Test 4', weight: 0.4958 * 0.36 / 6 },
            { key: 'mp_ct5',    label: 'Modern Physics Class Test 5', weight: 0.4958 * 0.36 / 6 },
            { key: 'mp_ct6',    label: 'Modern Physics Class Test 6', weight: 0.4958 * 0.36 / 6 },
            { key: 'mp_st1',    label: 'Semester Test 1 (Modern)', weight: 0.4958 * 0.28 },
            { key: 'mp_st2',    label: 'Semester Test 2 (Modern)', weight: 0.4958 * 0.36 },
            { key: 'modelling', label: 'Modelling Practicals', weight: 0.15 },
            { key: 'error',     label: 'Error Analysis Practicals', weight: 0.15 }
        ],
        examSubmin: 0.40,
        semSubmin: 0.40,
        passMin: 0.50
    },
    {
        code: 'WTW 211',
        slug: 'wtw-211',
        name: 'Linear Algebra',
        credits: 12,
        color: 'var(--orange)',
        semWeight: 0.6,
        examWeight: 0.4,
        passRules: [
            'Exam admission requires ≥40% semester mark',
            'Pass requires ≥50% final AND ≥40% exam',
            'No calculators permitted'
        ],
        components: [
            { key: 'st1',   label: 'Semester Test 1', weight: 0.35 },
            { key: 'st2',   label: 'Semester Test 2', weight: 0.35 },
            { key: 'tuts',  label: 'Assignments + Tutorials', weight: 0.30 }
        ],
        examSubmin: 0.40,
        semSubmin: 0.40,
        passMin: 0.50
    },
    {
        code: 'WTW 218',
        slug: 'wtw-218',
        name: 'Calculus',
        credits: 12,
        color: 'var(--yellow)',
        semWeight: 0.6,
        examWeight: 0.4,
        passRules: [
            'Exam admission requires ≥40% semester mark',
            'Pass requires ≥50% final AND ≥40% exam'
        ],
        components: [
            { key: 'st1',  label: 'Semester Test 1', weight: 0.35 },
            { key: 'st2',  label: 'Semester Test 2', weight: 0.35 },
            { key: 'tuts', label: 'Tutorial Tests (best 3 of 4)', weight: 0.25, subItems: { count: 4, best: 3, name: 'Tutorial Test' } },
            { key: 'hw',   label: 'Homework (8 via ClickUP)', weight: 0.05, subItems: { count: 8, best: 8, name: 'Homework' } }
        ],
        examSubmin: 0.40,
        semSubmin: 0.40,
        passMin: 0.50
    },
    {
        code: 'COS 210',
        slug: 'cos-210',
        name: 'Theoretical CS',
        credits: 8,
        color: 'var(--blue)',
        semWeight: 0.6,
        examWeight: 0.4,
        passRules: [
            'Exam refused if semester mark < 40%',
            'Pass requires ≥40% exam AND ≥50% final'
        ],
        components: [
            { key: 'ws',   label: 'Worksheets (best 9 of 10)', weight: 0.10, subItems: { count: 10, best: 9, name: 'Worksheet' } },
            { key: 'ct',   label: 'Class Tests (best 2 of 3)', weight: 0.20, subItems: { count: 3, best: 2, name: 'Class Test' } },
            { key: 'st1',  label: 'Semester Test 1', weight: 0.35 },
            { key: 'st2',  label: 'Semester Test 2', weight: 0.35 }
        ],
        examSubmin: 0.40,
        semSubmin: 0.40,
        passMin: 0.50
    },
    {
        code: 'COS 212',
        slug: 'cos-212',
        name: 'Data Structures',
        credits: 16,
        color: 'var(--dark-blue)',
        /* COS 212 is continuous assessment — no separate exam weight.
           The three "Exam Opportunities" are just components within the mark. */
        semWeight: 1.0,
        examWeight: 0,
        passRules: [
            'Pass: ≥50% final AND ≥40% average on exam opportunities',
            'EO3 entrance requires ≥20% final mark'
        ],
        components: [
            { key: 'pracs', label: 'Practicals (best 4 of 5)', weight: 0.20, subItems: { count: 5, best: 4, name: 'Practical' } },
            { key: 'tuts',  label: 'Tutorials (best 9 of 11)', weight: 0.10, subItems: { count: 11, best: 9, name: 'Tutorial' } },
            { key: 'hw',    label: 'Homework (3 Assignments)', weight: 0.10, subItems: { count: 3, best: 3, name: 'Assignment' } },
            { key: 'eo1',   label: 'Exam Opportunity 1', weight: 0.20 },
            { key: 'eo2',   label: 'Exam Opportunity 2', weight: 0.20 },
            { key: 'eo3',   label: 'Exam Opportunity 3', weight: 0.20 }
        ],
        examSubmin: 0.40,  /* average of EOs */
        semSubmin: 0,
        passMin: 0.50
    }
];

/* ── Firestore helpers ── */
function gradesDocRef(slug) {
    return db.collection('users').doc(currentUser.uid)
             .collection('grades').doc(slug);
}

function lsKey(slug) { return 'orb_grades_' + slug; }

async function loadGrades(slug) {
    if (currentUser) {
        try {
            const snap = await gradesDocRef(slug).get();
            if (snap.exists) {
                localStorage.setItem(lsKey(slug), JSON.stringify(snap.data()));
                return snap.data();
            }
        } catch (e) { console.warn('Firestore grades read failed:', e); }
    }
    try { return JSON.parse(localStorage.getItem(lsKey(slug))) || {}; }
    catch { return {}; }
}

async function saveGrades(slug, data) {
    localStorage.setItem(lsKey(slug), JSON.stringify(data));
    if (currentUser) {
        try { await gradesDocRef(slug).set(data, { merge: true }); }
        catch (e) { console.warn('Firestore grades write failed:', e); }
    }
}

/* ── State ── */
const gradeData = {};   /* slug → { key: number|null } */
let gradesLoaded = false;

/* ── Calculations ── */
function getComponentMark(mod, comp) {
    const d = gradeData[mod.slug] || {};
    if (!comp.subItems) {
        const val = parseFloat(d[comp.key]);
        return isNaN(val) ? null : val;
    }
    /* Collect all entered sub-item marks */
    const marks = [];
    for (let i = 1; i <= comp.subItems.count; i++) {
        const val = parseFloat(d[comp.key + '_' + i]);
        if (!isNaN(val)) marks.push(val);
    }
    if (marks.length === 0) return null;
    /* Sort descending, take best N, average */
    marks.sort((a, b) => b - a);
    const best = marks.slice(0, comp.subItems.best);
    return best.reduce((sum, v) => sum + v, 0) / best.length;
}

function calcSemesterMark(mod) {
    let weightedSum = 0;
    let weightEntered = 0;
    mod.components.forEach(c => {
        const val = getComponentMark(mod, c);
        if (val !== null) {
            weightedSum += val * c.weight;
            weightEntered += c.weight;
        }
    });
    if (weightEntered === 0) return null;
    /* Scale up to full semester mark if not all components entered */
    return weightedSum / weightEntered;
}

function calcFinalMark(mod, examMark) {
    const sem = calcSemesterMark(mod);
    if (sem === null) return null;
    if (mod.examWeight === 0) return sem;  /* COS 212 continuous */
    if (examMark === null || examMark === undefined) return null;
    return sem * mod.semWeight + examMark * mod.examWeight;
}

function calcExamNeeded(mod, target) {
    const sem = calcSemesterMark(mod);
    if (sem === null || mod.examWeight === 0) return null;
    /* target = sem * semWeight + exam * examWeight  →  exam = (target - sem*semWeight) / examWeight */
    const needed = (target - sem * mod.semWeight) / mod.examWeight;
    return Math.max(0, needed);
}

function getModuleStatus(mod) {
    const sem = calcSemesterMark(mod);
    const d = gradeData[mod.slug] || {};
    const examVal = parseFloat(d.exam);
    const hasExam = !isNaN(examVal);

    if (sem === null) return { tag: 'none', label: 'No marks', cls: '' };

    /* Semester submin check */
    if (mod.semSubmin > 0 && sem < mod.semSubmin * 100) {
        return { tag: 'denied', label: 'Exam denied', cls: 'status--red' };
    }

    /* COS 212: continuous — check EO average submin and final */
    if (mod.slug === 'cos-212') {
        const eo1 = parseFloat(d.eo1), eo2 = parseFloat(d.eo2), eo3 = parseFloat(d.eo3);
        const eos = [eo1, eo2, eo3].filter(v => !isNaN(v));
        if (eos.length === 3) {
            const avg = (eo1 + eo2 + eo3) / 3;
            if (avg < 40) return { tag: 'fail', label: 'EO avg < 40%', cls: 'status--red' };
            if (sem >= 75) return { tag: 'dist', label: 'Distinction', cls: 'status--green' };
            if (sem >= 50) return { tag: 'pass', label: 'Pass', cls: 'status--green' };
            return { tag: 'fail', label: 'Below 50%', cls: 'status--red' };
        }
        if (sem >= 75) return { tag: 'ontrack', label: 'On track — distinction', cls: 'status--green' };
        if (sem >= 50) return { tag: 'ontrack', label: 'On track', cls: 'status--green' };
        return { tag: 'risk', label: 'At risk', cls: 'status--amber' };
    }

    if (hasExam) {
        if (examVal < mod.examSubmin * 100) return { tag: 'fail', label: 'Exam submin fail', cls: 'status--red' };
        const final_ = sem * mod.semWeight + examVal * mod.examWeight;
        if (final_ >= 75) return { tag: 'dist', label: 'Distinction', cls: 'status--green' };
        if (final_ >= 50) return { tag: 'pass', label: 'Pass', cls: 'status--green' };
        return { tag: 'fail', label: 'Fail', cls: 'status--red' };
    }

    /* No exam yet — predict */
    const passNeeded = calcExamNeeded(mod, 50);
    if (passNeeded !== null && passNeeded > 100) return { tag: 'risk', label: 'At risk', cls: 'status--red' };
    if (passNeeded !== null && passNeeded > 60)  return { tag: 'borderline', label: 'Borderline', cls: 'status--amber' };
    if (sem >= 70) return { tag: 'ontrack', label: 'On track', cls: 'status--green' };
    if (sem >= 50) return { tag: 'ok', label: 'OK', cls: 'status--green' };
    return { tag: 'risk', label: 'At risk', cls: 'status--amber' };
}

/* ── Render ── */
function escapeHtml(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
}

function renderSummaryBar() {
    const el = document.getElementById('gradeSummary');
    if (!el) return;
    let entered = 0, atRisk = 0, passing = 0, distinction = 0;
    MODULES.forEach(mod => {
        const st = getModuleStatus(mod);
        if (st.tag === 'none') return;
        entered++;
        if (st.tag === 'risk' || st.tag === 'denied' || st.tag === 'fail') atRisk++;
        else if (st.tag === 'dist') distinction++;
        else passing++;
    });
    el.innerHTML =
        '<div class="header-stat">' +
            '<div class="header-stat__number">' + entered + '</div>' +
            '<div class="header-stat__label">Tracked</div>' +
        '</div>' +
        '<div class="header-stat' + (atRisk ? ' header-stat--red' : '') + '">' +
            '<div class="header-stat__number">' + atRisk + '</div>' +
            '<div class="header-stat__label">At Risk</div>' +
        '</div>' +
        '<div class="header-stat">' +
            '<div class="header-stat__number">' + passing + '</div>' +
            '<div class="header-stat__label">Passing</div>' +
        '</div>' +
        '<div class="header-stat' + (distinction ? ' header-stat--green' : '') + '">' +
            '<div class="header-stat__number">' + distinction + '</div>' +
            '<div class="header-stat__label">Distinction</div>' +
        '</div>';
}

function renderModuleCard(mod) {
    const d = gradeData[mod.slug] || {};
    const sem = calcSemesterMark(mod);
    const status = getModuleStatus(mod);

    const examVal = parseFloat(d.exam);
    const hasExam = !isNaN(examVal);

    /* Component rows */
    const rows = mod.components.map(c => {
        if (c.subItems) {
            /* Expandable row — shows computed aggregate, click to expand sub-items */
            const computed = getComponentMark(mod, c);
            const computedDisplay = computed !== null ? computed.toFixed(1) + '%' : '—';
            const groupId = mod.slug + '-' + c.key;
            let html = '<tr class="expandable-row" data-expand="' + groupId + '">' +
                '<td><span class="expand-icon">&#9656;</span> ' + escapeHtml(c.label) + '</td>' +
                '<td class="weight-cell">' + (c.weight * 100).toFixed(1) + '%</td>' +
                '<td class="mark-cell"><span class="computed-mark" data-computed="' + groupId + '">' + computedDisplay + '</span></td>' +
            '</tr>';
            for (let i = 1; i <= c.subItems.count; i++) {
                const subKey = c.key + '_' + i;
                const subVal = d[subKey];
                html += '<tr class="sub-row" data-group="' + groupId + '" hidden>' +
                    '<td class="sub-label">' + escapeHtml(c.subItems.name) + ' ' + i + '</td>' +
                    '<td></td>' +
                    '<td class="mark-cell">' +
                        '<input type="number" min="0" max="100" step="0.1" class="mark-input mark-input--sub" ' +
                            'data-slug="' + mod.slug + '" data-key="' + subKey + '" data-parent="' + c.key + '" ' +
                            'value="' + (subVal !== undefined && subVal !== null && subVal !== '' ? subVal : '') + '" ' +
                            'placeholder="—" autocomplete="off">' +
                    '</td>' +
                '</tr>';
            }
            return html;
        }
        /* Standard row */
        const val = d[c.key];
        return '<tr>' +
            '<td>' + escapeHtml(c.label) + '</td>' +
            '<td class="weight-cell">' + (c.weight * 100).toFixed(1) + '%</td>' +
            '<td class="mark-cell">' +
                '<input type="number" min="0" max="100" step="0.1" class="mark-input" ' +
                    'data-slug="' + mod.slug + '" data-key="' + c.key + '" ' +
                    'value="' + (val !== undefined && val !== null && val !== '' ? val : '') + '" ' +
                    'placeholder="—" autocomplete="off">' +
            '</td>' +
        '</tr>';
    }).join('');

    /* Exam row (only for modules with exam weight > 0) */
    let examRow = '';
    if (mod.examWeight > 0) {
        examRow = '<tr class="exam-row">' +
            '<td>Exam</td>' +
            '<td class="weight-cell">' + (mod.examWeight * 100).toFixed(0) + '% of final</td>' +
            '<td class="mark-cell">' +
                '<input type="number" min="0" max="100" step="0.1" class="mark-input mark-input--exam" ' +
                    'data-slug="' + mod.slug + '" data-key="exam" ' +
                    'value="' + (d.exam !== undefined && d.exam !== null && d.exam !== '' ? d.exam : '') + '" ' +
                    'placeholder="—" autocomplete="off">' +
            '</td>' +
        '</tr>';
    }

    /* Semester mark display */
    const semDisplay = sem !== null ? sem.toFixed(1) + '%' : '—';

    /* Predictions */
    let predictions = '';
    if (mod.examWeight > 0 && sem !== null && !hasExam) {
        const pass = calcExamNeeded(mod, 50);
        const dist = calcExamNeeded(mod, 75);
        predictions =
            '<div class="predictions">' +
                '<div class="predictions__title">What you need on the exam</div>' +
                '<div class="predictions__row">' +
                    '<span class="predictions__target">To pass (50%)</span>' +
                    '<span class="predictions__value' + (pass > 100 ? ' predictions__value--impossible' : pass > 60 ? ' predictions__value--warning' : ' predictions__value--safe') + '">' +
                        (pass > 100 ? 'Not possible' : pass <= 0 ? 'Already secured' : pass.toFixed(1) + '%') +
                    '</span>' +
                '</div>' +
                '<div class="predictions__row">' +
                    '<span class="predictions__target">Distinction (75%)</span>' +
                    '<span class="predictions__value' + (dist > 100 ? ' predictions__value--impossible' : dist > 80 ? ' predictions__value--warning' : ' predictions__value--safe') + '">' +
                        (dist > 100 ? 'Not possible' : dist.toFixed(1) + '%') +
                    '</span>' +
                '</div>' +
            '</div>';
    }

    /* Final mark (if exam entered) */
    let finalMarkHtml = '';
    if (hasExam && mod.examWeight > 0 && sem !== null) {
        const final_ = calcFinalMark(mod, examVal);
        finalMarkHtml =
            '<div class="final-mark">' +
                '<span class="final-mark__label">Final mark</span>' +
                '<span class="final-mark__value">' + final_.toFixed(1) + '%</span>' +
            '</div>';
    }

    /* Pass rules */
    const rules = mod.passRules.map(r => '<li>' + escapeHtml(r) + '</li>').join('');

    return '<article class="grade-card" data-slug="' + mod.slug + '" style="--mod-color: ' + mod.color + ';">' +
        '<div class="grade-card__header">' +
            '<div>' +
                '<div class="grade-card__code">' + escapeHtml(mod.code) + '</div>' +
                '<div class="grade-card__name">' + escapeHtml(mod.name) + ' · ' + mod.credits + ' cr</div>' +
            '</div>' +
            '<div class="grade-card__right">' +
                '<div class="grade-card__sem">' +
                    '<span class="grade-card__sem-label">Semester</span>' +
                    '<span class="grade-card__sem-value">' + semDisplay + '</span>' +
                '</div>' +
                (status.tag !== 'none' ?
                    '<span class="grade-card__status ' + status.cls + '">' + escapeHtml(status.label) + '</span>' : '') +
            '</div>' +
        '</div>' +
        '<div class="grade-card__body">' +
            '<table class="grade-table">' +
                '<thead><tr><th scope="col">Component</th><th scope="col">Weight</th><th scope="col">Mark</th></tr></thead>' +
                '<tbody>' + rows + examRow + '</tbody>' +
            '</table>' +
            predictions +
            finalMarkHtml +
            '<details class="grade-card__rules"><summary>Pass rules</summary><ul>' + rules + '</ul></details>' +
        '</div>' +
    '</article>';
}

function renderAllCards() {
    const container = document.getElementById('gradeCards');
    if (!container) return;
    container.innerHTML = MODULES.map(renderModuleCard).join('');
    renderSummaryBar();
}

/* ── Event handling ── */
let saveTimer = null;

function handleMarkInput(e) {
    const input = e.target;
    if (!input.classList.contains('mark-input')) return;
    const slug = input.dataset.slug;
    const key = input.dataset.key;
    let val = input.value.trim();

    if (!gradeData[slug]) gradeData[slug] = {};

    if (val === '') {
        delete gradeData[slug][key];
    } else {
        let num = parseFloat(val);
        if (isNaN(num)) return;
        if (num < 0) num = 0;
        if (num > 100) num = 100;
        gradeData[slug][key] = num;
    }

    /* Re-render just the summary + predictions (not the full card — would lose focus) */
    const mod = MODULES.find(m => m.slug === slug);
    if (mod) {
        /* If this is a sub-item, update the computed mark on the parent row */
        const parentKey = input.dataset.parent;
        if (parentKey) {
            const comp = mod.components.find(c => c.key === parentKey);
            if (comp) {
                const computed = getComponentMark(mod, comp);
                const groupId = mod.slug + '-' + parentKey;
                const computedEl = document.querySelector('[data-computed="' + groupId + '"]');
                if (computedEl) computedEl.textContent = computed !== null ? computed.toFixed(1) + '%' : '—';
            }
        }
        updateCardSummary(mod);
        renderSummaryBar();
    }

    /* Debounce save */
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => saveGrades(slug, gradeData[slug] || {}), 400);
}

function updateCardSummary(mod) {
    const card = document.querySelector('[data-slug="' + mod.slug + '"]');
    if (!card) return;
    const d = gradeData[mod.slug] || {};
    const sem = calcSemesterMark(mod);
    const status = getModuleStatus(mod);
    const examVal = parseFloat(d.exam);
    const hasExam = !isNaN(examVal);

    /* Semester mark */
    const semEl = card.querySelector('.grade-card__sem-value');
    if (semEl) semEl.textContent = sem !== null ? sem.toFixed(1) + '%' : '—';

    /* Status badge */
    const statusEl = card.querySelector('.grade-card__status');
    if (statusEl) {
        statusEl.textContent = status.label;
        statusEl.className = 'grade-card__status ' + status.cls;
    } else if (status.tag !== 'none') {
        const rightEl = card.querySelector('.grade-card__right');
        if (rightEl) {
            const span = document.createElement('span');
            span.className = 'grade-card__status ' + status.cls;
            span.textContent = status.label;
            rightEl.appendChild(span);
        }
    }

    /* Predictions */
    const existingPred = card.querySelector('.predictions');
    const existingFinal = card.querySelector('.final-mark');

    if (mod.examWeight > 0 && sem !== null && !hasExam) {
        const pass = calcExamNeeded(mod, 50);
        const dist = calcExamNeeded(mod, 75);
        const html =
            '<div class="predictions">' +
                '<div class="predictions__title">What you need on the exam</div>' +
                '<div class="predictions__row">' +
                    '<span class="predictions__target">To pass (50%)</span>' +
                    '<span class="predictions__value' + (pass > 100 ? ' predictions__value--impossible' : pass > 60 ? ' predictions__value--warning' : ' predictions__value--safe') + '">' +
                        (pass > 100 ? 'Not possible' : pass <= 0 ? 'Already secured' : pass.toFixed(1) + '%') +
                    '</span>' +
                '</div>' +
                '<div class="predictions__row">' +
                    '<span class="predictions__target">Distinction (75%)</span>' +
                    '<span class="predictions__value' + (dist > 100 ? ' predictions__value--impossible' : dist > 80 ? ' predictions__value--warning' : ' predictions__value--safe') + '">' +
                        (dist > 100 ? 'Not possible' : dist.toFixed(1) + '%') +
                    '</span>' +
                '</div>' +
            '</div>';
        if (existingPred) { existingPred.outerHTML = html; }
        else {
            const table = card.querySelector('.grade-table');
            if (table) table.insertAdjacentHTML('afterend', html);
        }
        if (existingFinal) existingFinal.remove();
    } else if (hasExam && mod.examWeight > 0 && sem !== null) {
        const final_ = calcFinalMark(mod, examVal);
        const html = '<div class="final-mark"><span class="final-mark__label">Final mark</span><span class="final-mark__value">' + final_.toFixed(1) + '%</span></div>';
        if (existingFinal) { existingFinal.outerHTML = html; }
        else if (existingPred) { existingPred.outerHTML = html; }
        else {
            const table = card.querySelector('.grade-table');
            if (table) table.insertAdjacentHTML('afterend', html);
        }
    } else {
        if (existingPred) existingPred.remove();
        if (existingFinal) existingFinal.remove();
    }
}

/* ── Real-time listeners ── */
const unsubscribers = [];

function listenToGrades() {
    /* Tear down any existing listeners */
    unsubscribers.forEach(fn => fn());
    unsubscribers.length = 0;

    if (!currentUser) return;

    MODULES.forEach(mod => {
        const unsub = gradesDocRef(mod.slug).onSnapshot(snap => {
            /* Ignore local writes echoed back */
            if (snap.metadata.hasPendingWrites) return;
            if (snap.exists) {
                const data = snap.data();
                gradeData[mod.slug] = data;
                localStorage.setItem(lsKey(mod.slug), JSON.stringify(data));
                /* Only re-render if not currently focused inside this card (avoid stealing focus) */
                const active = document.activeElement;
                const inCard = active && active.dataset && active.dataset.slug === mod.slug;
                if (!inCard) {
                    const card = document.querySelector('[data-slug="' + mod.slug + '"]');
                    if (card) {
                        const newHtml = renderModuleCard(mod);
                        const temp = document.createElement('div');
                        temp.innerHTML = newHtml;
                        card.replaceWith(temp.firstElementChild);
                    }
                } else {
                    updateCardSummary(mod);
                }
                renderSummaryBar();
            }
        });
        unsubscribers.push(unsub);
    });
}

/* ── Init ── */
async function initGrades() {
    for (const mod of MODULES) {
        gradeData[mod.slug] = await loadGrades(mod.slug);
    }
    gradesLoaded = true;
    renderAllCards();

    const container = document.getElementById('gradeCards');
    if (container) {
        container.addEventListener('input', handleMarkInput);
        /* Expand/collapse sub-item rows */
        container.addEventListener('click', function(e) {
            const row = e.target.closest('.expandable-row');
            if (!row) return;
            const group = row.dataset.expand;
            const expanded = row.classList.toggle('expanded');
            const icon = row.querySelector('.expand-icon');
            if (icon) icon.textContent = expanded ? '\u25BE' : '\u25B8';
            const tbody = row.closest('tbody');
            if (tbody) {
                tbody.querySelectorAll('.sub-row[data-group="' + group + '"]').forEach(function(r) { r.hidden = !expanded; });
            }
        });
    }

    /* Start real-time sync */
    listenToGrades();
}

/* Auth listener */
auth.onAuthStateChanged(user => {
    currentUser = user;
    const authContent = document.getElementById('authContent');
    const syncStatus = document.getElementById('syncStatus');

    if (user) {
        if (authContent) {
            authContent.innerHTML =
                '<span class="user-name">' + escapeHtml(user.displayName || user.email) + '</span>' +
                '<button class="signout-btn" onclick="signOutUser()">Sign Out</button>';
        }
        if (syncStatus) { syncStatus.textContent = 'Synced'; syncStatus.className = 'sync-status online'; }
    } else {
        /* Tear down listeners on sign-out */
        unsubscribers.forEach(fn => fn());
        unsubscribers.length = 0;
        if (authContent) {
            authContent.innerHTML = '<button class="auth-btn" onclick="signInWithGoogle()">Sign in with Google</button>';
        }
        if (syncStatus) { syncStatus.textContent = 'Local only'; syncStatus.className = 'sync-status offline'; }
    }
    initGrades();
});
