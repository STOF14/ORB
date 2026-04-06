/* ============================================================
   Orb — Calendar Logic
   All semester events, week strip, month grid, agenda view
   ============================================================ */

// ── Module colour map ──
const MOD_COLORS = {
    'phy-255': 'var(--red)',
    'wtw-211': 'var(--orange)',
    'wtw-218': 'var(--yellow)',
    'cos-210': 'var(--blue)',
    'cos-212': 'var(--dark-blue)',
    'university': '#888'
};

// CRITICAL_DATES loaded from shared-dates.js

// ── UNIVERSITY DATES (from UP Academic Calendar 2026) ──
const UNIVERSITY_DATES = [
    { date: '2026-01-05', event: 'Start of Academic Year', type: 'university' },
    { date: '2026-02-02', event: 'Orientation Week Begins', type: 'university' },
    { date: '2026-02-06', event: 'Orientation Ends', type: 'university' },
    { date: '2026-02-09', event: 'Lectures Begin (S1)', type: 'university' },
    { date: '2026-02-20', event: 'Last Day of Registration (S1)', type: 'university' },
    { date: '2026-02-21', event: 'RAG of Hope Day', type: 'university' },
    { date: '2026-03-09', event: 'Last Day to Cancel/Swap Modules', type: 'university' },
    { date: '2026-03-14', event: 'Test Week 1 Begins', type: 'university' },
    { date: '2026-03-21', event: 'Human Rights Day (Public Holiday)', type: 'university' },
    { date: '2026-03-27', event: 'Q1 Lectures End', type: 'university' },
    { date: '2026-03-29', event: 'March/April Recess Begins', type: 'recess' },
    { date: '2026-04-03', event: 'Good Friday (Public Holiday)', type: 'university' },
    { date: '2026-04-06', event: 'Family Day (Public Holiday) / Recess Ends', type: 'university' },
    { date: '2026-04-07', event: 'Q2 Lectures Begin (Monday TT)', type: 'university' },
    { date: '2026-04-08', event: 'Friday Timetable Followed', type: 'university' },
    { date: '2026-04-11', event: 'Test Week 1 Continues', type: 'university' },
    { date: '2026-04-27', event: 'Freedom Day (Public Holiday)', type: 'university' },
    { date: '2026-05-01', event: "Workers' Day (Public Holiday)", type: 'university' },
    { date: '2026-05-02', event: 'Test Week 2 Begins', type: 'university' },
    { date: '2026-05-27', event: 'Lectures End (Q2 & S1)', type: 'university' },
    { date: '2026-05-28', event: 'Pre-Exam Study Period', type: 'university' },
    { date: '2026-05-29', event: 'Pre-Exam Study Period', type: 'university' },
    { date: '2026-05-30', event: 'Exam Period Begins', type: 'university' },
    { date: '2026-06-16', event: 'Youth Day (Public Holiday)', type: 'university' },
    { date: '2026-06-18', event: 'Exam Period Ends', type: 'university' },
    { date: '2026-06-22', event: 'Supplementary Exams Begin', type: 'university' },
    { date: '2026-06-27', event: 'Supplementary Exams End', type: 'university' },
    { date: '2026-06-28', event: 'July Recess Begins', type: 'recess' },
];

// ── RECESS / NON-LECTURE PERIODS ──
const RECESS_RANGES = [
    { start: '2026-03-29', end: '2026-04-06', label: 'March/April Recess' },
    { start: '2026-05-28', end: '2026-05-29', label: 'Study Period' },
    { start: '2026-06-28', end: '2026-07-19', label: 'July Recess' },
];

const TEST_WEEK_RANGES = [
    { start: '2026-03-14', end: '2026-03-20', label: 'Test Week 1' },
    { start: '2026-03-28', end: '2026-03-28', label: 'Test Week 1 (cont.)' },
    { start: '2026-04-11', end: '2026-04-11', label: 'Test Week 1 (cont.)' },
    { start: '2026-05-02', end: '2026-05-09', label: 'Test Week 2' },
    { start: '2026-05-16', end: '2026-05-16', label: 'Test Week 2 (cont.)' },
];

