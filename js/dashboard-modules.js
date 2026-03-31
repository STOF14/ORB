/* ============================================================
   Orb — Dynamic Module Rendering
   Drop this into dashboard.js, replacing the hardcoded cards.
   Requires: firebase-config.js (db, auth, currentUser)
   ============================================================ */

// ── Color map: derived from module code prefix, never hardcoded per module ──
const MODULE_PREFIX_COLORS = {
    'WTW': 'var(--mod-orange)',
    'COS': 'var(--mod-blue)',
    'PHY': 'var(--mod-red)',
    'CHE': 'var(--mod-green)',
    'INF': 'var(--mod-purple)',
    'EKN': 'var(--mod-yellow)',
    'STK': 'var(--mod-teal)',
    'BIO': 'var(--mod-green)',
    'GKD': 'var(--mod-orange)',
    'MEG': 'var(--mod-dark-blue)',
    'EBN': 'var(--mod-dark-blue)',
};

function updateModuleCollapse() {
    const container = document.getElementById('modulesContainer');
    if (!container) return;
    const isMobile = window.innerWidth <= 768;
    container.querySelectorAll('.module').forEach((mod, i) => {
        mod.classList.remove('collapsed');
        if (isMobile && i > 0) mod.classList.add('collapsed');
    });
}
window.addEventListener('resize', updateModuleCollapse);

function getModuleColor(code) {
    if (!code) return 'var(--grid-line)';
    const prefix = code.replace(/\s*\d+.*$/, '').trim().toUpperCase();
    return MODULE_PREFIX_COLORS[prefix] || 'var(--grid-line)';
}

function getModuleSlug(code) {
    return code.toLowerCase().replace(/\s+/g, '-');
}

// ── Assessment section: table rows ──
function renderAssessmentRows(rows) {
    if (!rows || !rows.length) return '';
    return rows.map(r =>
        `<tr>
            <td>${escHtml(r.component)}</td>
            <td>${escHtml(r.details)}</td>
            <td style="text-align:right"><span class="percentage">${escHtml(r.weight)}</span></td>
        </tr>`
    ).join('');
}

// ── Info grid (key-value pairs, e.g. EO1/EO2/EO3) ──
function renderInfoGrid(items) {
    if (!items || !items.length) return '';
    return `<div class="info-grid">` +
        items.map(i =>
            `<div class="info-label">${escHtml(i.label)}</div>
             <div class="info-value">${escHtml(i.value)}</div>`
        ).join('') +
    `</div>`;
}

// ── Single assessment section (heading + table or info-grid) ──
function renderAssessmentSection(section) {
    let inner = '';

    if (section.rows && section.rows.length) {
        inner += `<table class="assessment-table">
            <thead><tr><th>Component</th><th>Details</th><th style="text-align:right">Weight</th></tr></thead>
            <tbody>${renderAssessmentRows(section.rows)}</tbody>
        </table>`;
    }

    if (section.infoGrid && section.infoGrid.length) {
        inner += renderInfoGrid(section.infoGrid);
    }

    if (section.finalMarkNote) {
        inner += `<p class="text-block" style="font-weight:500;margin-top:15px">${escHtml(section.finalMarkNote)}</p>`;
    }

    return `<div class="info-section"><h4>${escHtml(section.heading)}</h4>${inner}</div>`;
}

// ── Schedule grid ──
function renderSchedule(schedule) {
    if (!schedule || !schedule.length) return '';
    const items = schedule.map(s =>
        `<div class="schedule-item"${s.span ? ' style="grid-column:span 2"' : ''}>
            <div class="schedule-time">${escHtml(s.label)}</div>
            ${escHtml(s.time)}
        </div>`
    ).join('');
    return `<div class="info-section"><h4>Schedule</h4><div class="schedule-grid">${items}</div></div>`;
}

// ── Instructors grid ──
function renderInstructors(instructors) {
    if (!instructors || !instructors.length) return '';
    const rows = instructors.map(i => {
        const nameVal = i.office
            ? `${escHtml(i.name)} — ${escHtml(i.office)}`
            : escHtml(i.name);
        return `<div class="info-label">${escHtml(i.role)}</div><div class="info-value">${nameVal}</div>`;
    }).join('');
    return `<div class="info-section"><h4>Instructors</h4><div class="info-grid">${rows}</div></div>`;
}

// ── Extra info sections (topics, textbooks, etc.) ──
function renderInfoSections(sections) {
    if (!sections || !sections.length) return '';
    return sections.map(s =>
        `<div class="info-section"><h4>${escHtml(s.heading)}</h4><p class="text-block">${escHtml(s.content)}</p></div>`
    ).join('');
}

// ── Requirements / critical dates warning box ──
function renderRequirements(items, heading) {
    if (!items || !items.length) return '';
    const lis = items.map(r => `<li>${escHtml(r)}</li>`).join('');
    return `<div class="warning"><h4>${escHtml(heading || 'Requirements')}</h4><ul>${lis}</ul></div>`;
}

