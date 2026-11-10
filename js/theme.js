(function () {
  'use strict';

  const THEME_KEY = 'torq-theme';
  const DIR_KEY = 'torq-dir';

  function setTheme(theme) {
    const root = document.documentElement;
    const resolved = theme === 'light' ? 'light' : 'dark';
    root.setAttribute('data-theme', resolved);
    localStorage.setItem(THEME_KEY, resolved);

    document.querySelectorAll('.theme-toggle-btn i').forEach((icon) => {
      if (icon && icon.dataset && typeof icon.dataset.lucide !== 'undefined') {
        const next = resolved === 'dark' ? 'moon' : 'sun';
        icon.setAttribute('data-lucide', next);
      }
    });

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  function setDirection(dir) {
    const resolved = dir === 'rtl' ? 'rtl' : 'ltr';
    document.documentElement.setAttribute('dir', resolved);
    localStorage.setItem(DIR_KEY, resolved);
  }

  function initThemeControls() {
    const savedTheme = localStorage.getItem(THEME_KEY) || 'dark';
    const savedDir = localStorage.getItem(DIR_KEY) || 'ltr';
    setTheme(savedTheme);
    setDirection(savedDir);

    document.querySelectorAll('.theme-toggle-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
        const next = current === 'dark' ? 'light' : 'dark';
        setTheme(next);
      });
    });

    document.querySelectorAll('.rtl-toggle-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('dir') === 'rtl' ? 'rtl' : 'ltr';
        setDirection(current === 'rtl' ? 'ltr' : 'rtl');
      });
    });
  }

  function setupReveal() {
    const revealEls = document.querySelectorAll('.reveal');
    if (!revealEls.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    revealEls.forEach((el) => observer.observe(el));
  }

  function animateCounters() {
    document.querySelectorAll('[data-counter]').forEach((el) => {
      const finalValue = Number(el.dataset.counter) || 0;
      const suffix = el.dataset.suffix || '';
      let current = 0;
      const step = Math.max(1, Math.ceil(finalValue / 40));

      const tick = () => {
        current += step;
        if (current >= finalValue) {
          el.textContent = finalValue + suffix;
          return;
        }
        el.textContent = current + suffix;
        requestAnimationFrame(tick);
      };

      tick();
    });
  }

  window.openModal = function (id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  window.closeModal = function (id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.remove('open');
    if (!document.querySelector('.modal-overlay.open')) {
      document.body.style.overflow = '';
    }
  };

  window.showToast = function (message, type) {
    let toast = document.getElementById('torq-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'torq-toast';
      toast.className = 'toast';
      document.body.appendChild(toast);
    }

    toast.className = 'toast show ' + (type || 'info');
    toast.textContent = message;
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2600);
  };

  document.addEventListener('DOMContentLoaded', () => {
    initThemeControls();
    setupReveal();
    animateCounters();

    document.querySelectorAll('.modal-overlay').forEach((modal) => {
      modal.addEventListener('click', (event) => {
        if (event.target === modal) {
          modal.classList.remove('open');
          if (!document.querySelector('.modal-overlay.open')) {
            document.body.style.overflow = '';
          }
        }
      });
    });

    document.querySelectorAll('.modal-close-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const modal = btn.closest('.modal-overlay');
        if (modal) {
          modal.classList.remove('open');
          document.body.style.overflow = '';
        }
      });
    });
  });
})();