const EXAM_RANGE = { start: '2026-05-30', end: '2026-06-18' };

// ── MODULE WEEKLY SCHEDULES (from semester schedule PDFs) ──

// COS 212 — Data Structures & Algorithms
const COS212_EVENTS = [
    // Week 1
    { date: '2026-02-09', event: 'COS 212: L1 Introduction', type: 'lecture', module: 'cos-212' },
    { date: '2026-02-11', event: 'COS 212: L2 Recursion', type: 'lecture', module: 'cos-212' },
    { date: '2026-02-12', event: 'COS 212: L3 Big-Oh Complexity', type: 'lecture', module: 'cos-212' },
    // Week 2
    { date: '2026-02-16', event: 'COS 212: L1 Binary Trees', type: 'lecture', module: 'cos-212' },
    { date: '2026-02-16', event: 'COS 212: Assignment 1 Released', type: 'assignment', module: 'cos-212' },
    { date: '2026-02-18', event: 'COS 212: L2 BST', type: 'lecture', module: 'cos-212' },
    { date: '2026-02-19', event: 'COS 212: L3 AVL Trees', type: 'lecture', module: 'cos-212' },
    // Week 3
    { date: '2026-02-23', event: 'COS 212: L1 AVL Deletion, Splay', type: 'lecture', module: 'cos-212' },
    { date: '2026-02-25', event: 'COS 212: L2 B-Trees Insertion', type: 'lecture', module: 'cos-212' },
    { date: '2026-02-26', event: 'COS 212: L3 B-Trees Deletion', type: 'lecture', module: 'cos-212' },
    { date: '2026-02-23', event: 'COS 212: Practical 1', type: 'assignment', module: 'cos-212' },
    // Week 4
    { date: '2026-03-02', event: 'COS 212: L1 Top-down Splay', type: 'lecture', module: 'cos-212' },
    { date: '2026-03-04', event: 'COS 212: L2 Red-Black Insert', type: 'lecture', module: 'cos-212' },
    { date: '2026-03-05', event: 'COS 212: L3 Red-Black Delete', type: 'lecture', module: 'cos-212' },
    // Week 5
    { date: '2026-03-09', event: 'COS 212: L1 Hashing', type: 'lecture', module: 'cos-212' },
    { date: '2026-03-11', event: 'COS 212: L2 Collision Resolution', type: 'lecture', module: 'cos-212' },
    { date: '2026-03-12', event: 'COS 212: L3 Rehashing, Perfect', type: 'lecture', module: 'cos-212' },
    { date: '2026-03-13', event: 'COS 212: Assignment 1 Due', type: 'assignment', module: 'cos-212' },
    { date: '2026-03-09', event: 'COS 212: Practical 2', type: 'assignment', module: 'cos-212' },
    // Week 7
    { date: '2026-03-23', event: 'COS 212: L1 Binary Heaps', type: 'lecture', module: 'cos-212' },
    { date: '2026-03-25', event: 'COS 212: L2 Leftist/Skew Heaps', type: 'lecture', module: 'cos-212' },
    { date: '2026-03-26', event: 'COS 212: L3 Treaps', type: 'lecture', module: 'cos-212' },
    { date: '2026-03-23', event: 'COS 212: Practical 3', type: 'assignment', module: 'cos-212' },
    // Week 9 (after recess)
    { date: '2026-04-07', event: 'COS 212: L1 Insertion Sort', type: 'lecture', module: 'cos-212' },
    { date: '2026-04-08', event: 'COS 212: L2 Shell/Heap Sort', type: 'lecture', module: 'cos-212' },
    { date: '2026-04-07', event: 'COS 212: Assignment 2 Released', type: 'assignment', module: 'cos-212' },
    // Week 10
    { date: '2026-04-13', event: 'COS 212: L1 Quicksort, Mergesort', type: 'lecture', module: 'cos-212' },
    { date: '2026-04-15', event: 'COS 212: L2 Bucket/Radix Sort', type: 'lecture', module: 'cos-212' },
    { date: '2026-04-16', event: 'COS 212: L3 External Sorting', type: 'lecture', module: 'cos-212' },
    // Week 11
    { date: '2026-04-20', event: 'COS 212: L1 Graph Basics', type: 'lecture', module: 'cos-212' },
    { date: '2026-04-22', event: 'COS 212: L2 Topological Sort', type: 'lecture', module: 'cos-212' },
    { date: '2026-04-23', event: 'COS 212: L3 Shortest Path (Unw)', type: 'lecture', module: 'cos-212' },
    { date: '2026-04-20', event: 'COS 212: Practical 4', type: 'assignment', module: 'cos-212' },
    // Week 12
    { date: '2026-04-28', event: 'COS 212: L1 Weighted Shortest Path', type: 'lecture', module: 'cos-212' },
    { date: '2026-04-29', event: 'COS 212: L2 Union-Find', type: 'lecture', module: 'cos-212' },
    { date: '2026-05-01', event: 'COS 212: Assignment 2 Due', type: 'assignment', module: 'cos-212' },
    // Week 14
    { date: '2026-05-11', event: 'COS 212: L1 MST', type: 'lecture', module: 'cos-212' },
    { date: '2026-05-13', event: 'COS 212: L2 DFS, Biconnected', type: 'lecture', module: 'cos-212' },
    { date: '2026-05-14', event: 'COS 212: L3 Strong Components', type: 'lecture', module: 'cos-212' },
    { date: '2026-05-11', event: 'COS 212: Assignment 3 Released', type: 'assignment', module: 'cos-212' },
    // Week 15
    { date: '2026-05-18', event: 'COS 212: L1 Huffman Codes', type: 'lecture', module: 'cos-212' },
    { date: '2026-05-20', event: 'COS 212: L2 Dynamic Programming', type: 'lecture', module: 'cos-212' },
    { date: '2026-05-21', event: 'COS 212: L3 Skip Lists', type: 'lecture', module: 'cos-212' },
    { date: '2026-05-18', event: 'COS 212: Practical 5', type: 'assignment', module: 'cos-212' },
    { date: '2026-05-25', event: 'COS 212: Assignment 3 Due', type: 'assignment', module: 'cos-212' },
];