// ── MAIN: render one module card ──
function renderModuleCard(module) {
    const slug  = getModuleSlug(module.code);
    const color = getModuleColor(module.code);

    const assessmentHtml = (module.assessmentSections || [])
        .map(renderAssessmentSection).join('');

    return `
    <article class="module module-${slug}" id="${slug}" style="--module-accent:${color}">
        <div class="module-header">
            <div class="module-code">${escHtml(module.code)}</div>
            <div class="credits">${escHtml(module.creditsDisplay || (module.credits ? module.credits + ' CREDITS' : ''))}</div>
        </div>
        <div class="module-content">
            <h3 class="module-title">${escHtml(module.name)}</h3>
            <div class="color-accent"></div>
            ${renderInstructors(module.instructors)}
            ${renderSchedule(module.schedule)}
            ${assessmentHtml}
            ${renderInfoSections(module.infoSections)}
            ${renderRequirements(module.requirements, module.requirementsHeading)}
        </div>
    </article>`;
}

// ── Inject all module cards into the DOM ──
function renderAllModules(modules) {
    const container = document.getElementById('modulesContainer');
    if (!container) return;

    if (!modules || !modules.length) {
        container.innerHTML = '<p class="no-modules">No modules found. Complete onboarding to add your modules.</p>';
        return;
    }

    container.innerHTML = modules
        .map(renderModuleCard)
        .join('');

    // Always remove collapsed state first (for desktop)
    container.querySelectorAll('.module').forEach(mod => {
        mod.classList.remove('collapsed');
    });

    // Mobile: collapsible module cards (click to expand/collapse)
    container.querySelectorAll('.module-header').forEach(header => {
        header.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                header.closest('.module').classList.toggle('collapsed');
            }
        });
    });

    // Re-run hash scroll
    if (window.location.hash) {
        const target = document.querySelector(window.location.hash);
        if (target) {
            target.classList.remove('collapsed');
            setTimeout(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
        }
    }
}

// ── Firestore: load modules for current user ──
async function loadUserModules() {
    if (!currentUser) return;

    // Hide loading message immediately
    const container = document.getElementById('modulesContainer');
    if (container) container.innerHTML = '';

    try {
        const snap = await db
            .collection('users').doc(currentUser.uid)
            .collection('modules')
            .get();

        if (snap.empty) {
            showOnboarding();
            return;
        }

        const modules = [];
        snap.forEach(doc => modules.push({ firestoreId: doc.id, ...doc.data() }));
        renderAllModules(modules);

        // Responsive collapse/expand on resize
        function updateModuleCollapse() {
            const container = document.getElementById('modulesContainer');
            if (!container) return;
            const isMobile = window.innerWidth <= 768;
            container.querySelectorAll('.module').forEach((mod, i) => {
                mod.classList.remove('collapsed');
                if (isMobile && i > 0) mod.classList.add('collapsed');
            });
        }
        window.removeEventListener('resize', updateModuleCollapse); // prevent stacking
        window.addEventListener('resize', updateModuleCollapse);
        updateModuleCollapse();

    } catch (err) {
        console.error('Failed to load modules:', err);
        // Graceful fallback — show empty state rather than crashing
        renderAllModules([]);
    }
}

// ── Firestore: save a single module ──
async function saveModule(moduleData) {
    if (!currentUser) return;
    const slug = getModuleSlug(moduleData.code);
    await db
        .collection('users').doc(currentUser.uid)
        .collection('modules').doc(slug)
        .set(moduleData, { merge: true });
}

// ── Firestore: delete a module ──
async function deleteModule(moduleCode) {
    if (!currentUser) return;
    const slug = getModuleSlug(moduleCode);
    await db
        .collection('users').doc(currentUser.uid)
        .collection('modules').doc(slug)
        .delete();
}

// ── Onboarding: show the setup screen ──
function showOnboarding() {
    const container = document.getElementById('modulesContainer');
    if (!container) return;
    container.innerHTML = `
    <div class="onboarding-prompt">
        <div class="onboarding-icon">⬡</div>
        <h2>Welcome to Orb</h2>
        <p>You don't have any modules set up yet.<br>Let's get your semester loaded.</p>
        <button class="btn-primary" onclick="openOnboardingModal()">Set up my modules</button>
    </div>`;
}

// ── Escape HTML to prevent XSS ──
function escHtml(str) {
    if (!str && str !== 0) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// ── Hook into existing auth listener ──
// Replace your existing auth.onAuthStateChanged in dashboard.js with this,
// or add loadUserModules() inside your existing one after setting currentUser:
//
//   auth.onAuthStateChanged(user => {
//       currentUser = user;
//       renderWeeklyReview();   // already there
//       loadUserModules();      // ADD THIS LINE
//   });
