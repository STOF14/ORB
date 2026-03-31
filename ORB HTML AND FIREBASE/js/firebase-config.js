/* ============================================================
   Orb — Firebase Configuration
   Shared Firebase init, auth, Firestore, helpers
   ============================================================ */

const firebaseConfig = {
    apiKey: "AIzaSyArdb2Dm8ruW10w6bUYakIz75QuBhP1SD4",
    authDomain: "time-management-a4285.firebaseapp.com",
    projectId: "time-management-a4285",
    storageBucket: "time-management-a4285.firebasestorage.app",
    messagingSenderId: "453419428813",
    appId: "1:453419428813:web:c84c1e002db8beaa8a7284",
    measurementId: "G-K7HQWV2ZE5"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db   = firebase.firestore();

db.enablePersistence({ synchronizeTabs: true }).catch(err => {
    console.warn('Firestore persistence failed:', err.code);
});

let currentUser = null;

function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).catch(err => {
        console.error('Sign-in error:', err);
        alert('Sign-in failed: ' + err.message);
    });
}

function signOutUser() {
    auth.signOut();
}