// COS 210 — Theoretical Computer Science
const COS210_EVENTS = [
    { date: '2026-02-09', event: 'COS 210: L1 Preliminaries', type: 'lecture', module: 'cos-210' },
    { date: '2026-02-11', event: 'COS 210: L2 Proofs 1', type: 'lecture', module: 'cos-210' },
    { date: '2026-02-13', event: 'COS 210: T1 Proofs', type: 'lecture', module: 'cos-210' },
    { date: '2026-02-16', event: 'COS 210: L3 Proofs 2', type: 'lecture', module: 'cos-210' },
    { date: '2026-02-18', event: 'COS 210: L4 DFA', type: 'lecture', module: 'cos-210' },
    { date: '2026-02-18', event: 'COS 210: Worksheet 1 Released', type: 'assignment', module: 'cos-210' },
    { date: '2026-02-20', event: 'COS 210: T2 DFA', type: 'lecture', module: 'cos-210' },
    { date: '2026-02-23', event: 'COS 210: L5 Regular Operations', type: 'lecture', module: 'cos-210' },
    { date: '2026-02-25', event: 'COS 210: L6 NFA', type: 'lecture', module: 'cos-210' },
    { date: '2026-02-25', event: 'COS 210: Worksheet 2 Released', type: 'assignment', module: 'cos-210' },
    { date: '2026-02-27', event: 'COS 210: Class Test 1', type: 'test', module: 'cos-210' },
    { date: '2026-03-02', event: 'COS 210: L7 Equiv. DFA NFA', type: 'lecture', module: 'cos-210' },
    { date: '2026-03-04', event: 'COS 210: L8 Closure Properties', type: 'lecture', module: 'cos-210' },
    { date: '2026-03-04', event: 'COS 210: Worksheet 3 Released', type: 'assignment', module: 'cos-210' },
    { date: '2026-03-06', event: 'COS 210: T3 DFA & NFA', type: 'lecture', module: 'cos-210' },
    { date: '2026-03-09', event: 'COS 210: L9 Regular Expressions', type: 'lecture', module: 'cos-210' },
    { date: '2026-03-11', event: 'COS 210: L10 Equiv. Regex FA', type: 'lecture', module: 'cos-210' },
    { date: '2026-03-11', event: 'COS 210: Worksheet 4 Released', type: 'assignment', module: 'cos-210' },
    { date: '2026-03-13', event: 'COS 210: T4 Regular Expressions', type: 'lecture', module: 'cos-210' },
    { date: '2026-03-23', event: 'COS 210: L11 Pumping Lemma', type: 'lecture', module: 'cos-210' },
    { date: '2026-03-25', event: 'COS 210: L12 Pumping Lemma (cont)', type: 'lecture', module: 'cos-210' },
    { date: '2026-03-25', event: 'COS 210: Worksheet 5 Released', type: 'assignment', module: 'cos-210' },
    { date: '2026-03-27', event: 'COS 210: T5 Pumping Lemma', type: 'lecture', module: 'cos-210' },
    { date: '2026-04-07', event: 'COS 210: L13 Context-Free Grammars', type: 'lecture', module: 'cos-210' },
    { date: '2026-04-08', event: 'COS 210: Worksheet 6 Released', type: 'assignment', module: 'cos-210' },
    { date: '2026-04-13', event: 'COS 210: L14 Regular → CF', type: 'lecture', module: 'cos-210' },
    { date: '2026-04-15', event: 'COS 210: L15 Chomsky Normal Form', type: 'lecture', module: 'cos-210' },
    { date: '2026-04-15', event: 'COS 210: Worksheet 7 Released', type: 'assignment', module: 'cos-210' },
    { date: '2026-04-17', event: 'COS 210: T6 CFG & Chomsky', type: 'lecture', module: 'cos-210' },
    { date: '2026-04-20', event: 'COS 210: L16 Pushdown Automata', type: 'lecture', module: 'cos-210' },
    { date: '2026-04-22', event: 'COS 210: L17 PDA (cont)', type: 'lecture', module: 'cos-210' },
    { date: '2026-04-22', event: 'COS 210: Worksheet 8 Released', type: 'assignment', module: 'cos-210' },
    { date: '2026-04-29', event: 'COS 210: L18 Equiv. PDA Grammar', type: 'lecture', module: 'cos-210' },
    { date: '2026-04-29', event: 'COS 210: Worksheet 9 Released', type: 'assignment', module: 'cos-210' },
    { date: '2026-05-11', event: 'COS 210: L19 Turing Machines', type: 'lecture', module: 'cos-210' },
    { date: '2026-05-13', event: 'COS 210: L20 Multi-Tape TM', type: 'lecture', module: 'cos-210' },
    { date: '2026-05-13', event: 'COS 210: Worksheet 10 Released', type: 'assignment', module: 'cos-210' },
    { date: '2026-05-15', event: 'COS 210: T7 PDA & Turing', type: 'lecture', module: 'cos-210' },
    { date: '2026-05-18', event: 'COS 210: L21 Multi-Tape TM (cont)', type: 'lecture', module: 'cos-210' },
    { date: '2026-05-20', event: 'COS 210: L22 Decidability', type: 'lecture', module: 'cos-210' },
    { date: '2026-05-22', event: 'COS 210: T8 Decidability', type: 'lecture', module: 'cos-210' },
    { date: '2026-05-22', event: 'COS 210: Sick Test', type: 'test', module: 'cos-210' },
    { date: '2026-05-25', event: 'COS 210: L23 Decidability, Countability', type: 'lecture', module: 'cos-210' },
    { date: '2026-05-27', event: 'COS 210: L24 Rice, Enumerability', type: 'lecture', module: 'cos-210' },
];

