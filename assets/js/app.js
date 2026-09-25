/**
 * ARRAY MASTER — MAIN APPLICATION ENTRY POINT
 * Theme Controller, Visualizer Simulation, Memory Calculators & Interactivity
 */

import { arrayData } from './data.js';
import { ArrayVisualizerEngine } from './visualizer.js';
import { ArrayQuizController } from './quiz.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Theme Switcher (Light / Dark)
  initThemeSwitcher();

  // 2. Initialize Visualizer
  const visualizer = new ArrayVisualizerEngine(
    'viz-canvas',
    'log-message',
    'log-step',
    'log-complexity'
  );
  visualizer.render();

  // Speed Slider
  const speedSlider = document.getElementById('speed-slider');
  if (speedSlider) {
    speedSlider.addEventListener('input', (e) => {
      visualizer.setSpeed(parseInt(e.target.value, 10));
    });
  }

  // Visualizer Operation Buttons
  const opAccessBtn = document.getElementById('op-access-btn');
  const opSearchBtn = document.getElementById('op-search-btn');
  const opInsertBtn = document.getElementById('op-insert-btn');
  const opDeleteBtn = document.getElementById('op-delete-btn');
  const opResetBtn = document.getElementById('op-reset-btn');

  const accessIdxInput = document.getElementById('access-idx-input');
  const searchValInput = document.getElementById('search-val-input');
  const insertIdxInput = document.getElementById('insert-idx-input');
  const insertValInput = document.getElementById('insert-val-input');
  const deleteIdxInput = document.getElementById('delete-idx-input');

  if (opAccessBtn) {
    opAccessBtn.addEventListener('click', () => {
      const idx = parseInt(accessIdxInput.value, 10);
      visualizer.access(idx);
    });
  }

  if (opSearchBtn) {
    opSearchBtn.addEventListener('click', () => {
      const val = parseInt(searchValInput.value, 10);
      visualizer.linearSearch(val);
    });
  }

  if (opInsertBtn) {
    opInsertBtn.addEventListener('click', () => {
      const idx = parseInt(insertIdxInput.value, 10);
      const val = parseInt(insertValInput.value, 10);
      visualizer.insert(idx, val);
    });
  }

  if (opDeleteBtn) {
    opDeleteBtn.addEventListener('click', () => {
      const idx = parseInt(deleteIdxInput.value, 10);
      visualizer.delete(idx);
    });
  }

  if (opResetBtn) {
    opResetBtn.addEventListener('click', () => {
      visualizer.reset();
    });
  }

  // 3. Initialize Interactive C Address Calculators
  initMemoryCalculators();

  // 4. Initialize Quiz Controller
  const quiz = new ArrayQuizController(arrayData.quizQuestions, 'quiz-container');
  quiz.render();

  // 5. Code Block Copy Buttons
  document.querySelectorAll('.copy-code-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const codeElem = document.getElementById(targetId);
      if (!codeElem) return;

      const lines = codeElem.querySelectorAll('.code-line-content');
      let textToCopy = '';
      if (lines.length > 0) {
        textToCopy = Array.from(lines).map(l => l.textContent).join('\n');
      } else {
        textToCopy = codeElem.innerText;
      }

      navigator.clipboard.writeText(textToCopy).then(() => {
        const originalHTML = btn.innerHTML;
        btn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Copied!
        `;
        btn.style.borderColor = 'var(--accent-primary)';
        btn.style.color = 'var(--accent-primary-text)';
        setTimeout(() => {
          btn.innerHTML = originalHTML;
          btn.style.borderColor = '';
          btn.style.color = '';
        }, 2000);
      });
    });
  });

  // 6. Interactive Synchronized Line Explanations
  document.querySelectorAll('.annotated-code-card').forEach(card => {
    const notes = card.querySelectorAll('.line-note-item');
    const codeLines = card.querySelectorAll('.code-line');

    notes.forEach(note => {
      const targetLine = note.getAttribute('data-target-line');
      if (!targetLine) return;

      const highlightMatching = (state) => {
        note.classList.toggle('active-note', state);
        codeLines.forEach(line => {
          if (line.getAttribute('data-line') === targetLine) {
            line.classList.toggle('active-highlight', state);
          }
        });
      };

      note.addEventListener('mouseenter', () => highlightMatching(true));
      note.addEventListener('mouseleave', () => highlightMatching(false));
      note.addEventListener('click', () => {
        const isCurrentlyActive = note.classList.contains('active-note');
        notes.forEach(n => n.classList.remove('active-note'));
        codeLines.forEach(l => l.classList.remove('active-highlight'));
        if (!isCurrentlyActive) {
          highlightMatching(true);
        }
      });
    });
  });

  // 7. Interactive Locker Hallway Exploration
  const lockerUnits = document.querySelectorAll('.locker-hallway-visual .locker-unit');
  lockerUnits.forEach((unit, idx) => {
    unit.addEventListener('click', () => {
      lockerUnits.forEach(u => u.querySelector('.locker-door')?.classList.remove('active-focus'));
      unit.querySelector('.locker-door')?.classList.add('active-focus');
      
      const calc1dIdx = document.getElementById('calc-1d-idx');
      if (calc1dIdx) {
        calc1dIdx.value = idx;
        calc1dIdx.dispatchEvent(new Event('input'));
      }
    });
  });

  // 8. Sticky Navigation Active Indicator on Scroll
  const navLinks = document.querySelectorAll('.main-nav .nav-link');
  const sections = document.querySelectorAll('.section-wrapper, .hero-card');

  window.addEventListener('scroll', () => {
    let currentId = 'overview';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 140;
      if (window.scrollY >= sectionTop) {
        currentId = section.getAttribute('id') || currentId;
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  });

  // 9. Mobile Menu Toggle
  const mobileBtn = document.getElementById('mobile-menu-btn');
  const mainNav = document.getElementById('main-nav');
  if (mobileBtn && mainNav) {
    mobileBtn.addEventListener('click', () => {
      mainNav.classList.toggle('open');
    });

    mainNav.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('open');
      });
    });
  }
});

/**
 * Robust Theme Switcher (Light / Dark)
 */
function initThemeSwitcher() {
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const storageKey = 'array-classroom-theme';

  const savedTheme = localStorage.getItem(storageKey);
  const initialTheme = savedTheme || 'dark';

  applyTheme(initialTheme, false);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme, true);
      localStorage.setItem(storageKey, newTheme);
    });
  }

  function applyTheme(theme, animate = true) {
    if (animate) {
      document.documentElement.classList.add('theme-transition');
      setTimeout(() => {
        document.documentElement.classList.remove('theme-transition');
      }, 350);
    }
    document.documentElement.setAttribute('data-theme', theme);
    if (themeToggleBtn) {
      themeToggleBtn.setAttribute('aria-checked', theme === 'dark' ? 'true' : 'false');
    }
  }
}

/**
 * Interactive Live C Memory Address Calculators (1D & 2D)
 */
function initMemoryCalculators() {
  // 1D Calculator
  const calc1dBase = document.getElementById('calc-1d-base');
  const calc1dIdx = document.getElementById('calc-1d-idx');
  const calc1dSize = document.getElementById('calc-1d-size');
  const calc1dOutput = document.getElementById('calc-1d-result');
  const calc1dHex = document.getElementById('calc-1d-hex');

  function update1D() {
    if (!calc1dBase || !calc1dIdx || !calc1dSize || !calc1dOutput) return;
    const base = parseInt(calc1dBase.value, 10) || 0;
    const idx = parseInt(calc1dIdx.value, 10) || 0;
    const size = parseInt(calc1dSize.value, 10) || 4;

    const offset = idx * size;
    const finalAddr = base + offset;

    calc1dOutput.textContent = `${base} + (${idx} × ${size}) = ${finalAddr}`;
    if (calc1dHex) {
      calc1dHex.textContent = '0x' + finalAddr.toString(16).toUpperCase();
    }
  }

  [calc1dBase, calc1dIdx, calc1dSize].forEach(input => {
    if (input) input.addEventListener('input', update1D);
  });
  update1D();

  // 2D Row-Major Calculator
  const calc2dBase = document.getElementById('calc-2d-base');
  const calc2dRow = document.getElementById('calc-2d-row');
  const calc2dCol = document.getElementById('calc-2d-col');
  const calc2dColsTotal = document.getElementById('calc-2d-totcols');
  const calc2dSize = document.getElementById('calc-2d-size');
  const calc2dOutput = document.getElementById('calc-2d-result');
  const calc2dHex = document.getElementById('calc-2d-hex');

  function update2D() {
    if (!calc2dBase || !calc2dRow || !calc2dCol || !calc2dColsTotal || !calc2dSize || !calc2dOutput) return;
    const base = parseInt(calc2dBase.value, 10) || 0;
    const i = parseInt(calc2dRow.value, 10) || 0;
    const j = parseInt(calc2dCol.value, 10) || 0;
    const totalCols = parseInt(calc2dColsTotal.value, 10) || 4;
    const size = parseInt(calc2dSize.value, 10) || 4;

    const elementOffset = (i * totalCols) + j;
    const byteOffset = elementOffset * size;
    const finalAddr = base + byteOffset;

    calc2dOutput.textContent = `${base} + [(${i} × ${totalCols} + ${j}) × ${size}] = ${base} + (${elementOffset} × ${size}) = ${finalAddr}`;
    if (calc2dHex) {
      calc2dHex.textContent = '0x' + finalAddr.toString(16).toUpperCase();
    }
  }

  [calc2dBase, calc2dRow, calc2dCol, calc2dColsTotal, calc2dSize].forEach(input => {
    if (input) input.addEventListener('input', update2D);
  });
  update2D();
}
