/* ============================================================
   Orb — Shared Critical Dates
   Single source of truth for tests & exams across all pages
   ============================================================ */

const CRITICAL_DATES = [
    // ── Class Tests (online, ClickUP) ──
    { date: '2026-08-07', event: 'COS 284 Class Test 1', type: 'test', module: 'cos-284', day: 'Friday', time: '09:30 – 12:30 (45 min once started)', venue: 'Online (ClickUP)' },
    { date: '2026-09-11', event: 'COS 284 Class Test 2', type: 'test', module: 'cos-284', day: 'Friday', time: '09:30 – 12:30 (45 min once started)', venue: 'Online (ClickUP)' },
    { date: '2026-10-30', event: 'COS 284 Class Test 3', type: 'test', module: 'cos-284', day: 'Friday', time: '09:30 – 12:30 (45 min once started)', venue: 'Online (ClickUP)' },
    // ── Semester Tests ──
    { date: '2026-08-22', event: 'COS 284 Test 1', type: 'test', module: 'cos-284', day: 'Saturday', time: '10:00 – 11:30', venue: 'Hatfield, Informatorium (Blue 1/2/3, Green, Purple, Red Lab)' },
    { date: '2026-08-28', event: 'COS 330 Test 1', type: 'test', module: 'cos-330', day: 'Friday', time: '10:00 – 11:30', venue: 'Hatfield, Informatorium (Blue 1/2/3, Red Lab)' },
    { date: '2026-10-12', event: 'COS 284 Test 2', type: 'test', module: 'cos-284', day: 'Monday', time: '10:00 – 11:30', venue: 'Hatfield, Informatorium (Blue 1/2/3, Green, Purple, Red Lab)' },
    { date: '2026-08-24', event: 'WTW 224 Test 1', type: 'test', module: 'wtw-224', day: 'Monday', time: '10:00 – 11:30', venue: 'Hatfield, IT 4-2' },
    { date: '2026-10-10', event: 'WTW 224 Test 2', type: 'test', module: 'wtw-224', day: 'Saturday', time: '10:00 – 11:30', venue: 'Hatfield, IT 4-2' },
    // ── Exams (PRELIM) ──
    // Note: COS 284 study guide (official, 19 Jul 2026) lists 08:00 start; the
    // ClickUP student portal (PRELIM row, pulled 24 Jul 2026) shows 07:30.
    // Study guide takes precedence per Stof's instruction — using 08:00.
    // Duration not stated in either source; verify final end time nearer the exam.
    { date: '2026-11-11', event: 'COS 284 Exam (Paper 1) — PRELIM', type: 'exam', module: 'cos-284', day: 'Wednesday', time: '08:00 (end time TBC — portal shows 07:30 start)', venue: 'Hatfield' },
    { date: '2026-11-21', event: 'COS 330 Exam (Paper 1) — PRELIM', type: 'exam', module: 'cos-330', day: 'Saturday', time: '15:00 – 18:00', venue: 'Hatfield' },
    { date: '2026-11-09', event: 'WTW 224 Exam (Paper 1) — PRELIM', type: 'exam', module: 'wtw-224', day: 'Monday', time: '07:30 (PRELIM, from portal — no study guide on file to cross-check)', venue: 'Hatfield' },
];

// ── Month name constants ──
const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