// WTW 218 — Calculus
const WTW218_EVENTS = [
    { date: '2026-02-09', event: 'WTW 218: §1.1–1.3, §2.1', type: 'lecture', module: 'wtw-218' },
    { date: '2026-02-16', event: 'WTW 218: §2.2–2.4', type: 'lecture', module: 'wtw-218' },
    { date: '2026-02-16', event: 'WTW 218: Tutorial Test 1', type: 'test', module: 'wtw-218' },
    { date: '2026-02-23', event: 'WTW 218: §3.1, 3.2', type: 'lecture', module: 'wtw-218' },
    { date: '2026-02-23', event: 'WTW 218: HW1 (Ch. 2)', type: 'assignment', module: 'wtw-218' },
    { date: '2026-03-02', event: 'WTW 218: §3.2–3.4', type: 'lecture', module: 'wtw-218' },
    { date: '2026-03-02', event: 'WTW 218: HW1 Due', type: 'assignment', module: 'wtw-218' },
    { date: '2026-03-02', event: 'WTW 218: Tutorial Test 2', type: 'test', module: 'wtw-218' },
    { date: '2026-03-09', event: 'WTW 218: §3.4, 3.5', type: 'lecture', module: 'wtw-218' },
    { date: '2026-03-13', event: 'WTW 218: HW2 Due', type: 'assignment', module: 'wtw-218' },
    { date: '2026-03-23', event: 'WTW 218: §3.6', type: 'lecture', module: 'wtw-218' },
    { date: '2026-03-27', event: 'WTW 218: HW3 Due', type: 'assignment', module: 'wtw-218' },
    { date: '2026-04-07', event: 'WTW 218: §4.1, 4.2', type: 'lecture', module: 'wtw-218' },
    { date: '2026-04-13', event: 'WTW 218: HW4 Due', type: 'assignment', module: 'wtw-218' },
    { date: '2026-04-13', event: 'WTW 218: §4.3, §5.1', type: 'lecture', module: 'wtw-218' },
    { date: '2026-04-13', event: 'WTW 218: Tutorial Test 3', type: 'test', module: 'wtw-218' },
    { date: '2026-04-20', event: 'WTW 218: §5.2, 5.3', type: 'lecture', module: 'wtw-218' },
    { date: '2026-04-24', event: 'WTW 218: HW5 Due', type: 'assignment', module: 'wtw-218' },
    { date: '2026-04-30', event: 'WTW 218: HW6 Due', type: 'assignment', module: 'wtw-218' },
    { date: '2026-04-28', event: 'WTW 218: §5.4', type: 'lecture', module: 'wtw-218' },
    { date: '2026-05-11', event: 'WTW 218: §5.4, §6.1, 6.2', type: 'lecture', module: 'wtw-218' },
    { date: '2026-05-18', event: 'WTW 218: HW7 Due', type: 'assignment', module: 'wtw-218' },
    { date: '2026-05-18', event: 'WTW 218: §6.3', type: 'lecture', module: 'wtw-218' },
    { date: '2026-05-18', event: 'WTW 218: Tutorial Test 4', type: 'test', module: 'wtw-218' },
    { date: '2026-05-27', event: 'WTW 218: HW8 Due / Final Lecture', type: 'assignment', module: 'wtw-218' },
];

