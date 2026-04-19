(function () {
    var DAY_PLANS = [
        {
            date: '2026-04-22',
            label: 'Wednesday 22 Apr',
            note: 'PHY ST1 done yesterday; reset day.',
            sessions: [
                { time: '17:30', module: 'WTW 218', key: 'wtw-218', method: 'closed-book problems', type: 'study', task: 'Partial derivatives problem set from scratch (8-10).' },
                { time: '19:15', module: 'COS 212', key: 'cos-212', method: 'teach-it-back', type: 'study', task: 'Trees and heaps aloud as if teaching.' },
                { time: '20:15', module: 'COS 210', key: 'cos-210', method: 'closed-book problems', type: 'study', task: 'Build five DFA or NFA from memory.' },
                { time: '21:15', module: 'Meta', key: 'meta', method: 'sleep', type: 'meta', task: 'Lights out by 22:00.' }
            ]
        },
        {
            date: '2026-04-23',
            label: 'Thursday 23 Apr',
            note: 'Spaced review starts one day after first pass.',
            sessions: [
                { time: '08:30', module: 'Class', key: 'meta', method: 'class block', type: 'class', task: 'WTW 218, PHY tutorial, PHY lecture, COS 212.' },
                { time: '17:30', module: 'WTW 218', key: 'wtw-218', method: 'spaced review', type: 'study', task: 'Redo Wednesday errors without solutions.' },
                { time: '18:30', module: 'WTW 218', key: 'wtw-218', method: 'closed-book problems', type: 'study', task: 'Chain rule and implicit theorem set.' },
                { time: '19:45', module: 'WTW 211', key: 'wtw-211', method: 'teach-it-back', type: 'study', task: 'Inverse matrices and linear independence then six problems.' },
                { time: '21:00', module: 'COS 210', key: 'cos-210', method: 'spaced review', type: 'study', task: 'DFA review and five regular-language proofs.' },
                { time: '21:45', module: 'Meta', key: 'meta', method: 'sleep', type: 'meta', task: 'Lights out by 22:15.' }
            ]
        },
        {
            date: '2026-04-24',
            label: 'Friday 24 Apr',
            note: 'High retrieval, early shutdown.',
            sessions: [
                { time: '07:30', module: 'Class', key: 'meta', method: 'class block', type: 'class', task: 'WTW 211, PHY, COS 212 tutorial, COS 212 practical, COS 210 tutorial.' },
                { time: '17:30', module: 'WTW 218', key: 'wtw-218', method: 'closed-book problems', type: 'study', task: 'Gradient and directional derivatives, ten problems.' },
                { time: '19:00', module: 'COS 212', key: 'cos-212', method: 'flashcard recall', type: 'study', task: 'Hashing and graphs complexity recall.' },
                { time: '20:00', module: 'WTW 211', key: 'wtw-211', method: 'spaced review', type: 'study', task: 'Subspaces and dimension follow-up set.' },
                { time: '21:00', module: 'Meta', key: 'meta', method: 'sleep', type: 'meta', task: 'Lights out by 21:30.' }
            ]
        },
        {
            date: '2026-04-25',
            label: 'Saturday 25 Apr',
            note: 'Full active day with NSDR anchors.',
            sessions: [
                { time: '07:30', module: 'Meta', key: 'meta', method: 'nsdr', type: 'meta', task: '10 min NSDR before starting.' },
                { time: '08:00', module: 'WTW 218', key: 'wtw-218', method: 'closed-book problems', type: 'study', task: 'Optimization and second derivative test, ten problems.' },
                { time: '09:30', module: 'WTW 218', key: 'wtw-218', method: 'teach-it-back', type: 'study', task: 'Lagrange multipliers plus concept teaching.' },
                { time: '11:20', module: 'WTW 211', key: 'wtw-211', method: 'closed-book problems', type: 'study', task: 'Linear transformations set.' },
                { time: '13:10', module: 'Meta', key: 'meta', method: 'nsdr', type: 'meta', task: '10 to 15 min NSDR after lunch.' },
                { time: '13:30', module: 'COS 212', key: 'cos-212', method: 'closed-book problems', type: 'study', task: 'Merge sort and quicksort from memory.' },
                { time: '15:00', module: 'COS 210', key: 'cos-210', method: 'teach-it-back', type: 'study', task: 'CFG and PDA retrieval problems.' },
                { time: '16:15', module: 'WTW 218', key: 'wtw-218', method: 'spaced review', type: 'study', task: 'Redo all weekly misses.' },
                { time: '17:15', module: 'Meta', key: 'meta', method: 'off', type: 'meta', task: 'Full rest evening.' }
            ]
        },
        {
            date: '2026-04-26',
            label: 'Sunday 26 Apr',
            note: 'Church morning, focused afternoon.',
            sessions: [
                { time: 'Morning', module: 'Meta', key: 'meta', method: 'church', type: 'meta', task: 'Church, full mental off block.' },
                { time: '13:30', module: 'Meta', key: 'meta', method: 'nsdr', type: 'meta', task: '10 min NSDR before session.' },
                { time: '13:45', module: 'WTW 218', key: 'wtw-218', method: 'closed-book problems', type: 'study', task: 'Double and triple integrals set.' },
                { time: '15:15', module: 'WTW 211', key: 'wtw-211', method: 'closed-book problems', type: 'study', task: 'Eigenvalues and eigenvectors derive-first set.' },
                { time: '16:30', module: 'COS 212', key: 'cos-212', method: 'closed-book problems', type: 'study', task: 'BFS, DFS, Dijkstra hand tracing.' },
                { time: '17:30', module: 'Meta', key: 'meta', method: 'off', type: 'meta', task: 'Done and rest.' }
            ]
        },
        {
            date: '2026-04-27',
            label: 'Monday 27 Apr',
            note: '6 days to WTW 218 ST2.',
            sessions: [
                { time: '08:30', module: 'Class', key: 'meta', method: 'class block', type: 'class', task: 'PHY, COS 210, WTW 211, PHY practical, COS 212.' },
                { time: '17:30', module: 'WTW 218', key: 'wtw-218', method: 'closed-book problems', type: 'study', task: 'Polar and cylindrical coordinates, ten problems.' },
                { time: '19:00', module: 'WTW 211', key: 'wtw-211', method: 'spaced review', type: 'study', task: 'Eigenvalue mistakes plus diagonalisation intro.' },
                { time: '20:00', module: 'COS 210', key: 'cos-210', method: 'closed-book problems', type: 'study', task: 'Three Turing machines from memory.' },
                { time: '21:00', module: 'Meta', key: 'meta', method: 'sleep', type: 'meta', task: 'Lights out by 21:45.' }
            ]
        },
        {
            date: '2026-04-28',
            label: 'Tuesday 28 Apr',
            note: '5 days to WTW 218 ST2.',
            sessions: [
                { time: '08:30', module: 'Class', key: 'meta', method: 'class block', type: 'class', task: 'WTW 218, PHY, PHY tutorial.' },
                { time: '17:30', module: 'WTW 218', key: 'wtw-218', method: 'closed-book problems', type: 'study', task: 'Spherical coordinates and integration drill.' },
                { time: '19:15', module: 'COS 212', key: 'cos-212', method: 'closed-book problems', type: 'study', task: 'DP coding: Fibonacci, knapsack, LCS from memory.' },
                { time: '20:15', module: 'WTW 211', key: 'wtw-211', method: 'closed-book problems', type: 'study', task: 'Diagonalisation process retrieval.' },
                { time: '21:15', module: 'Meta', key: 'meta', method: 'sleep', type: 'meta', task: 'Lights out by 22:00.' }
            ]
        },
        {
            date: '2026-04-29',
            label: 'Wednesday 29 Apr',
            note: '4 days to WTW 218 ST2.',
            sessions: [
                { time: '08:30', module: 'Class', key: 'meta', method: 'class block', type: 'class', task: 'COS 210, COS 212, WTW 218 tutorial, WTW 211 tutorial.' },
                { time: '17:30', module: 'WTW 218', key: 'wtw-218', method: 'past paper', type: 'study', task: 'Timed full past paper, 90 minutes.' },
                { time: '19:00', module: 'WTW 218', key: 'wtw-218', method: 'past paper', type: 'study', task: 'Mark and variation of each wrong answer.' },
                { time: '20:15', module: 'COS 210', key: 'cos-210', method: 'closed-book problems', type: 'study', task: 'Decidability proofs from scratch.' },
                { time: '21:15', module: 'Meta', key: 'meta', method: 'sleep', type: 'meta', task: 'Lights out by 22:00.' }
            ]
        },
        {
            date: '2026-04-30',
            label: 'Thursday 30 Apr',
            note: '3 days to WTW 218 ST2.',
            sessions: [
                { time: '08:30', module: 'Class', key: 'meta', method: 'class block', type: 'class', task: 'WTW 218, PHY tutorial, PHY lecture, COS 212.' },
                { time: '17:30', module: 'WTW 218', key: 'wtw-218', method: 'closed-book problems', type: 'study', task: 'Weakness-only targeting from timed paper.' },
                { time: '19:00', module: 'WTW 211', key: 'wtw-211', method: 'past paper', type: 'study', task: 'Similarity and diagonalisation paper questions.' },
                { time: '20:15', module: 'COS 212', key: 'cos-212', method: 'spaced review', type: 'study', task: 'EO2 flashcard sweep.' },
                { time: '21:15', module: 'Meta', key: 'meta', method: 'sleep', type: 'meta', task: 'Lights out by 22:00.' }
            ]
        },
        {
            date: '2026-05-01',
            label: 'Friday 1 May',
            note: '1 day to WTW 218 ST2.',
            sessions: [
                { time: '07:30', module: 'Class', key: 'meta', method: 'class block', type: 'class', task: 'Friday classes, attend as normal.' },
                { time: '17:30', module: 'WTW 218', key: 'wtw-218', method: 'flashcard recall', type: 'study', task: 'Formula and theorem write-out, 1 hour max.' },
                { time: '18:30', module: 'COS 212', key: 'cos-212', method: 'flashcard recall', type: 'study', task: 'Complexity table from memory.' },
                { time: '19:15', module: 'Meta', key: 'meta', method: 'sleep', type: 'meta', task: 'Shutdown and sleep by 21:00.' }
            ]
        },
        {
            date: '2026-05-02',
            label: 'Saturday 2 May',
            note: 'WTW 218 ST2 day.',
            sessions: [
                { time: '06:15', module: 'Meta', key: 'meta', method: 'prep', type: 'meta', task: 'Wake, eat, 5 minute formula glance.' },
                { time: '07:30', module: 'WTW 218', key: 'wtw-218', method: 'test day', type: 'test', task: 'WTW 218 Semester Test 2 at AE Annex.' },
                { time: '10:00', module: 'WTW 211', key: 'wtw-211', method: 'past paper', type: 'study', task: 'Full timed paper, exam conditions.' },
                { time: '11:30', module: 'WTW 211', key: 'wtw-211', method: 'past paper', type: 'study', task: 'Mark and redo every wrong answer.' },
                { time: '13:30', module: 'COS 212', key: 'cos-212', method: 'closed-book problems', type: 'study', task: 'EO2 timed algorithm tracing set.' },
                { time: '15:30', module: 'Meta', key: 'meta', method: 'off', type: 'meta', task: 'Afternoon recovery.' }
            ]
        },
        {
            date: '2026-05-03',
            label: 'Sunday 3 May',
            note: 'Church morning and final Sunday before EO2.',
            sessions: [
                { time: 'Morning', module: 'Meta', key: 'meta', method: 'church', type: 'meta', task: 'Church and full off block.' },
                { time: '13:30', module: 'COS 212', key: 'cos-212', method: 'teach-it-back', type: 'study', task: 'Teach every major algorithm family.' },
                { time: '15:00', module: 'WTW 211', key: 'wtw-211', method: 'spaced review', type: 'study', task: 'Saturday misses plus six new eigenvalue problems.' },
                { time: '16:30', module: 'COS 210', key: 'cos-210', method: 'teach-it-back', type: 'study', task: 'P vs NP and three reductions.' },
                { time: '17:30', module: 'Meta', key: 'meta', method: 'off', type: 'meta', task: 'Sleep well.' }
            ]
        },
        {
            date: '2026-05-04',
            label: 'Monday 4 May',
            note: '3 days to COS 212 EO2.',
            sessions: [
                { time: '08:30', module: 'Class', key: 'meta', method: 'class block', type: 'class', task: 'PHY, COS 210, WTW 211, PHY practical, COS 212.' },
                { time: '17:30', module: 'COS 212', key: 'cos-212', method: 'past paper', type: 'study', task: 'EO2 full timed paper.' },
                { time: '19:00', module: 'COS 212', key: 'cos-212', method: 'past paper', type: 'study', task: 'Mark and redo wrong answers.' },
                { time: '20:00', module: 'WTW 211', key: 'wtw-211', method: 'closed-book problems', type: 'study', task: 'Ten linear transformations and eigenvalue problems.' },
                { time: '21:15', module: 'Meta', key: 'meta', method: 'sleep', type: 'meta', task: 'Lights out by 22:00.' }
            ]
        },
        {
            date: '2026-05-05',
            label: 'Tuesday 5 May',
            note: '2 days to EO2, 3 days to WTW 211 ST2.',
            sessions: [
                { time: '08:30', module: 'Class', key: 'meta', method: 'class block', type: 'class', task: 'WTW 218, PHY, PHY tutorial.' },
                { time: '17:30', module: 'COS 212', key: 'cos-212', method: 'closed-book problems', type: 'study', task: 'Two variations per weak EO2 type.' },
                { time: '18:45', module: 'WTW 211', key: 'wtw-211', method: 'past paper', type: 'study', task: 'Second full timed past paper.' },
                { time: '20:15', module: 'WTW 211', key: 'wtw-211', method: 'past paper', type: 'study', task: 'Mark and redo.' },
                { time: '21:00', module: 'Meta', key: 'meta', method: 'sleep', type: 'meta', task: 'Lights out by 22:00.' }
            ]
        },
        {
            date: '2026-05-06',
            label: 'Wednesday 6 May',
            note: '1 day to EO2, 2 days to WTW 211 ST2.',
            sessions: [
                { time: '08:30', module: 'Class', key: 'meta', method: 'class block', type: 'class', task: 'COS 210, COS 212, WTW 218 tutorial, WTW 211 tutorial.' },
                { time: '17:30', module: 'COS 212', key: 'cos-212', method: 'flashcard recall', type: 'study', task: 'Complexity table and key algorithm steps.' },
                { time: '18:30', module: 'WTW 211', key: 'wtw-211', method: 'spaced review', type: 'study', task: 'Every wrong answer from both papers.' },
                { time: '19:45', module: 'COS 210', key: 'cos-210', method: 'closed-book problems', type: 'study', task: 'Three NP-completeness reductions from memory.' },
                { time: '21:00', module: 'Meta', key: 'meta', method: 'sleep', type: 'meta', task: 'Lights out by 21:30.' }
            ]
        },
        {
            date: '2026-05-07',
            label: 'Thursday 7 May',
            note: 'COS 212 EO2 day.',
            sessions: [
                { time: '08:00', module: 'COS 212', key: 'cos-212', method: 'prep', type: 'study', task: 'Tab notes and skim complexity table only.' },
                { time: '10:00', module: 'COS 212', key: 'cos-212', method: 'exam opportunity', type: 'exam', task: 'COS 212 EO2 at Centenary 4/5/6.' },
                { time: '11:30', module: 'WTW 211', key: 'wtw-211', method: 'teach-it-back', type: 'study', task: 'Teach major theorems aloud.' },
                { time: '13:00', module: 'WTW 211', key: 'wtw-211', method: 'flashcard recall', type: 'study', task: 'Formula write-out and four weak-spot drills.' },
                { time: '14:00', module: 'Meta', key: 'meta', method: 'rest', type: 'meta', task: 'Recover and sleep by 21:00.' }
            ]
        },
        {
            date: '2026-05-08',
            label: 'Friday 8 May',
            note: 'WTW 211 ST2 day.',
            sessions: [
                { time: '07:30', module: 'Class', key: 'meta', method: 'class block', type: 'class', task: 'WTW 211 and PHY lectures, no cramming.' },
                { time: '09:30', module: 'WTW 211', key: 'wtw-211', method: 'flashcard recall', type: 'study', task: 'Theorems and definitions recall.' },
                { time: '12:30', module: 'WTW 211', key: 'wtw-211', method: 'test day', type: 'test', task: 'WTW 211 Semester Test 2 at AE Annex.' },
                { time: '14:30', module: 'COS 210', key: 'cos-210', method: 'past paper', type: 'study', task: 'Start COS 210 ST2 prep with full timed paper.' },
                { time: '16:30', module: 'Meta', key: 'meta', method: 'off', type: 'meta', task: 'Done for the day.' }
            ]
        },
        {
            date: '2026-05-09',
            label: 'Saturday 9 May',
            note: '7 days to double test day.',
            sessions: [
                { time: '07:30', module: 'Meta', key: 'meta', method: 'nsdr', type: 'meta', task: '10 min NSDR before starting.' },
                { time: '08:00', module: 'PHY 255', key: 'phy-255', method: 'past paper', type: 'study', task: 'Modern Physics full timed paper.' },
                { time: '11:00', module: 'PHY 255', key: 'phy-255', method: 'past paper', type: 'study', task: 'Mark and immediate redo.' },
                { time: '13:15', module: 'COS 210', key: 'cos-210', method: 'past paper', type: 'study', task: 'Full timed COS 210 paper.' },
                { time: '15:00', module: 'COS 210', key: 'cos-210', method: 'past paper', type: 'study', task: 'Mark and redo all misses.' },
                { time: '16:30', module: 'Meta', key: 'meta', method: 'off', type: 'meta', task: 'Full rest evening.' }
            ]
        },
        {
            date: '2026-05-10',
            label: 'Sunday 10 May',
            note: 'Weakness elimination day.',
            sessions: [
                { time: 'Morning', module: 'Meta', key: 'meta', method: 'church', type: 'meta', task: 'Church morning off block.' },
                { time: '13:30', module: 'PHY 255', key: 'phy-255', method: 'spaced review', type: 'study', task: 'Target every PHY weak area with two variations.' },
                { time: '15:00', module: 'COS 210', key: 'cos-210', method: 'spaced review', type: 'study', task: 'Target every COS 210 weak area.' },
                { time: '16:30', module: 'Meta', key: 'meta', method: 'off', type: 'meta', task: 'Done by 16:30.' }
            ]
        },
        {
            date: '2026-05-11',
            label: 'Monday 11 May',
            note: 'Final push begins: five days out.',
            sessions: [
                { time: 'Evening', module: 'PHY 255', key: 'phy-255', method: 'closed-book problems', type: 'study', task: 'Relativity topic block plus teach-it-back.' },
                { time: 'Evening', module: 'COS 210', key: 'cos-210', method: 'spaced review', type: 'study', task: 'Automata and CFG topic block.' },
                { time: '21:30', module: 'Meta', key: 'meta', method: 'sleep', type: 'meta', task: 'Hard lights-out cutoff.' }
            ]
        },
        {
            date: '2026-05-12',
            label: 'Tuesday 12 May',
            note: 'Four days out.',
            sessions: [
                { time: 'Evening', module: 'PHY 255', key: 'phy-255', method: 'closed-book problems', type: 'study', task: 'Quantum mechanics block plus teach-it-back.' },
                { time: 'Evening', module: 'COS 210', key: 'cos-210', method: 'spaced review', type: 'study', task: 'Turing machines and decidability.' },
                { time: '21:30', module: 'Meta', key: 'meta', method: 'sleep', type: 'meta', task: 'Hard lights-out cutoff.' }
            ]
        },
        {
            date: '2026-05-13',
            label: 'Wednesday 13 May',
            note: 'Three days out.',
            sessions: [
                { time: 'Evening', module: 'PHY 255', key: 'phy-255', method: 'closed-book problems', type: 'study', task: 'Nuclear topic block plus teach-it-back.' },
                { time: 'Evening', module: 'COS 210', key: 'cos-210', method: 'spaced review', type: 'study', task: 'NP topic block and retrieval.' },
                { time: '21:30', module: 'Meta', key: 'meta', method: 'sleep', type: 'meta', task: 'Hard lights-out cutoff.' }
            ]
        },
        {
            date: '2026-05-14',
            label: 'Thursday 14 May',
            note: 'Two days out, light review only.',
            sessions: [
                { time: 'Evening', module: 'PHY 255', key: 'phy-255', method: 'light review', type: 'study', task: 'Formula walkthrough and weak spots only.' },
                { time: 'Evening', module: 'COS 210', key: 'cos-210', method: 'light review', type: 'study', task: 'Definitions and proof skeleton recall only.' },
                { time: '21:30', module: 'Meta', key: 'meta', method: 'sleep', type: 'meta', task: 'Hard lights-out cutoff.' }
            ]
        },
        {
            date: '2026-05-15',
            label: 'Friday 15 May',
            note: '1 day to double test day.',
            sessions: [
                { time: '07:30', module: 'Class', key: 'meta', method: 'class block', type: 'class', task: 'Attend Friday classes normally.' },
                { time: '17:30', module: 'COS 210', key: 'cos-210', method: 'flashcard recall', type: 'study', task: 'Key definitions and proofs, 45 mins.' },
                { time: '18:15', module: 'PHY 255', key: 'phy-255', method: 'flashcard recall', type: 'study', task: 'Formula sheet review and mental walkthrough, 45 mins.' },
                { time: '19:00', module: 'Meta', key: 'meta', method: 'sleep', type: 'meta', task: 'Done at 19:00. In bed by 20:30.' }
            ]
        },
        {
            date: '2026-05-16',
            label: 'Saturday 16 May',
            note: 'Double test day: COS 210 then PHY 255.',
            sessions: [
                { time: '08:00', module: 'COS 210', key: 'cos-210', method: 'flashcard recall', type: 'study', task: 'Theorems and proofs recall. Finish by 09:30.' },
                { time: '09:30', module: 'PHY 255', key: 'phy-255', method: 'flashcard recall', type: 'study', task: 'Formula sheet and one mental walkthrough.' },
                { time: '11:00', module: 'Meta', key: 'meta', method: 'prep', type: 'meta', task: 'Eat and travel to Informatorium.' },
                { time: '12:30', module: 'COS 210', key: 'cos-210', method: 'test day', type: 'test', task: 'COS 210 ST2 at Informatorium Labs.' },
                { time: '14:15', module: 'PHY 255', key: 'phy-255', method: 'prep', type: 'study', task: '10 minute formula glance and travel.' },
                { time: '15:00', module: 'PHY 255', key: 'phy-255', method: 'test day', type: 'test', task: 'PHY 255 Modern Physics ST2. Confirm venue beforehand.' },
                { time: '18:00', module: 'Meta', key: 'meta', method: 'off', type: 'meta', task: 'Done. Full rest.' }
            ]
        }
    ];

    var selectedFilter = 'all';
    var selectedDate = normalizeDate(new Date('2026-04-22T00:00:00'));

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
            var badge = session.time;
            return [
                '<div class="day-event ' + sessionEventClass(session) + '">',
                '<div class="day-event__badge">' + badge + '</div>',
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

        meta.textContent = '22 Apr - 16 May · ' + visibleDays + '/' + DAY_PLANS.length + ' days visible';
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
            el.textContent = 'Select a mapped date between 22 Apr and 16 May.';
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
