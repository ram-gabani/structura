/**
 * STRUCTURA — ROOT ONBOARDING & TOPIC SELECTION (PHASE 1)
 * Shared Theme Persistence, Accessible Mobile Menu, and Guided Scrolling
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initMobileMenu();
  initSmoothScroll();
});

/* ============================================================
   1. THEME TOGGLE & STORAGE PERSISTENCE (LOCKED SPECIFICATION)
   ============================================================ */

function initTheme() {
  const savedTheme = localStorage.getItem('dsa_portal_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeToggleButton(savedTheme);

  const themeBtn = document.getElementById('theme-toggle-btn');
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      document.body.classList.add('theme-transition');
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';

      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('dsa_portal_theme', newTheme);
      updateThemeToggleButton(newTheme);

      setTimeout(() => {
        document.body.classList.remove('theme-transition');
      }, 300);
    });
  }
}

function updateThemeToggleButton(theme) {
  const themeBtn = document.getElementById('theme-toggle-btn');
  if (!themeBtn) return;
  themeBtn.setAttribute('aria-checked', theme === 'light' ? 'true' : 'false');
  themeBtn.setAttribute('title', theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode');
}

/* ============================================================
   2. MOBILE NAVIGATION MENU
   ============================================================ */

function initMobileMenu() {
  const mobileBtn = document.getElementById('mobile-menu-btn');
  const mainNav = document.getElementById('main-nav');

  if (mobileBtn && mainNav) {
    mobileBtn.addEventListener('click', () => {
      mainNav.classList.toggle('open');
    });

    // Close menu when clicking navigation links
    const links = mainNav.querySelectorAll('a');
    links.forEach(link => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('open');
      });
    });
  }
}

/* ============================================================
   3. GUIDED PATHWAY SMOOTH SCROLLING
   ============================================================ */

function initSmoothScroll() {
  const startBtn = document.getElementById('start-learning-btn');
  if (startBtn) {
    startBtn.addEventListener('click', (e) => {
      const target = document.getElementById('topics');
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
}