// WTW 211 — Linear Algebra
const WTW211_EVENTS = [
    { date: '2026-02-09', event: 'WTW 211: Ch 1', type: 'lecture', module: 'wtw-211' },
    { date: '2026-02-09', event: 'WTW 211: Online Test 1', type: 'test', module: 'wtw-211' },
    { date: '2026-02-16', event: 'WTW 211: Ch 1–2', type: 'lecture', module: 'wtw-211' },
    { date: '2026-02-16', event: 'WTW 211: Assignment 1', type: 'assignment', module: 'wtw-211' },
    { date: '2026-02-23', event: 'WTW 211: Ch 3', type: 'lecture', module: 'wtw-211' },
    { date: '2026-02-23', event: 'WTW 211: Assignment 2', type: 'assignment', module: 'wtw-211' },
    { date: '2026-03-02', event: 'WTW 211: Ch 3 (cont)', type: 'lecture', module: 'wtw-211' },
    { date: '2026-03-02', event: 'WTW 211: Tutorial Test 1', type: 'test', module: 'wtw-211' },
    { date: '2026-03-09', event: 'WTW 211: Ch 3 (cont)', type: 'lecture', module: 'wtw-211' },
    { date: '2026-03-09', event: 'WTW 211: Online Test 2', type: 'test', module: 'wtw-211' },
    { date: '2026-03-23', event: 'WTW 211: Ch 3 (cont)', type: 'lecture', module: 'wtw-211' },
    { date: '2026-03-23', event: 'WTW 211: Assignment 3', type: 'assignment', module: 'wtw-211' },
    { date: '2026-04-07', event: 'WTW 211: Ch 4', type: 'lecture', module: 'wtw-211' },
    { date: '2026-04-07', event: 'WTW 211: Online Test 3', type: 'test', module: 'wtw-211' },
    { date: '2026-04-13', event: 'WTW 211: Ch 4 (cont)', type: 'lecture', module: 'wtw-211' },
    { date: '2026-04-13', event: 'WTW 211: Assignment 4', type: 'assignment', module: 'wtw-211' },
    { date: '2026-04-20', event: 'WTW 211: Ch 4–5', type: 'lecture', module: 'wtw-211' },
    { date: '2026-04-20', event: 'WTW 211: Tutorial Test 2', type: 'test', module: 'wtw-211' },
    { date: '2026-04-27', event: 'WTW 211: Ch 5', type: 'lecture', module: 'wtw-211' },
    { date: '2026-04-27', event: 'WTW 211: Online Test 4', type: 'test', module: 'wtw-211' },
    { date: '2026-05-11', event: 'WTW 211: Ch 5 (cont)', type: 'lecture', module: 'wtw-211' },
    { date: '2026-05-11', event: 'WTW 211: Assignment 5', type: 'assignment', module: 'wtw-211' },
    { date: '2026-05-18', event: 'WTW 211: Ch 5–6', type: 'lecture', module: 'wtw-211' },
    { date: '2026-05-18', event: 'WTW 211: Tutorial Test 3', type: 'test', module: 'wtw-211' },
    { date: '2026-05-25', event: 'WTW 211: Ch 6', type: 'lecture', module: 'wtw-211' },
];

