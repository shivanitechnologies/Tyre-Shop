function setupHomeMotion() {
  if (!document.body.classList.contains('home-page')) return;

  const staggerGroups = [
    '.hero-content > *',
    '.stats-grid > .stat-card',
    '.feature-list > .feature-item',
    '.service-grid > .service-card',
    '.showcase-grid > .card-surface'
  ];

  staggerGroups.forEach((selector) => {
    document.querySelectorAll(selector).forEach((element, index) => {
      element.classList.add('reveal');
      element.style.setProperty('--reveal-delay', `${Math.min(index, 4) * 90}ms`);
    });
  });

  const videos = document.querySelectorAll('.hero-background-video');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function syncVideoPlayback() {
    videos.forEach((video) => {
      if (reducedMotion.matches || document.visibilityState === 'hidden') {
        video.pause();
        return;
      }

      const bounds = video.getBoundingClientRect();
      const isVisible = bounds.bottom > 0 && bounds.top < window.innerHeight;
      if (!isVisible) {
        video.pause();
      } else {
        video.play().catch(() => {
          video.controls = true;
          video.removeAttribute('aria-hidden');
          video.tabIndex = 0;
          video.setAttribute('aria-label', 'TORQ automotive background video');
        });
      }
    });
  }

  window.addEventListener('scroll', syncVideoPlayback, { passive: true });
  window.addEventListener('resize', syncVideoPlayback);
  document.addEventListener('visibilitychange', syncVideoPlayback);
  reducedMotion.addEventListener('change', syncVideoPlayback);
  syncVideoPlayback();
}

setupHomeMotion();

document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  const drawer = document.querySelector('.mobile-nav-drawer');
  const overlay = document.querySelector('.mobile-nav-overlay');
  const hamburger = document.querySelector('.hamburger-btn');
  const closeDrawer = document.querySelector('.close-drawer-btn');

  function toggleDrawer(forceOpen) {
    if (!drawer || !overlay) return;
    const shouldOpen = typeof forceOpen === 'boolean' ? forceOpen : !drawer.classList.contains('open');
    drawer.classList.toggle('open', shouldOpen);
    overlay.classList.toggle('open', shouldOpen);
    document.body.style.overflow = shouldOpen ? 'hidden' : '';
  }

  if (hamburger) {
    hamburger.addEventListener('click', () => toggleDrawer(true));
  }
  if (closeDrawer) {
    closeDrawer.addEventListener('click', () => toggleDrawer(false));
  }
  if (overlay) {
    overlay.addEventListener('click', () => toggleDrawer(false));
  }

  document.querySelectorAll('.mobile-nav-link').forEach((link) => {
    link.addEventListener('click', () => toggleDrawer(false));
  });

  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.appendChild(progress);

  function updateScrollProgress() {
    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progressPercent = scrollableHeight > 0
      ? (window.scrollY / scrollableHeight) * 100
      : 0;
    progress.style.width = `${Math.min(100, Math.max(0, progressPercent))}%`;
  }

  window.addEventListener('scroll', updateScrollProgress, { passive: true });
  window.addEventListener('resize', updateScrollProgress);
  updateScrollProgress();

  const interactiveSurfaces = document.querySelectorAll(
    '.service-card, .product-card, .showcase-grid > .card-surface, .hero-card .card-content'
  );

  interactiveSurfaces.forEach((surface) => {
    surface.classList.add('interactive-surface');
    surface.addEventListener('pointermove', (event) => {
      const bounds = surface.getBoundingClientRect();
      surface.style.setProperty('--pointer-x', `${event.clientX - bounds.left}px`);
      surface.style.setProperty('--pointer-y', `${event.clientY - bounds.top}px`);
    });
  });

  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    window.lucide.createIcons();
  }

  document.querySelectorAll('.toggle-password').forEach((btn) => {
    btn.addEventListener('click', () => {
      const input = btn.parentElement.querySelector('input');
      if (!input) return;
      const isPassword = input.type === 'password';
      input.type = isPassword ? 'text' : 'password';
      const icon = btn.querySelector('svg, i');
      if (icon) {
        icon.setAttribute('data-lucide', isPassword ? 'eye-off' : 'eye');
        if (window.lucide && typeof window.lucide.createIcons === 'function') {
          window.lucide.createIcons();
        }
      }
    });
  });

  document.querySelectorAll('.faq-item').forEach((item) => {
    const button = item.querySelector('.faq-question-btn');
    const answer = item.querySelector('.faq-answer');
    if (!button || !answer) return;
    const setExpanded = (expanded) => {
      item.classList.toggle('active', expanded);
      answer.hidden = !expanded;
      button.setAttribute('aria-expanded', String(expanded));
    };
    setExpanded(item.classList.contains('active'));
    button.addEventListener('click', () => setExpanded(answer.hidden));
  });

  const tyreFinder = document.getElementById('homeTyreFinder');
  if (tyreFinder) {
    tyreFinder.addEventListener('submit', (event) => {
      event.preventDefault();
      const type = tyreFinder.querySelector('[name="type"]').value;
      const search = tyreFinder.querySelector('[name="search"]').value.trim();
      const params = new URLSearchParams({ type });
      if (search) params.set('search', search);
      window.location.href = `products.html?${params.toString()}`;
    });
  }

  const currentPath = window.location.pathname.split('/').pop();
  document.querySelectorAll('.nav-link, .mobile-nav-link').forEach((link) => {
    const href = link.getAttribute('href');
    if (href && href === currentPath) {
      link.classList.add('active');
    }
  });
});
