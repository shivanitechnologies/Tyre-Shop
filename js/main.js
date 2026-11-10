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

  const currentPath = window.location.pathname.split('/').pop();
  document.querySelectorAll('.nav-link, .mobile-nav-link').forEach((link) => {
    const href = link.getAttribute('href');
    if (href && href === currentPath) {
      link.classList.add('active');
    }
  });
});