// PHY 255 — Physics
const PHY255_EVENTS = [
    // February
    { date: '2026-02-09', event: 'PHY 255: L1 Thermodynamics', type: 'lecture', module: 'phy-255' },
    { date: '2026-02-10', event: 'PHY 255: Practical 1', type: 'assignment', module: 'phy-255' },
    { date: '2026-02-11', event: 'PHY 255: Tutorial 1 (Thermo)', type: 'lecture', module: 'phy-255' },
    { date: '2026-02-11', event: 'PHY 255: L2 Thermodynamics', type: 'lecture', module: 'phy-255' },
    { date: '2026-02-12', event: 'PHY 255: L3–L4 Thermodynamics', type: 'lecture', module: 'phy-255' },
    { date: '2026-02-16', event: 'PHY 255: L5 Thermodynamics', type: 'lecture', module: 'phy-255' },
    { date: '2026-02-17', event: 'PHY 255: Practical 2', type: 'assignment', module: 'phy-255' },
    { date: '2026-02-18', event: 'PHY 255: Tutorial 2 (Thermo)', type: 'lecture', module: 'phy-255' },
    { date: '2026-02-18', event: 'PHY 255: L6 Thermodynamics', type: 'lecture', module: 'phy-255' },
    { date: '2026-02-19', event: 'PHY 255: L7–L8 Thermodynamics', type: 'lecture', module: 'phy-255' },
    { date: '2026-02-23', event: 'PHY 255: L9 Thermodynamics', type: 'lecture', module: 'phy-255' },
    { date: '2026-02-24', event: 'PHY 255: Practical 3', type: 'assignment', module: 'phy-255' },
    { date: '2026-02-25', event: 'PHY 255: Tutorial 3 (Thermo)', type: 'lecture', module: 'phy-255' },
    { date: '2026-02-25', event: 'PHY 255: L10 Thermodynamics', type: 'lecture', module: 'phy-255' },
    { date: '2026-02-26', event: 'PHY 255: L11–L12 Thermodynamics', type: 'lecture', module: 'phy-255' },
    // March
    { date: '2026-03-02', event: 'PHY 255: L13 Thermodynamics', type: 'lecture', module: 'phy-255' },
    { date: '2026-03-03', event: 'PHY 255: Practical 4', type: 'assignment', module: 'phy-255' },
    { date: '2026-03-04', event: 'PHY 255: Tutorial 4 (Thermo)', type: 'lecture', module: 'phy-255' },
    { date: '2026-03-04', event: 'PHY 255: L14 Thermodynamics', type: 'lecture', module: 'phy-255' },
    { date: '2026-03-05', event: 'PHY 255: L15–L16 Modern Physics', type: 'lecture', module: 'phy-255' },
    { date: '2026-03-09', event: 'PHY 255: L17 Modern Physics', type: 'lecture', module: 'phy-255' },
    { date: '2026-03-10', event: 'PHY 255: Practical 5', type: 'assignment', module: 'phy-255' },
    { date: '2026-03-11', event: 'PHY 255: L18 MP + Tut 5', type: 'lecture', module: 'phy-255' },
    { date: '2026-03-12', event: 'PHY 255: L19–L20 Modern Physics', type: 'lecture', module: 'phy-255' },
    { date: '2026-03-23', event: 'PHY 255: L21 Modern Physics', type: 'lecture', module: 'phy-255' },
    { date: '2026-03-24', event: 'PHY 255: Practical 6', type: 'assignment', module: 'phy-255' },
    { date: '2026-03-25', event: 'PHY 255: L22 MP + Tut 6', type: 'lecture', module: 'phy-255' },
    { date: '2026-03-26', event: 'PHY 255: L23–L24 Modern Physics', type: 'lecture', module: 'phy-255' },
    // April
    { date: '2026-04-07', event: 'PHY 255: L25 Modern Physics', type: 'lecture', module: 'phy-255' },
    { date: '2026-04-07', event: 'PHY 255: Practical 7', type: 'assignment', module: 'phy-255' },
    { date: '2026-04-08', event: 'PHY 255: L26 Modern Physics', type: 'lecture', module: 'phy-255' },
    { date: '2026-04-09', event: 'PHY 255: L27–L28 Modern Physics', type: 'lecture', module: 'phy-255' },
    { date: '2026-04-13', event: 'PHY 255: L29 Modern Physics', type: 'lecture', module: 'phy-255' },
    { date: '2026-04-14', event: 'PHY 255: Practical 8', type: 'assignment', module: 'phy-255' },
    { date: '2026-04-15', event: 'PHY 255: L30 MP + Tut 7', type: 'lecture', module: 'phy-255' },
    { date: '2026-04-16', event: 'PHY 255: L31–L32 Modern Physics', type: 'lecture', module: 'phy-255' },
    { date: '2026-04-20', event: 'PHY 255: L33 Modern Physics', type: 'lecture', module: 'phy-255' },
    { date: '2026-04-21', event: 'PHY 255: Practical 9', type: 'assignment', module: 'phy-255' },
    { date: '2026-04-22', event: 'PHY 255: L34–L35 Modern Physics', type: 'lecture', module: 'phy-255' },
    { date: '2026-04-23', event: 'PHY 255: L36 Modern Physics', type: 'lecture', module: 'phy-255' },
    { date: '2026-04-28', event: 'PHY 255: L37 MP + Tut 9', type: 'lecture', module: 'phy-255' },
    // May
    { date: '2026-05-04', event: 'PHY 255: L39 Modern Physics', type: 'lecture', module: 'phy-255' },
    { date: '2026-05-05', event: 'PHY 255: Practical 10', type: 'assignment', module: 'phy-255' },
    { date: '2026-05-06', event: 'PHY 255: L40 MP + Tut 10', type: 'lecture', module: 'phy-255' },
    { date: '2026-05-07', event: 'PHY 255: L41–L42 Modern Physics', type: 'lecture', module: 'phy-255' },
    { date: '2026-05-11', event: 'PHY 255: L43 Modern Physics', type: 'lecture', module: 'phy-255' },
    { date: '2026-05-12', event: 'PHY 255: Practical 11', type: 'assignment', module: 'phy-255' },
    { date: '2026-05-13', event: 'PHY 255: L44 MP + Tut 11', type: 'lecture', module: 'phy-255' },
    { date: '2026-05-14', event: 'PHY 255: L45–L46 Modern Physics', type: 'lecture', module: 'phy-255' },
    { date: '2026-05-18', event: 'PHY 255: L47 Modern Physics', type: 'lecture', module: 'phy-255' },
    { date: '2026-05-19', event: 'PHY 255: Practical 12', type: 'assignment', module: 'phy-255' },
    { date: '2026-05-20', event: 'PHY 255: L48 MP + Tut 12', type: 'lecture', module: 'phy-255' },
];

