/* ============================================================
   Orb — Timer Firebase Sync Patch
   Replace the existing saveStats() function in timer.js with this.
   Adds Firestore sync while keeping localStorage as fallback.
   ============================================================ */

function saveStats() {
    const today = new Date().toISOString().slice(0, 10);

    // Build the day's stats object
    const existing = JSON.parse(localStorage.getItem('focus_stats') || '{}');
    if (!existing[today]) existing[today] = { sessions: 0, minutes: 0, modules: {} };

    existing[today].sessions = sessionsCompleted;
    existing[today].minutes  = totalFocusMinutes;

    if (currentMod) {
        existing[today].modules[currentMod] =
            (existing[today].modules[currentMod] || 0) + Math.round(DURATIONS.focus / 60);
    }

    // 1. Always write to localStorage (instant, works offline)
    localStorage.setItem('focus_stats', JSON.stringify(existing));

    // 2. Sync to Firestore if logged in (per-user, persists across devices)
    if (typeof currentUser !== 'undefined' && currentUser) {
        db.collection('users').doc(currentUser.uid)
          .collection('meta').doc('focus_stats')
          .set(existing, { merge: true })
          .catch(err => console.warn('Timer Firestore sync failed:', err));
    }
}

/* ──────────────────────────────────────────────────────────────
   Also update loadStats() to prefer Firestore over localStorage.
   Replace the existing loadStats() in timer.js with this:
   ────────────────────────────────────────────────────────────── */

async function loadStats() {
    const today = new Date().toISOString().slice(0, 10);
    let data = {};

    // Try Firestore first if logged in
    if (typeof currentUser !== 'undefined' && currentUser) {
        try {
            const snap = await db.collection('users').doc(currentUser.uid)
                                 .collection('meta').doc('focus_stats').get();
            if (snap.exists) {
                data = snap.data();
                // Keep localStorage in sync
                localStorage.setItem('focus_stats', JSON.stringify(data));
            }
        } catch (err) {
            console.warn('Timer Firestore load failed, using localStorage:', err);
            data = JSON.parse(localStorage.getItem('focus_stats') || '{}');
        }
    } else {
        data = JSON.parse(localStorage.getItem('focus_stats') || '{}');
    }

    if (data[today]) {
        sessionsCompleted  = data[today].sessions || 0;
        totalFocusMinutes  = data[today].minutes  || 0;
    }

    const dots   = document.querySelectorAll('.session-dot');
    const filled = sessionsCompleted % 4;
    for (let i = 0; i < filled; i++) {
        if (dots[i]) dots[i].classList.add('completed');
    }

    updateDisplay();
}

/* ──────────────────────────────────────────────────────────────
   NOTE: timer.js currently has no Firebase auth listener.
   Add this at the bottom of timer.js so currentUser is populated:

   auth.onAuthStateChanged(user => {
       currentUser = user;
       loadStats();   // reload on login/logout so stats sync
   });

   And remove the bare loadStats() call that's currently at the
   bottom of timer.js (it will be called by the auth listener now).
   ────────────────────────────────────────────────────────────── */
