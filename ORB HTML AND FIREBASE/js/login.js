// login.js — Handles login, signup, and password reset for production
// Assumes firebase-config.js is loaded and firebase.auth() is available

document.addEventListener('DOMContentLoaded', () => {
  const auth = firebase.auth();
  const loginForm = document.getElementById('loginForm');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const errorDiv = document.getElementById('loginError');
  const forgotPassword = document.getElementById('forgotPassword');
  const signupLink = document.getElementById('signupLink');
  const googleLogin = document.getElementById('googleLogin');

  // Redirect if already logged in
  auth.onAuthStateChanged(user => {
    if (user) {
      window.location.href = 'dashboard.html';
    }
  });

  // Show error
  function showError(msg) {
    errorDiv.textContent = msg;
    errorDiv.style.display = 'block';
    errorDiv.style.color = '#c0392b';
  }
  function clearError() {
    errorDiv.textContent = '';
    errorDiv.style.display = 'none';
    errorDiv.style.color = '#c0392b';
  }

  // Login handler
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearError();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    if (!email || !password) {
      showError('Please enter both email and password.');
      return;
    }
    try {
      await auth.signInWithEmailAndPassword(email, password);
      // onAuthStateChanged will redirect
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        showError('No account found for this email.');
      } else if (err.code === 'auth/wrong-password') {
        showError('Incorrect password.');
      } else if (err.code === 'auth/invalid-email') {
        showError('Invalid email address.');
      } else {
        showError(err.message || 'Login failed.');
      }
    }
  });

  // Google login handler
  googleLogin.addEventListener('click', async (e) => {
    e.preventDefault();
    clearError();
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
      await auth.signInWithPopup(provider);
      // onAuthStateChanged will redirect
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user') {
        showError('Google sign-in was cancelled.');
      } else {
        showError('Google sign-in failed. ' + (err.message || ''));
      }
    }
  });

  // Password reset
  forgotPassword.addEventListener('click', async (e) => {
    e.preventDefault();
    clearError();
    const email = emailInput.value.trim();
    if (!email) {
      showError('Enter your email to reset password.');
      emailInput.focus();
      return;
    }
    try {
      await auth.sendPasswordResetEmail(email);
      showError('Password reset email sent. Check your inbox.');
      errorDiv.style.color = '#27ae60';
      setTimeout(clearError, 5000);
    } catch (err) {
      showError('Could not send reset email. ' + (err.message || ''));
    }
  });

  // Signup redirect (replace with your signup page or modal)
  signupLink.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = 'signup.html';
  });
});
