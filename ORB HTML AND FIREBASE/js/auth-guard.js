// Protect dashboard and other pages: redirect to login if not authenticated
// Usage: include this at the top of dashboard.js, planner.js, etc.

document.addEventListener('DOMContentLoaded', () => {
  const auth = firebase.auth();
  auth.onAuthStateChanged(user => {
    if (!user) {
      window.location.href = 'login.html';
    }
  });
});
