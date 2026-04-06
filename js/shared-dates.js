/* ============================================================
   Orb — Shared Critical Dates
   Single source of truth for tests & exams across all pages
   ============================================================ */

const CRITICAL_DATES = [
    // ── Semester Tests ──
    { date: '2026-03-16', event: 'WTW 218 Semester Test 1', type: 'test', module: 'wtw-218', day: 'Monday',    time: '07:30 – 09:00', venue: 'Louw Hall / Roos Hall' },
    { date: '2026-03-17', event: 'WTW 211 Semester Test 1', type: 'test', module: 'wtw-211', day: 'Tuesday',   time: '12:30 – 14:00', venue: 'AE Annex / AE du Toit Auditorium' },
    { date: '2026-03-18', event: 'COS 210 Semester Test 1', type: 'test', module: 'cos-210', day: 'Wednesday', time: '07:30 – 09:00', venue: 'Informatorium Labs' },
    { date: '2026-03-19', event: 'PHY 255 Thermo ST + Modern CT1', type: 'test', module: 'phy-255', day: 'Thursday',  time: '15:00 – 18:00', venue: 'HB 4-8' },
    { date: '2026-03-28', event: 'COS 212 Exam Opportunity 1', type: 'test', module: 'cos-212', day: 'Saturday',  time: '10:00 – 11:30', venue: 'Centenary 4 / 5 / 6' },
    { date: '2026-04-08', event: 'COS 210 Class Test 2', type: 'test', module: 'cos-210', day: 'Wednesday', time: 'Friday TT', venue: 'Informatorium' },
    { date: '2026-04-11', event: 'PHY 255 CT2 (MP)', type: 'test', module: 'phy-255', day: 'Saturday', time: '12:30 – 13:20', venue: 'TBA' },
    { date: '2026-04-16', event: 'PHY 255 CT3 (MP)', type: 'test', module: 'phy-255', day: 'Thursday', time: '12:30 – 13:20', venue: 'TBA' },
    { date: '2026-04-21', event: 'PHY 255 Modern Physics ST1', type: 'test', module: 'phy-255', day: 'Tuesday',  time: '14:30 – 17:30', venue: 'NS1 5-42 (Tutorial slot)' },
    { date: '2026-04-24', event: 'COS 210 Class Test 3', type: 'test', module: 'cos-210', day: 'Friday', time: 'Tutorial slot', venue: 'Informatorium' },
    { date: '2026-04-29', event: 'PHY 255 CT4 (MP)', type: 'test', module: 'phy-255', day: 'Wednesday', time: '12:30 – 13:20', venue: 'TBA' },
    { date: '2026-05-02', event: 'WTW 218 Semester Test 2', type: 'test', module: 'wtw-218', day: 'Saturday',  time: '07:30 – 09:00', venue: 'AE Annex / AE du Toit Auditorium' },
    { date: '2026-05-06', event: 'PHY 255 CT5 (MP)', type: 'test', module: 'phy-255', day: 'Wednesday', time: '12:30 – 13:20', venue: 'TBA' },
    { date: '2026-05-07', event: 'COS 212 Exam Opportunity 2', type: 'test', module: 'cos-212', day: 'Thursday',  time: '10:00 – 11:30', venue: 'Centenary 4 / 5 / 6' },
    { date: '2026-05-08', event: 'WTW 211 Semester Test 2', type: 'test', module: 'wtw-211', day: 'Friday',    time: '12:30 – 14:00', venue: 'AE Annex / AE du Toit Auditorium' },
    { date: '2026-05-13', event: 'PHY 255 CT6 (MP)', type: 'test', module: 'phy-255', day: 'Wednesday', time: '12:30 – 13:20', venue: 'TBA' },
    { date: '2026-05-16', event: 'COS 210 Semester Test 2', type: 'test', module: 'cos-210', day: 'Saturday',  time: '12:30 – 14:00', venue: 'Informatorium Labs' },
    { date: '2026-05-16', event: 'PHY 255 Semester Test 2', type: 'test', module: 'phy-255', day: 'Saturday',  time: '15:00 – 18:00', venue: 'Consult Department' },
    // ── Exams ──
    { date: '2026-06-01', event: 'WTW 211 Exam',            type: 'exam', module: 'wtw-211', day: 'Monday',    time: '15:00',          venue: 'TBA' },
    { date: '2026-06-03', event: 'PHY 255 Exam (Paper 1)',   type: 'exam', module: 'phy-255', day: 'Wednesday', time: '11:15',          venue: 'TBA' },
    { date: '2026-06-05', event: 'COS 210 Exam',             type: 'exam', module: 'cos-210', day: 'Friday',    time: '07:30',          venue: 'TBA' },
    { date: '2026-06-08', event: 'COS 212 Exam Opportunity 3', type: 'exam', module: 'cos-212', day: 'Monday',    time: '11:15',          venue: 'TBA' },
    { date: '2026-06-10', event: 'PHY 255 Exam (Paper 2)',   type: 'exam', module: 'phy-255', day: 'Wednesday', time: '07:30',          venue: 'TBA' },
    { date: '2026-06-13', event: 'WTW 218 Exam',             type: 'exam', module: 'wtw-218', day: 'Saturday',  time: '07:30',          venue: 'TBA' },
];

// ── Month name constants ──
const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