// ── Merge all events ──
const ALL_EVENTS = [
    ...CRITICAL_DATES,
    ...UNIVERSITY_DATES,
    ...COS212_EVENTS,
    ...COS210_EVENTS,
    ...WTW218_EVENTS,
    ...WTW211_EVENTS,
    ...PHY255_EVENTS,
];

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
    let events = ALL_EVENTS.filter(e => e.date === dateStr);
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

    if (events.length === 0) {
        // Check if recess
        const inRecess = RECESS_RANGES.some(r => isInRange(ds, r.start, r.end));
        if (inRecess) {
            content.innerHTML = '<div class="day-event day-event--recess"><div class="day-event__info"><div class="day-event__title">Recess — No lectures</div></div></div>';
        } else {
            content.innerHTML = '<div style="color: var(--text-muted); font-size: 13px; padding: 8px 0;">No events scheduled</div>';
        }
    } else {
        content.innerHTML = events.map(e => {
            const cls = e.type === 'test' ? 'day-event--test' :
                        e.type === 'exam' ? 'day-event--exam' :
                        e.type === 'university' || e.type === 'recess' ? 'day-event--university' :
                        e.type === 'assignment' ? 'day-event--assignment' : '';
            const badge = e.module ? e.module.replace('-', ' ').toUpperCase() : e.type.toUpperCase();
            const meta = [e.time, e.venue].filter(Boolean).join(' • ');
            return `
                <div class="day-event ${cls}">
                    <div class="day-event__badge">${badge}</div>
                    <div class="day-event__info">
                        <div class="day-event__title">${e.event}</div>
                        ${meta ? `<div class="day-event__meta">${meta}</div>` : ''}
                    </div>
                </div>`;
        }).join('');
    }

    panel.classList.add('open');
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
    let agendaEvents = ALL_EVENTS.filter(e =>
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

// ── Init ──
document.addEventListener('DOMContentLoaded', () => {
    // Auto-select today
    selectedDate = new Date();
    selectedDate.setHours(0, 0, 0, 0);

    initFilters();
    initNavigation();
    renderAll();
});
