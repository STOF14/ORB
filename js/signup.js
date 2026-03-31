// signup.js — Handles user registration for production
// Assumes firebase-config.js is loaded and firebase.auth() is available

document.addEventListener('DOMContentLoaded', () => {
  const auth = firebase.auth();
  const signupForm = document.getElementById('signupForm');
  const emailInput = document.getElementById('signupEmail');
  const passwordInput = document.getElementById('signupPassword');
  const password2Input = document.getElementById('signupPassword2');
  const errorDiv = document.getElementById('signupError');

  // Redirect if already logged in
  auth.onAuthStateChanged(user => {
    if (user) {
      window.location.href = 'dashboard.html';
    }
  });

  function showError(msg) {
    errorDiv.textContent = msg;
    errorDiv.style.display = 'block';
    errorDiv.style.color = '#c0392b';
  }
  function showSuccess(msg) {
    errorDiv.textContent = msg;
    errorDiv.style.display = 'block';
    errorDiv.style.color = '#27ae60';
  }
  function clearError() {
    errorDiv.textContent = '';
    errorDiv.style.display = 'none';
  }

  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearError();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const password2 = password2Input.value;
    if (!email || !password || !password2) {
      showError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      showError('Password must be at least 6 characters.');
      return;
    }
    if (password !== password2) {
      showError('Passwords do not match.');
      return;
    }
    try {
      await auth.createUserWithEmailAndPassword(email, password);
      showSuccess('Account created! Redirecting...');
      setTimeout(() => window.location.href = 'dashboard.html', 1200);
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        showError('Email already in use. Try logging in.');
      } else if (err.code === 'auth/invalid-email') {
        showError('Invalid email address.');
      } else {
        showError(err.message || 'Signup failed.');
      }
    }
  });
});
