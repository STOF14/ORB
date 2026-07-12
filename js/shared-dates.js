/* ============================================================
   Orb — Shared Critical Dates
   Single source of truth for tests & exams across all pages
   ============================================================ */

const CRITICAL_DATES = [
    // ── Semester Tests ──
    { date: '2026-08-22', event: 'COS 284 Test 1', type: 'test', module: 'cos-284', day: 'Saturday', time: '10:00 – 11:30', venue: 'Hatfield, Informatorium (Blue 1/2/3, Green, Purple, Red Lab)' },
    { date: '2026-08-28', event: 'COS 330 Test 1', type: 'test', module: 'cos-330', day: 'Friday', time: '10:00 – 11:30', venue: 'Hatfield, Informatorium (Blue 1/2/3, Red Lab)' },
    { date: '2026-10-12', event: 'COS 284 Test 2', type: 'test', module: 'cos-284', day: 'Monday', time: '10:00 – 11:30', venue: 'Hatfield, Informatorium (Blue 1/2/3, Green, Purple, Red Lab)' },
    // ── Exams (PRELIM) ──
    { date: '2026-11-11', event: 'COS 284 Exam (Paper 1) — PRELIM', type: 'exam', module: 'cos-284', day: 'Wednesday', time: '07:30 – 10:30', venue: 'Hatfield' },
    { date: '2026-11-21', event: 'COS 330 Exam (Paper 1) — PRELIM', type: 'exam', module: 'cos-330', day: 'Saturday', time: '15:00 – 18:00', venue: 'Hatfield' },
];

// ── Month name constants ──
const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
