(function () {
  'use strict';

  const USER_KEY = 'torq_user';
  const USERS_KEY = 'torq_users';

  function readUsers() {
    try {
      const raw = localStorage.getItem(USERS_KEY);
      if (!raw) {
        const demo = [{ name: 'Alex Wright', email: 'alex@torqtyres.com', phone: '+1 (415) 555-0147', password: 'demo123' }];
        localStorage.setItem(USERS_KEY, JSON.stringify(demo));
        return demo;
      }
      return JSON.parse(raw);
    } catch (error) {
      return [];
    }
  }

  function persistUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  function redirectIfSignedIn() {
    const currentUser = localStorage.getItem(USER_KEY);
    if (currentUser) {
      window.location.href = 'dashboard.html';
    }
  }

  function login(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const emailInput = form.querySelector('input[type="email"]');
    const passInput = form.querySelector('input[type="password"]');
    if (!emailInput || !passInput) return;

    const email = emailInput.value.trim().toLowerCase();
    const password = passInput.value;
    const users = readUsers();
    const match = users.find((user) => user.email.toLowerCase() === email && user.password === password);

    if (!match) {
      window.showToast('Invalid email or password', 'error');
      return;
    }

    localStorage.setItem(USER_KEY, JSON.stringify({ name: match.name, email: match.email, phone: match.phone }));
    window.showToast('Welcome back to TORQ', 'success');
    setTimeout(() => window.location.href = 'dashboard.html', 600);
  }

  function signup(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const inputs = form.querySelectorAll('input');
    const name = inputs[0]?.value.trim();
    const email = inputs[1]?.value.trim().toLowerCase();
    const phone = inputs[2]?.value.trim();
    const password = document.getElementById('password')?.value || '';
    const confirmPassword = document.getElementById('confirmPassword')?.value || '';

    if (!name || !email || !phone || !password || !confirmPassword) {
      window.showToast('Please complete all required fields', 'error');
      return;
    }
    if (password.length < 6) {
      window.showToast('Password must be at least 6 characters', 'error');
      return;
    }
    if (password !== confirmPassword) {
      window.showToast('Passwords do not match', 'error');
      return;
    }

    const users = readUsers();
    if (users.some((user) => user.email.toLowerCase() === email)) {
      window.showToast('An account already exists for this email', 'error');
      return;
    }

    const user = { name, email, phone, password };
    users.push(user);
    persistUsers(users);
    localStorage.setItem(USER_KEY, JSON.stringify({ name, email, phone }));
    window.showToast('Account created successfully', 'success');
    setTimeout(() => window.location.href = 'dashboard.html', 600);
  }

  function bindPasswordToggle() {
    document.querySelectorAll('.toggle-password').forEach((button) => {
      button.addEventListener('click', () => {
        const field = button.closest('.form-control-wrap')?.querySelector('input');
        if (!field) return;
        const isHidden = field.type === 'password';
        field.type = isHidden ? 'text' : 'password';
        const icon = button.querySelector('svg, i');
        if (icon) {
          icon.setAttribute('data-lucide', isHidden ? 'eye-off' : 'eye');
          if (window.lucide && typeof window.lucide.createIcons === 'function') {
            window.lucide.createIcons();
          }
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    redirectIfSignedIn();
    bindPasswordToggle();

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', login);
    }

    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
      signupForm.addEventListener('submit', signup);
    }
  });

  window.TyreXAuth = {
    getCurrentUser: function () {
      try {
        return JSON.parse(localStorage.getItem(USER_KEY)) || { name: 'Alex Wright', email: 'alex@torqtyres.com', phone: '+1 (415) 555-0147' };
      } catch (error) {
        return { name: 'Alex Wright', email: 'alex@torqtyres.com', phone: '+1 (415) 555-0147' };
      }
    },
    logout: function () {
      localStorage.removeItem(USER_KEY);
      window.location.href = 'login.html';
    }
  };
})();
