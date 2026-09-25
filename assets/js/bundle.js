/**
 * DSA PORTAL MASTER JAVASCRIPT BUNDLE
 * Multi-Page Theme Persistence, Active Nav Highlighting,
 * Non-Academic Array Visualizer Engine, Code Copy, and Self-Check Quiz
 */

/* ============================================================
   1. THEME TOGGLE & PERSISTENCE
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
   2. ACTIVE NAV HIGHLIGHTING & MOBILE MENU
   ============================================================ */

function initNavigation() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  const mobileBtn = document.getElementById('mobile-menu-btn');
  const mainNav = document.getElementById('main-nav');
  if (mobileBtn && mainNav) {
    mobileBtn.addEventListener('click', () => {
      mainNav.classList.toggle('open');
      mainNav.classList.toggle('mobile-open');
    });

    mainNav.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        mainNav.classList.remove('open');
        mainNav.classList.remove('mobile-open');
      });
    });
  }
}

/* ============================================================
   3. CODE COPY BUTTONS
   ============================================================ */

function initCodeCopy() {
  const copyButtons = document.querySelectorAll('.copy-code-btn');
  copyButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const codeEl = document.getElementById(targetId);
      if (codeEl) {
        const text = codeEl.innerText || codeEl.textContent;
        navigator.clipboard.writeText(text).then(() => {
          const originalHTML = btn.innerHTML;
          btn.innerHTML = '<span style="color: var(--accent-emerald-text);">✓ Copied!</span>';
          setTimeout(() => {
            btn.innerHTML = originalHTML;
          }, 2000);
        });
      }
    });
  });
}

/* ============================================================
   3B. TOPIC PAGES C SYNTAX HIGHLIGHTER (NO EXTERNAL DEPS)
   Runs exclusively on .topic-page; NEVER on array/
   ============================================================ */

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function tokenizeC(code) {
  const tokenRegex = /(\/\*[\s\S]*?\*\/|\/\/[^\r\n]*)|("(?:\\.|[^"\\])*")|('(?:\\.|[^'\\])*')|(^\s*#\s*[a-zA-Z_]\w*[^\r\n]*)|(\b(?:NULL|true|false|EOF|EXIT_SUCCESS|EXIT_FAILURE)\b)|(\b(?:if|else|while|for|do|return|break|continue|switch|case|default|typedef|sizeof|goto|enum|union|const|static|volatile|inline)\b)|(\b(?:int|char|float|double|void|size_t|bool|long|short|unsigned|signed|int8_t|int16_t|int32_t|int64_t|uint8_t|uint16_t|uint32_t|uint64_t|struct|FILE)\b)|(\b0x[0-9a-fA-F]+\b|\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b)|(\b[a-zA-Z_]\w*(?=\s*\())|(->|\+\+|--|==|!=|<=|>=|&&|\|\||[+\-*\/%=&|^~!?<>:;,\.\[\]{}()])/gm;

  let result = '';
  let lastIndex = 0;
  let match;

  while ((match = tokenRegex.exec(code)) !== null) {
    if (match.index > lastIndex) {
      result += escapeHtml(code.slice(lastIndex, match.index));
    }
    const [full, cm, str, chr, macro, special, kw, type, num, fn, op] = match;
    if (cm) {
      result += '<span class="syn-cm">' + escapeHtml(cm) + '</span>';
    } else if (str) {
      result += '<span class="syn-str">' + escapeHtml(str) + '</span>';
    } else if (chr) {
      result += '<span class="syn-str">' + escapeHtml(chr) + '</span>';
    } else if (macro) {
      result += '<span class="syn-macro">' + escapeHtml(macro) + '</span>';
    } else if (special) {
      result += '<span class="syn-special">' + escapeHtml(special) + '</span>';
    } else if (kw) {
      result += '<span class="syn-kw">' + escapeHtml(kw) + '</span>';
    } else if (type) {
      result += '<span class="syn-type">' + escapeHtml(type) + '</span>';
    } else if (num) {
      result += '<span class="syn-num">' + escapeHtml(num) + '</span>';
    } else if (fn) {
      result += '<span class="syn-fn">' + escapeHtml(fn) + '</span>';
    } else if (op) {
      result += '<span class="syn-op">' + escapeHtml(op) + '</span>';
    }
    lastIndex = tokenRegex.lastIndex;
  }

  if (lastIndex < code.length) {
    result += escapeHtml(code.slice(lastIndex));
  }
  return result;
}

function initTopicSyntaxHighlighting() {
  if (!document.body || !document.body.classList.contains('topic-page')) return;
  if (document.body.classList.contains('topic-array') || window.location.pathname.includes('/array/')) return;

  const codeBlocks = document.querySelectorAll('.topic-page pre code, .topic-page pre.code-block code');
  codeBlocks.forEach(codeEl => {
    if (codeEl.querySelector('.syn-kw, .syn-type, .syn-fn, .syn-cm, .syn-macro')) return;
    if (codeEl.closest('.execution-log') || codeEl.closest('.lab-execution-log') || codeEl.closest('.terminal-box') || codeEl.classList.contains('plain-output')) return;

    const raw = codeEl.textContent;
    codeEl.innerHTML = tokenizeC(raw);
  });
}

window.tokenizeC = tokenizeC;
window.initTopicSyntaxHighlighting = initTopicSyntaxHighlighting;

/* ============================================================
   4. QUESTION HINT TOGGLE
   ============================================================ */

function initHints() {
  const hintButtons = document.querySelectorAll('.btn-hint');
  hintButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const hintId = btn.getAttribute('data-hint');
      const hintDrawer = document.getElementById(hintId);
      if (hintDrawer) {
        hintDrawer.classList.toggle('open');
        btn.textContent = hintDrawer.classList.contains('open') ? '🔒 Hide Hint' : '💡 Reveal Hint';
      }
    });
  });
}

/* ============================================================
   5. INTERACTIVE ARRAY VISUALIZER ENGINE (NON-ACADEMIC)
   ============================================================ */

class ArrayVisualizerEngine {
  constructor(canvasId, logMessageId, logStepId, logSpeedId) {
    this.canvas = document.getElementById(canvasId);
    this.logMessage = document.getElementById(logMessageId);
    this.logStep = document.getElementById(logStepId);
    this.logSpeed = document.getElementById(logSpeedId);

    this.array = [15, 28, 42, 57, 73, 89];
    this.baseAddress = 0x2000;
    this.isAnimating = false;
    this.speedMs = 600;
  }

  setSpeed(speedVal) {
    this.speedMs = 1400 - (speedVal * 240);
  }

  sleep() {
    return new Promise(resolve => setTimeout(resolve, this.speedMs));
  }

  updateLog(message, stepText = 'Idle', speedBadge = '⚡ Instant 1-Step') {
    if (this.logMessage) this.logMessage.textContent = message;
    if (this.logStep) this.logStep.textContent = stepText;
    if (this.logSpeed) this.logSpeed.textContent = speedBadge;
  }

  setControlsDisabled(disabled) {
    this.isAnimating = disabled;
    const buttons = document.querySelectorAll('.op-btn, .viz-input');
    buttons.forEach(btn => {
      btn.disabled = disabled;
    });
    const resetBtn = document.getElementById('op-reset-btn');
    if (resetBtn) resetBtn.disabled = false;
  }

  render(highlightIdx = -1, statusClass = 'highlight') {
    if (!this.canvas) return;

    this.canvas.innerHTML = `
      <div class="array-strip">
        ${this.array.map((val, idx) => {
          const isSlotHighlighted = idx === highlightIdx;
          const hexAddr = '0x' + (this.baseAddress + idx * 4).toString(16).toUpperCase();
          return `
            <div class="array-slot ${isSlotHighlighted ? statusClass : ''}" id="slot-${idx}">
              <span class="array-address">${hexAddr}</span>
              <div class="array-box ${isSlotHighlighted ? statusClass : ''}">
                ${val}
              </div>
              <span class="array-index">Slot [ ${idx} ]</span>
              ${isSlotHighlighted ? `<div class="pointer-badge">Pointer [ ${idx} ]</div>` : ''}
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  async access(idx) {
    if (this.isAnimating) return;
    if (idx < 0 || idx >= this.array.length) {
      this.updateLog(`Error: Slot [ ${idx} ] is outside bounds (0 to ${this.array.length - 1}).`, 'Out of Bounds', '⚠️ Invalid');
      return;
    }

    this.setControlsDisabled(true);
    this.updateLog(`Calculating memory position: Base + (${idx} × 4 bytes). Jumping straight to Slot [ ${idx} ]!`, 'Calculating', '⚡ Instant 1-Step');
    this.render(idx, 'highlight');
    await this.sleep();

    const val = this.array[idx];
    this.updateLog(`Success! Found value ${val} at Slot [ ${idx} ] in exactly 1 direct calculation step.`, 'Complete', '⚡ Instant 1-Step');
    this.setControlsDisabled(false);
  }

  async linearSearch(target) {
    if (this.isAnimating) return;
    this.setControlsDisabled(true);
    this.updateLog(`Starting One-by-One Scan for target value: ${target}...`, 'Starting', '🔍 1-by-1 Scan');
    await this.sleep();

    let foundIdx = -1;
    for (let i = 0; i < this.array.length; i++) {
      this.render(i, 'highlight');
      this.updateLog(`Step ${i + 1}: Checking Slot [ ${i} ] with value ${this.array[i]}...`, `Checking [ ${i} ]`, '🔍 1-by-1 Scan');
      await this.sleep();

      if (this.array[i] === target) {
        foundIdx = i;
        this.render(i, 'found');
        this.updateLog(`Target ${target} FOUND at Slot [ ${i} ] after ${i + 1} checking steps!`, 'Target Found', '🔍 1-by-1 Scan');
        break;
      }
    }

    if (foundIdx === -1) {
      this.render(-1);
      this.updateLog(`Target ${target} not present after checking all ${this.array.length} slots.`, 'Not Found', '🔍 1-by-1 Scan');
    }

    this.setControlsDisabled(false);
  }

  async binarySearch(target) {
    if (this.isAnimating) return;
    this.setControlsDisabled(true);
    this.updateLog(`Starting Smart Half-and-Half Split Search for target value: ${target}...`, 'Starting', '✂️ Half Split');
    await this.sleep();

    let low = 0;
    let high = this.array.length - 1;
    let found = false;
    let steps = 0;

    while (low <= high) {
      steps++;
      let mid = Math.floor((low + high) / 2);
      this.render(mid, 'highlight');
      this.updateLog(`Step ${steps}: Looking at Middle Slot [ ${mid} ] (value ${this.array[mid]}). Remaining range: [${low} to ${high}]`, `Mid [ ${mid} ]`, '✂️ Half Split');
      await this.sleep();

      if (this.array[mid] === target) {
        this.render(mid, 'found');
        this.updateLog(`Found ${target} at Middle Slot [ ${mid} ] in only ${steps} half-split steps!`, 'Target Found', '✂️ Half Split');
        found = true;
        break;
      } else if (this.array[mid] < target) {
        this.updateLog(`${this.array[mid]} is smaller than ${target}. Discarding left half! Searching right half...`, 'Tossing Left Half', '✂️ Half Split');
        low = mid + 1;
      } else {
        this.updateLog(`${this.array[mid]} is larger than ${target}. Discarding right half! Searching left half...`, 'Tossing Right Half', '✂️ Half Split');
        high = mid - 1;
      }
      await this.sleep();
    }

    if (!found) {
      this.render(-1);
      this.updateLog(`Target ${target} was not found in array.`, 'Not Found', '✂️ Half Split');
    }

    this.setControlsDisabled(false);
  }

  async insert(idx, val) {
    if (this.isAnimating) return;
    if (idx < 0 || idx > this.array.length) {
      this.updateLog(`Error: Insert index must be between 0 and ${this.array.length}.`, 'Invalid', '⚠️ Invalid');
      return;
    }
    if (this.array.length >= 8) {
      this.updateLog('Visualizer capacity reached (max 8 elements). Delete an item first.', 'Full', '⚠️ Full');
      return;
    }

    this.setControlsDisabled(true);
    this.updateLog(`Inserting ${val} at Slot [ ${idx} ]. Shifting subsequent items 1 slot to the right...`, 'Preparing Shift', '🔄 Element Slide');

    // Expand array with placeholder
    this.array.push(0);
    for (let i = this.array.length - 1; i > idx; i--) {
      this.array[i] = this.array[i - 1];
      this.render(i, 'shifting');
      this.updateLog(`Sliding item ${this.array[i]} to Slot [ ${i} ]...`, `Shift ${i}`, '🔄 Element Slide');
      await this.sleep();
    }

    this.array[idx] = val;
    this.render(idx, 'inserted');
    this.updateLog(`Inserted ${val} at Slot [ ${idx} ] successfully!`, 'Complete', '🔄 Element Slide');
    await this.sleep();
    this.render(-1);
    this.setControlsDisabled(false);
  }

  async delete(idx) {
    if (this.isAnimating) return;
    if (idx < 0 || idx >= this.array.length) {
      this.updateLog(`Error: Slot [ ${idx} ] is outside bounds.`, 'Invalid', '⚠️ Invalid');
      return;
    }
    if (this.array.length <= 3) {
      this.updateLog('Minimum 3 elements required in demo canvas.', 'Min Limit', '⚠️ Limit');
      return;
    }

    this.setControlsDisabled(true);
    const removedVal = this.array[idx];
    this.updateLog(`Removing item ${removedVal} from Slot [ ${idx} ]. Sliding subsequent items 1 slot to the left...`, 'Removing', '🔄 Element Slide');

    for (let i = idx; i < this.array.length - 1; i++) {
      this.array[i] = this.array[i + 1];
      this.render(i, 'shifting');
      this.updateLog(`Sliding item ${this.array[i]} left into Slot [ ${i} ]...`, `Shift ${i}`, '🔄 Element Slide');
      await this.sleep();
    }

    this.array.pop();
    this.render(-1);
    this.updateLog(`Deleted item ${removedVal}. Array compacted cleanly with no gaps!`, 'Complete', '🔄 Element Slide');
    this.setControlsDisabled(false);
  }

  reset() {
    this.isAnimating = false;
    this.array = [15, 28, 42, 57, 73, 89];
    this.render();
    this.updateLog('Ready. Choose an operation to simulate direct access, linear scan, half split, or sliding.', 'Idle', '⚡ Instant 1-Step');
    this.setControlsDisabled(false);
  }
}

/* ============================================================
   6. SELF-ASSESSMENT KNOWLEDGE QUIZ ENGINE
   ============================================================ */

const quizData = [
  {
    id: 1,
    question: 'In the Train Compartment analogy, why can you find passenger seat #4 instantly in 1 single step?',
    options: [
      'Because you must walk through bogie 0, 1, 2, and 3 first.',
      'Because all bogies are identical in length and connected in a straight line, so you compute Base + (4 × Length) directly.',
      'Because bogie 4 is always placed at the front of the engine.',
      'Because the train conductor tells you where it is.'
    ],
    correctIndex: 1,
    explanation: 'Correct! Arrays are contiguous in memory with equal-sized slots. The computer multiplies the index by element size and jumps directly to that address in 1 step without scanning prior slots.'
  },
  {
    id: 2,
    question: 'Why does inserting a new element at the very beginning of a 100-item array take many steps?',
    options: [
      'Because the computer must restart.',
      'Because every single existing element from index 0 to 99 must slide 1 spot to the right to make room.',
      'Because arrays only allow adding items to the end.',
      'Because the numbers must be re-multiplied.'
    ],
    correctIndex: 1,
    explanation: 'Correct! Arrays cannot have gaps or empty holes between items. Inserting at the front forces all 100 elements to slide one position right.'
  },
  {
    id: 3,
    question: 'What is the absolute golden rule before you can use Fast Binary Search (Half-and-Half split)?',
    options: [
      'The array must only contain positive numbers.',
      'The array elements MUST already be sorted in order.',
      'The array must have an odd number of items.',
      'The array must be created in C++ only.'
    ],
    correctIndex: 1,
    explanation: 'Correct! Binary Search requires sorted order so it knows with 100% certainty which half contains the target after checking the middle item.'
  },
  {
    id: 4,
    question: 'Given an array starting at memory address 1000 where each int takes 4 bytes, what is the address of slot arr[3]?',
    options: [
      '1003',
      '1008',
      '1012',
      '1016'
    ],
    correctIndex: 2,
    explanation: 'Correct! Memory Address = Base + (Index × Size) = 1000 + (3 × 4) = 1000 + 12 = 1012.'
  },
  {
    id: 5,
    question: 'How does Bubble Sort put items in ascending order?',
    options: [
      'It picks random items and puts them together.',
      'It compares adjacent side-by-side pairs and swaps them if the left one is bigger, bubbling the largest item to the end each round.',
      'It cuts the list in half and discards the left side.',
      'It deletes all small items.'
    ],
    correctIndex: 1,
    explanation: 'Correct! Bubble Sort repeatedly steps through the list, compares neighbor pairs, and swaps them if they are in the wrong order.'
  },
  {
    id: 6,
    question: 'In a 2D Array / Matrix grid[3][4], what do the two numbers represent?',
    options: [
      '3 pixels and 4 colors.',
      '3 horizontal Rows and 4 vertical Columns (like seats in a cinema hall).',
      '3 computers and 4 cables.',
      '3 loops and 4 variables.'
    ],
    correctIndex: 1,
    explanation: 'Correct! In grid[row][col], the first index specifies the Row number (0 to 2) and the second specifies the Column number (0 to 3).'
  }
];

class QuizController {
  constructor() {
    this.currentIndex = 0;
    this.score = 0;
    this.answered = false;
  }

  getQuestions() {
    return (window.topicQuizData && window.topicQuizData.length > 0) ? window.topicQuizData : quizData;
  }

  init() {
    this.quizContainer = document.getElementById('quiz-container');
    if (!this.quizContainer) return;
    this.renderQuestion();
  }

  renderQuestion() {
    const list = this.getQuestions();
    const q = list[this.currentIndex];
    this.answered = false;

    this.quizContainer.innerHTML = `
      <div class="quiz-card card-glass">
        <div class="quiz-header">
          <span class="quiz-badge">Question ${this.currentIndex + 1} of ${list.length}</span>
          <span class="quiz-score-badge">Score: ${this.score} / ${list.length}</span>
        </div>

        <h3 class="quiz-question-text">${q.question}</h3>

        <div class="quiz-options-list" id="quiz-options">
          ${q.options.map((opt, i) => `
            <button class="quiz-option-btn" data-opt-idx="${i}">
              <span class="opt-indicator">${String.fromCharCode(65 + i)}</span>
              <span class="opt-text">${opt}</span>
            </button>
          `).join('')}
        </div>

        <div class="quiz-feedback-box" id="quiz-feedback"></div>

        <div class="quiz-actions">
          <button id="quiz-next-btn" class="btn-primary" disabled>
            ${this.currentIndex === list.length - 1 ? 'View Final Results →' : 'Next Question →'}
          </button>
        </div>
      </div>
    `;

    const options = this.quizContainer.querySelectorAll('.quiz-option-btn');
    options.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(btn.getAttribute('data-opt-idx'), 10);
        this.handleAnswer(idx);
      });
    });

    const nextBtn = document.getElementById('quiz-next-btn');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.nextQuestion();
      });
    }
  }

  handleAnswer(selectedIdx) {
    if (this.answered) return;
    this.answered = true;

    const list = this.getQuestions();
    const q = list[this.currentIndex];
    const options = this.quizContainer.querySelectorAll('.quiz-option-btn');
    const feedbackBox = document.getElementById('quiz-feedback');
    const nextBtn = document.getElementById('quiz-next-btn');

    options.forEach((btn, i) => {
      btn.disabled = true;
      if (i === q.correctIndex) {
        btn.classList.add('selected-correct');
      } else if (i === selectedIdx) {
        btn.classList.add('selected-wrong');
      }
    });

    if (selectedIdx === q.correctIndex) {
      this.score++;
      if (feedbackBox) {
        feedbackBox.className = 'quiz-feedback-box correct';
        feedbackBox.innerHTML = `<strong>✓ Excellent!</strong> ${q.explanation}`;
      }
    } else {
      if (feedbackBox) {
        feedbackBox.className = 'quiz-feedback-box wrong';
        feedbackBox.innerHTML = `<strong>✗ Not quite.</strong> ${q.explanation}`;
      }
    }

    if (nextBtn) nextBtn.disabled = false;
  }

  nextQuestion() {
    this.currentIndex++;
    const list = this.getQuestions();
    if (this.currentIndex < list.length) {
      this.renderQuestion();
    } else {
      this.renderSummary();
    }
  }

  renderSummary() {
    const list = this.getQuestions();
    const percentage = Math.round((this.score / list.length) * 100);
    let title = 'Great Effort!';
    let message = 'Review the concepts and try again to get 100%.';

    if (percentage === 100) {
      title = '🏆 Perfect Score! Topic Master!';
      message = 'You have thoroughly mastered the core concepts, operations, and memory models.';
    } else if (percentage >= 70) {
      title = '🌟 High Score! Well Done!';
      message = 'You have a solid, intuitive understanding of this data structure.';
    }

    this.quizContainer.innerHTML = `
      <div class="quiz-card card-glass" style="text-align: center; padding: 2.5rem 1.5rem;">
        <h2 style="font-size: 1.8rem; margin-bottom: 0.5rem; color: var(--text-primary);">${title}</h2>
        <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">${message}</p>
        
        <div style="font-size: 3rem; font-weight: 900; font-family: 'JetBrains Mono', monospace; color: var(--accent-primary-text); margin-bottom: 1.5rem;">
          ${this.score} / ${list.length} <span style="font-size: 1.2rem; color: var(--text-muted);">(${percentage}%)</span>
        </div>

        <button id="quiz-restart-btn" class="btn-primary" style="margin: 0 auto;">
          🔄 Retake Knowledge Check
        </button>
      </div>
    `;

    const restartBtn = document.getElementById('quiz-restart-btn');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        this.currentIndex = 0;
        this.score = 0;
        this.renderQuestion();
      });
    }
  }
}

/* ============================================================
   7. COMPREHENSIVE SORTING LABORATORY & DUAL RACE ENGINE
   ============================================================ */

const ALGORITHM_INFO = {
  bubble: {
    name: 'Bubble Sort',
    timeBest: 'O(N)',
    timeAvg: 'O(N²)',
    timeWorst: 'O(N²)',
    space: 'O(1)',
    stable: true,
    description: 'Repeatedly compares adjacent items and swaps them if out of order, bubbling the largest unsorted element to the end in each pass.',
    cCode: [
      'void bubbleSort(int arr[], int n) {',
      '    for (int i = 0; i < n - 1; i++) {',
      '        bool swapped = false;',
      '        for (int j = 0; j < n - i - 1; j++) {',
      '            if (arr[j] > arr[j + 1]) {',
      '                swap(&arr[j], &arr[j + 1]);',
      '                swapped = true;',
      '            }',
      '        }',
      '        if (!swapped) break; // Early exit',
      '    }',
      '}'
    ]
  },
  selection: {
    name: 'Selection Sort',
    timeBest: 'O(N²)',
    timeAvg: 'O(N²)',
    timeWorst: 'O(N²)',
    space: 'O(1)',
    stable: false,
    description: 'Finds the minimum element from the unsorted subarray and swaps it with the first unsorted position, locking one item per pass.',
    cCode: [
      'void selectionSort(int arr[], int n) {',
      '    for (int i = 0; i < n - 1; i++) {',
      '        int minIdx = i;',
      '        for (int j = i + 1; j < n; j++) {',
      '            if (arr[j] < arr[minIdx]) {',
      '                minIdx = j;',
      '            }',
      '        }',
      '        if (minIdx != i) {',
      '            swap(&arr[i], &arr[minIdx]);',
      '        }',
      '    }',
      '}'
    ]
  },
  insertion: {
    name: 'Insertion Sort',
    timeBest: 'O(N)',
    timeAvg: 'O(N²)',
    timeWorst: 'O(N²)',
    space: 'O(1)',
    stable: true,
    description: 'Builds the sorted array one item at a time by picking the next key element and shifting larger elements to the right to make room.',
    cCode: [
      'void insertionSort(int arr[], int n) {',
      '    for (int i = 1; i < n; i++) {',
      '        int key = arr[i];',
      '        int j = i - 1;',
      '        while (j >= 0 && arr[j] > key) {',
      '            arr[j + 1] = arr[j]; // Shift right',
      '            j = j - 1;',
      '        }',
      '        arr[j + 1] = key; // Insert key',
      '    }',
      '}'
    ]
  },
  radix: {
    name: 'Radix Sort (LSD)',
    timeBest: 'O(d · (N + k))',
    timeAvg: 'O(d · (N + k))',
    timeWorst: 'O(d · (N + k))',
    space: 'O(N + k)',
    stable: true,
    description: 'Non-comparative integer sorting algorithm that distributes numbers into 10 base-10 digit buckets (0–9) by place value (1s, 10s, 100s).',
    cCode: [
      'void countSort(int arr[], int n, int exp) {',
      '    int output[n], count[10] = {0};',
      '    for (int i = 0; i < n; i++)',
      '        count[(arr[i] / exp) % 10]++;',
      '    for (int i = 1; i < 10; i++)',
      '        count[i] += count[i - 1];',
      '    for (int i = n - 1; i >= 0; i--) {',
      '        int d = (arr[i] / exp) % 10;',
      '        output[--count[d]] = arr[i];',
      '    }',
      '    for (int i = 0; i < n; i++) arr[i] = output[i];',
      '}',
      'void radixSort(int arr[], int n) {',
      '    int m = getMax(arr, n);',
      '    for (int exp = 1; m / exp > 0; exp *= 10)',
      '        countSort(arr, n, exp);',
      '}'
    ]
  }
};

function generateSortingSteps(algoKey, originalArray) {
  const arr = [...originalArray];
  const steps = [];
  let comparisons = 0;
  let swaps = 0;

  // Initial step
  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    pivot: -1,
    minIdx: -1,
    sorted: [],
    activeRange: [0, arr.length - 1],
    buckets: Array.from({ length: 10 }, () => []),
    codeLine: 0,
    explanation: `Initialized ${ALGORITHM_INFO[algoKey].name} with dataset of ${arr.length} elements. Ready to execute.`,
    comparisons: 0,
    swaps: 0
  });

  if (algoKey === 'bubble') {
    const n = arr.length;
    const sortedIndices = [];

    for (let i = 0; i < n - 1; i++) {
      let swappedInPass = false;
      steps.push({
        array: [...arr],
        comparing: [],
        swapping: [],
        pivot: -1,
        minIdx: -1,
        sorted: [...sortedIndices],
        activeRange: [0, n - i - 1],
        buckets: Array.from({ length: 10 }, () => []),
        codeLine: 1,
        explanation: `Starting Pass ${i + 1}. Unsorted partition range: Index [0] to [${n - i - 1}].`,
        comparisons,
        swaps
      });

      for (let j = 0; j < n - i - 1; j++) {
        comparisons++;
        steps.push({
          array: [...arr],
          comparing: [j, j + 1],
          swapping: [],
          pivot: -1,
          minIdx: -1,
          sorted: [...sortedIndices],
          activeRange: [0, n - i - 1],
          buckets: Array.from({ length: 10 }, () => []),
          codeLine: 4,
          explanation: `Comparing adjacent pair: arr[${j}] (${arr[j]}) vs arr[${j + 1}] (${arr[j + 1]}).`,
          comparisons,
          swaps
        });

        if (arr[j] > arr[j + 1]) {
          swaps++;
          swappedInPass = true;
          const temp = arr[j];
          arr[j] = arr[j + 1];
          arr[j + 1] = temp;

          steps.push({
            array: [...arr],
            comparing: [],
            swapping: [j, j + 1],
            pivot: -1,
            minIdx: -1,
            sorted: [...sortedIndices],
            activeRange: [0, n - i - 1],
            buckets: Array.from({ length: 10 }, () => []),
            codeLine: 5,
            explanation: `arr[${j}] (${temp}) > arr[${j + 1}] (${arr[j]}). Swapping to bubble larger value right.`,
            comparisons,
            swaps
          });
        }
      }

      sortedIndices.unshift(n - 1 - i);
      steps.push({
        array: [...arr],
        comparing: [],
        swapping: [],
        pivot: -1,
        minIdx: -1,
        sorted: [...sortedIndices],
        activeRange: [0, n - i - 2],
        buckets: Array.from({ length: 10 }, () => []),
        codeLine: 8,
        explanation: `Pass ${i + 1} complete. Value ${arr[n - 1 - i]} is locked in final sorted position at Index [${n - 1 - i}].`,
        comparisons,
        swaps
      });

      if (!swappedInPass) {
        steps.push({
          array: [...arr],
          comparing: [],
          swapping: [],
          pivot: -1,
          minIdx: -1,
          sorted: arr.map((_, idx) => idx),
          activeRange: [],
          buckets: Array.from({ length: 10 }, () => []),
          codeLine: 9,
          explanation: `Adaptive Early Exit: No swaps occurred during Pass ${i + 1}. Entire array is already sorted!`,
          comparisons,
          swaps
        });
        break;
      }
    }
  } else if (algoKey === 'selection') {
    const n = arr.length;
    const sortedIndices = [];

    for (let i = 0; i < n - 1; i++) {
      let minIdx = i;
      steps.push({
        array: [...arr],
        comparing: [],
        swapping: [],
        pivot: -1,
        minIdx: minIdx,
        sorted: [...sortedIndices],
        activeRange: [i, n - 1],
        buckets: Array.from({ length: 10 }, () => []),
        codeLine: 2,
        explanation: `Pass ${i + 1}: Setting initial candidate minimum at Index [${i}] (value: ${arr[i]}).`,
        comparisons,
        swaps
      });

      for (let j = i + 1; j < n; j++) {
        comparisons++;
        steps.push({
          array: [...arr],
          comparing: [j, minIdx],
          swapping: [],
          pivot: -1,
          minIdx: minIdx,
          sorted: [...sortedIndices],
          activeRange: [i, n - 1],
          buckets: Array.from({ length: 10 }, () => []),
          codeLine: 4,
          explanation: `Scanning Index [${j}] (${arr[j]}) vs Current Minimum [${minIdx}] (${arr[minIdx]}).`,
          comparisons,
          swaps
        });

        if (arr[j] < arr[minIdx]) {
          minIdx = j;
          steps.push({
            array: [...arr],
            comparing: [],
            swapping: [],
            pivot: -1,
            minIdx: minIdx,
            sorted: [...sortedIndices],
            activeRange: [i, n - 1],
            buckets: Array.from({ length: 10 }, () => []),
            codeLine: 5,
            explanation: `Found new smaller minimum: ${arr[minIdx]} at Index [${minIdx}].`,
            comparisons,
            swaps
          });
        }
      }

      if (minIdx !== i) {
        swaps++;
        const temp = arr[i];
        arr[i] = arr[minIdx];
        arr[minIdx] = temp;

        steps.push({
          array: [...arr],
          comparing: [],
          swapping: [i, minIdx],
          pivot: -1,
          minIdx: -1,
          sorted: [...sortedIndices],
          activeRange: [i, n - 1],
          buckets: Array.from({ length: 10 }, () => []),
          codeLine: 9,
          explanation: `Swapping found minimum ${arr[i]} into its correct place at Index [${i}].`,
          comparisons,
          swaps
        });
      }

      sortedIndices.push(i);
      steps.push({
        array: [...arr],
        comparing: [],
        swapping: [],
        pivot: -1,
        minIdx: -1,
        sorted: [...sortedIndices],
        activeRange: [i + 1, n - 1],
        buckets: Array.from({ length: 10 }, () => []),
        codeLine: 1,
        explanation: `Locked Index [${i}] with value ${arr[i]}. Sorted partition size: ${sortedIndices.length}.`,
        comparisons,
        swaps
      });
    }
  } else if (algoKey === 'insertion') {
    const n = arr.length;
    const sortedIndices = [0];

    for (let i = 1; i < n; i++) {
      const key = arr[i];
      let j = i - 1;

      steps.push({
        array: [...arr],
        comparing: [],
        swapping: [],
        pivot: i,
        minIdx: -1,
        sorted: [...sortedIndices],
        activeRange: [0, i],
        buckets: Array.from({ length: 10 }, () => []),
        codeLine: 2,
        explanation: `Pass ${i}: Extracted key element ${key} at Index [${i}]. Preparing to insert into sorted left subarray.`,
        comparisons,
        swaps
      });

      while (j >= 0) {
        comparisons++;
        steps.push({
          array: [...arr],
          comparing: [j, i],
          swapping: [],
          pivot: i,
          minIdx: -1,
          sorted: [...sortedIndices],
          activeRange: [0, i],
          buckets: Array.from({ length: 10 }, () => []),
          codeLine: 4,
          explanation: `Comparing key (${key}) with sorted element arr[${j}] (${arr[j]}).`,
          comparisons,
          swaps
        });

        if (arr[j] > key) {
          swaps++;
          arr[j + 1] = arr[j];
          steps.push({
            array: [...arr],
            comparing: [],
            swapping: [j, j + 1],
            pivot: -1,
            minIdx: -1,
            sorted: [...sortedIndices],
            activeRange: [0, i],
            buckets: Array.from({ length: 10 }, () => []),
            codeLine: 5,
            explanation: `arr[${j}] (${arr[j]}) > key (${key}) ➔ Shifting element right into slot [${j + 1}].`,
            comparisons,
            swaps
          });
          j--;
        } else {
          break;
        }
      }

      arr[j + 1] = key;
      sortedIndices.push(i);

      steps.push({
        array: [...arr],
        comparing: [],
        swapping: [j + 1],
        pivot: -1,
        minIdx: -1,
        sorted: [...sortedIndices],
        activeRange: [0, i],
        buckets: Array.from({ length: 10 }, () => []),
        codeLine: 8,
        explanation: `Inserted key ${key} into correct position at Index [${j + 1}]. Subarray [0..${i}] is now sorted.`,
        comparisons,
        swaps
      });
    }
  } else if (algoKey === 'radix') {
    const maxVal = Math.max(...arr, 0);
    let exp = 1;
    let passNum = 1;

    while (Math.floor(maxVal / exp) > 0) {
      const placeName = exp === 1 ? 'Units / 1s' : (exp === 10 ? 'Tens / 10s' : 'Hundreds / 100s');
      let currentBuckets = Array.from({ length: 10 }, () => []);

      steps.push({
        array: [...arr],
        comparing: [],
        swapping: [],
        pivot: -1,
        minIdx: -1,
        sorted: [],
        activeRange: [0, arr.length - 1],
        buckets: currentBuckets.map(b => [...b]),
        codeLine: 13,
        explanation: `LSD Pass ${passNum}: Sorting by ${placeName} place value (divisor exp = ${exp}).`,
        comparisons,
        swaps
      });

      // 1. Distribute into 10 Buckets
      for (let i = 0; i < arr.length; i++) {
        comparisons++;
        const digit = Math.floor(arr[i] / exp) % 10;
        currentBuckets[digit].push(arr[i]);

        steps.push({
          array: [...arr],
          comparing: [i],
          swapping: [],
          pivot: i,
          minIdx: -1,
          sorted: [],
          activeRange: [0, arr.length - 1],
          buckets: currentBuckets.map(b => [...b]),
          codeLine: 3,
          explanation: `LSD Pass ${passNum} (${placeName}): Number ${arr[i]} has digit [${digit}] ➔ Placing into Bucket ${digit}.`,
          comparisons,
          swaps
        });
      }

      // 2. Flatten Buckets back into array
      let writeIdx = 0;
      for (let d = 0; d < 10; d++) {
        while (currentBuckets[d].length > 0) {
          swaps++;
          const val = currentBuckets[d].shift();
          arr[writeIdx] = val;

          steps.push({
            array: [...arr],
            comparing: [],
            swapping: [writeIdx],
            pivot: -1,
            minIdx: -1,
            sorted: [],
            activeRange: [0, writeIdx],
            buckets: currentBuckets.map(b => [...b]),
            codeLine: 8,
            explanation: `Flattening: Popped ${val} from Bucket ${d} and placed back into Array at Index [${writeIdx}].`,
            comparisons,
            swaps
          });
          writeIdx++;
        }
      }

      steps.push({
        array: [...arr],
        comparing: [],
        swapping: [],
        pivot: -1,
        minIdx: -1,
        sorted: [],
        activeRange: [0, arr.length - 1],
        buckets: Array.from({ length: 10 }, () => []),
        codeLine: 10,
        explanation: `LSD Pass ${passNum} (${placeName}) Complete! Array re-assembled in stable order for current digit place.`,
        comparisons,
        swaps
      });

      exp *= 10;
      passNum++;
    }
  }

  // Final Complete step
  steps.push({
    array: [...arr],
    comparing: [],
    swapping: [],
    pivot: -1,
    minIdx: -1,
    sorted: arr.map((_, i) => i),
    activeRange: [],
    buckets: Array.from({ length: 10 }, () => []),
    codeLine: 0,
    explanation: `✨ Sorting Complete! All ${arr.length} elements are in ascending sorted order in ${comparisons} operations and ${swaps} swaps/shifts.`,
    comparisons,
    swaps
  });

  return steps;
}

function generateDataset(type, size = 12, isRadix = false) {
  const n = Math.max(5, Math.min(30, size));
  switch (type) {
    case 'nearly-sorted': {
      const base = Array.from({ length: n }, (_, i) => (i + 1) * (isRadix ? 15 : 3) + Math.floor(Math.random() * 5));
      const swaps = Math.max(1, Math.floor(n / 6));
      for (let s = 0; s < swaps; s++) {
        const idx1 = Math.floor(Math.random() * (n - 1));
        const temp = base[idx1];
        base[idx1] = base[idx1 + 1];
        base[idx1 + 1] = temp;
      }
      return base;
    }
    case 'reversed': {
      return Array.from({ length: n }, (_, i) => (n - i) * (isRadix ? 18 : 3) + 12);
    }
    case 'few-unique': {
      const palette = isRadix ? [142, 285, 45, 67, 142, 880] : [12, 28, 45, 67, 88];
      return Array.from({ length: n }, () => palette[Math.floor(Math.random() * palette.length)]);
    }
    case 'random':
    default: {
      const set = new Set();
      while (set.size < n) {
        set.add(isRadix ? (Math.floor(Math.random() * 850) + 10) : (Math.floor(Math.random() * 85) + 10));
      }
      return Array.from(set);
    }
  }
}

class SortingLabController {
  constructor() {
    this.algoKey = 'bubble';
    this.dataset = [45, 12, 89, 34, 22, 67, 19, 90, 53, 28, 77, 41];
    this.viewMode = 'bars'; // 'bars' or 'cells'
    this.speedMultiplier = 1.0;
    this.steps = [];
    this.stepIdx = 0;
    this.isPlaying = false;
    this.playTimer = null;
  }

  init() {
    this.stage = document.getElementById('sort-stage');
    this.codeBox = document.getElementById('sort-code-sync');
    this.expCard = document.getElementById('sort-step-explanation');
    this.playBtn = document.getElementById('sort-play-btn');
    this.prevBtn = document.getElementById('sort-prev-btn');
    this.nextBtn = document.getElementById('sort-next-btn');
    this.resetBtn = document.getElementById('sort-reset-btn');

    if (!this.stage) return;

    this.bindEvents();
    this.loadAlgorithm(this.algoKey);
  }

  bindEvents() {
    // Algorithm Pill Tabs
    const pills = document.querySelectorAll('.algo-pill-btn');
    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        pills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const key = pill.getAttribute('data-algo');
        if (key === 'radix' && this.dataset.every(v => v < 100)) {
          this.dataset = [170, 45, 75, 90, 802, 24, 2, 66, 321, 54, 98, 412];
        }
        this.loadAlgorithm(key);
      });
    });

    // Dataset Preset Buttons
    const presets = document.querySelectorAll('.preset-btn');
    presets.forEach(btn => {
      btn.addEventListener('click', () => {
        presets.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const type = btn.getAttribute('data-preset');
        const sizeInput = document.getElementById('sort-size-slider');
        const size = sizeInput ? parseInt(sizeInput.value, 10) : 12;
        this.dataset = generateDataset(type, size, this.algoKey === 'radix');
        this.recomputeSteps();
      });
    });

    // Size Slider
    const sizeSlider = document.getElementById('sort-size-slider');
    if (sizeSlider) {
      sizeSlider.addEventListener('input', (e) => {
        const size = parseInt(e.target.value, 10);
        const activePreset = document.querySelector('.preset-btn.active')?.getAttribute('data-preset') || 'random';
        const label = document.getElementById('sort-size-val');
        if (label) label.textContent = size;
        this.dataset = generateDataset(activePreset, size, this.algoKey === 'radix');
        this.recomputeSteps();
      });
    }

    // View Mode Toggle
    const viewBarsBtn = document.getElementById('view-mode-bars');
    const viewCellsBtn = document.getElementById('view-mode-cells');
    if (viewBarsBtn && viewCellsBtn) {
      viewBarsBtn.addEventListener('click', () => {
        this.viewMode = 'bars';
        viewBarsBtn.classList.add('active');
        viewCellsBtn.classList.remove('active');
        this.renderStep();
      });
      viewCellsBtn.addEventListener('click', () => {
        this.viewMode = 'cells';
        viewCellsBtn.classList.add('active');
        viewBarsBtn.classList.remove('active');
        this.renderStep();
      });
    }

    // Playback Controls
    if (this.playBtn) {
      this.playBtn.addEventListener('click', () => {
        if (this.isPlaying) this.pause();
        else this.play();
      });
    }

    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => {
        this.pause();
        this.stepBackward();
      });
    }

    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => {
        this.pause();
        this.stepForward();
      });
    }

    if (this.resetBtn) {
      this.resetBtn.addEventListener('click', () => {
        this.pause();
        this.stepIdx = 0;
        this.renderStep();
      });
    }

    // Speed Slider
    const speedSlider = document.getElementById('sort-speed-slider');
    if (speedSlider) {
      speedSlider.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value);
        this.speedMultiplier = val;
        const speedLabel = document.getElementById('sort-speed-label');
        if (speedLabel) speedLabel.textContent = `${val.toFixed(1)}x`;
      });
    }

    // Custom Array Input
    const customBtn = document.getElementById('sort-custom-btn');
    if (customBtn) {
      customBtn.addEventListener('click', () => {
        const raw = prompt('Enter 5 to 25 comma-separated numbers (e.g. 170, 45, 75, 90, 802, 24, 2, 66):');
        if (raw) {
          const parsed = raw.split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n) && n >= 0 && n <= 9999);
          if (parsed.length >= 4) {
            this.dataset = parsed.slice(0, 30);
            this.recomputeSteps();
          } else {
            alert('Please provide at least 4 valid non-negative numbers.');
          }
        }
      });
    }
  }

  loadAlgorithm(algoKey) {
    this.pause();
    this.algoKey = algoKey;
    this.recomputeSteps();
    this.renderAlgorithmInfo();
  }

  recomputeSteps() {
    this.pause();
    this.steps = generateSortingSteps(this.algoKey, this.dataset);
    this.stepIdx = 0;
    this.renderStep();
  }

  play() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    if (this.playBtn) {
      this.playBtn.innerHTML = '<span>⏸</span> Pause';
      this.playBtn.classList.add('primary');
    }

    const runLoop = () => {
      if (!this.isPlaying) return;
      if (this.stepIdx < this.steps.length - 1) {
        this.stepIdx++;
        this.renderStep();
        const delay = Math.max(50, Math.floor(450 / this.speedMultiplier));
        this.playTimer = setTimeout(runLoop, delay);
      } else {
        this.pause();
      }
    };

    runLoop();
  }

  pause() {
    this.isPlaying = false;
    if (this.playTimer) clearTimeout(this.playTimer);
    if (this.playBtn) {
      this.playBtn.innerHTML = '<span>▶</span> Play';
    }
  }

  stepForward() {
    if (this.stepIdx < this.steps.length - 1) {
      this.stepIdx++;
      this.renderStep();
    }
  }

  stepBackward() {
    if (this.stepIdx > 0) {
      this.stepIdx--;
      this.renderStep();
    }
  }

  renderStep() {
    if (!this.steps || this.steps.length === 0) return;
    const step = this.steps[this.stepIdx];

    // 1. Render Visual Stage (Bars vs Cells)
    let mainArrayHtml = '';
    if (this.viewMode === 'bars') {
      const maxVal = Math.max(...step.array, 1);
      mainArrayHtml = `
        <div class="bar-chart-stage">
          ${step.array.map((val, idx) => {
            let stateClass = 'state-default';
            if (step.sorted.includes(idx)) stateClass = 'state-sorted';
            else if (step.swapping.includes(idx)) stateClass = 'state-swapping';
            else if (step.comparing.includes(idx)) stateClass = 'state-comparing';
            else if (idx === step.pivot) stateClass = 'state-pivot';
            else if (idx === step.minIdx) stateClass = 'state-min';

            const heightPct = Math.max(12, Math.round((val / maxVal) * 100));
            const pointerTag = step.pointerTags && step.pointerTags[idx] ? `<span class="sort-bar-pointer-tag">${step.pointerTags[idx]}</span>` : '';

            return `
              <div class="sort-bar-column">
                ${pointerTag}
                <div class="sort-bar-val">${val}</div>
                <div class="sort-bar ${stateClass}" style="height: ${heightPct}%;"></div>
                <div class="sort-bar-idx">[${idx}]</div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    } else {
      mainArrayHtml = `
        <div class="ram-cells-stage">
          ${step.array.map((val, idx) => {
            let stateClass = 'state-default';
            if (step.sorted.includes(idx)) stateClass = 'state-sorted';
            else if (step.swapping.includes(idx)) stateClass = 'state-swapping';
            else if (step.comparing.includes(idx)) stateClass = 'state-comparing';
            else if (idx === step.pivot) stateClass = 'state-pivot';
            else if (idx === step.minIdx) stateClass = 'state-min';

            const hexAddr = '0x' + (0x2000 + (idx * 4)).toString(16).toUpperCase();
            const pointerTag = step.pointerTags && step.pointerTags[idx] ? `<span style="color: #38bdf8; font-size: 0.65rem; font-weight: 800;">${step.pointerTags[idx]}</span>` : '';

            return `
              <div class="sort-ram-cell ${stateClass}">
                <span class="sort-ram-addr">${hexAddr}</span>
                ${pointerTag}
                <span class="sort-ram-val">${val}</span>
                <span class="sort-ram-idx">Idx [${idx}]</span>
              </div>
            `;
          }).join('')}
        </div>
      `;
    }

    // If Radix Sort, append 10-bucket grid below
    let bucketsHtml = '';
    if (this.algoKey === 'radix' && step.buckets) {
      bucketsHtml = `
        <div class="radix-buckets-container">
          <div class="radix-buckets-header">
            <span>📦 Base-10 Digit Buckets (0–9)</span>
            <span style="color: var(--text-muted); font-size: 0.72rem;">Numbers grouped by active digit place</span>
          </div>
          <div class="radix-buckets-grid">
            ${step.buckets.map((items, d) => `
              <div class="radix-bucket-col">
                <span class="radix-bucket-label">Bucket ${d}</span>
                <div class="radix-bucket-items">
                  ${items.map(item => `<span class="radix-item-chip">${item}</span>`).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    this.stage.innerHTML = mainArrayHtml + bucketsHtml;

    // 2. Render Step Breakdown Card
    if (this.expCard) {
      this.expCard.innerHTML = `
        <div class="step-card-header">
          <span class="line-badge sky">Step ${this.stepIdx + 1} of ${this.steps.length}</span>
          <span class="line-badge ${step.swapping.length ? 'rose' : (step.comparing.length ? 'amber' : 'emerald')}">
            ${step.swapping.length ? 'Swapping / Moving' : (step.comparing.length ? 'Comparing' : 'Ready')}
          </span>
        </div>
        <div class="step-card-title">${ALGORITHM_INFO[this.algoKey].name} Action</div>
        <div class="step-card-body">${step.explanation}</div>
      `;
    }

    // 3. Render Code Sync
    if (this.codeBox) {
      const codeLines = ALGORITHM_INFO[this.algoKey].cCode;
      this.codeBox.innerHTML = codeLines.map((line, i) => {
        const isCurrent = (i === step.codeLine);
        return `
          <div class="code-sync-line ${isCurrent ? 'active-line' : ''}">
            <span class="code-line-num">${i + 1}</span>
            <code>${line.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code>
          </div>
        `;
      }).join('');
    }

    // 4. Update Telemetry Metrics
    const compEl = document.getElementById('tel-comparisons');
    const swapEl = document.getElementById('tel-swaps');
    if (compEl) compEl.textContent = step.comparisons;
    if (swapEl) swapEl.textContent = step.swaps;

    // 5. Update Navigation Disabled State
    if (this.prevBtn) this.prevBtn.disabled = (this.stepIdx === 0);
    if (this.nextBtn) this.nextBtn.disabled = (this.stepIdx === this.steps.length - 1);
  }

  renderAlgorithmInfo() {
    const info = ALGORITHM_INFO[this.algoKey];
    const bestEl = document.getElementById('tel-best');
    const avgEl = document.getElementById('tel-avg');
    const worstEl = document.getElementById('tel-worst');
    const spaceEl = document.getElementById('tel-space');
    const stableEl = document.getElementById('tel-stable');
    const tipEl = document.getElementById('sort-algo-tip');

    if (bestEl) bestEl.textContent = info.timeBest;
    if (avgEl) avgEl.textContent = info.timeAvg;
    if (worstEl) worstEl.textContent = info.timeWorst;
    if (spaceEl) spaceEl.textContent = info.space;
    if (stableEl) {
      stableEl.textContent = info.stableText || (info.stable ? 'Yes (Stable)' : 'No (Unstable)');
      stableEl.className = `telemetry-card-val ${info.stable ? 'emerald' : 'amber'}`;
    }
    if (tipEl) {
      tipEl.innerHTML = `💡 <strong>How it works:</strong> ${info.subtitle}`;
    }
  }
}

class DualRaceController {
  constructor() {
    this.dataset = [170, 45, 75, 90, 802, 24, 2, 66, 321, 54, 98, 412];
    this.algo1 = 'bubble';
    this.algo2 = 'radix';
    this.steps1 = [];
    this.steps2 = [];
    this.idx1 = 0;
    this.idx2 = 0;
    this.isRacing = false;
    this.raceTimer = null;
  }

  init() {
    this.stage1 = document.getElementById('race-stage-1');
    this.stage2 = document.getElementById('race-stage-2');
    this.startBtn = document.getElementById('race-start-btn');
    this.resetBtn = document.getElementById('race-reset-btn');
    this.winnerBanner = document.getElementById('race-winner-banner');

    if (!this.stage1 || !this.stage2) return;

    this.bindEvents();
    this.resetRace();
  }

  bindEvents() {
    const sel1 = document.getElementById('race-algo-1-select');
    const sel2 = document.getElementById('race-algo-2-select');

    if (sel1) {
      sel1.addEventListener('change', (e) => {
        this.algo1 = e.target.value;
        this.resetRace();
      });
    }
    if (sel2) {
      sel2.addEventListener('change', (e) => {
        this.algo2 = e.target.value;
        this.resetRace();
      });
    }

    if (this.startBtn) {
      this.startBtn.addEventListener('click', () => {
        if (this.isRacing) this.pauseRace();
        else this.startRace();
      });
    }

    if (this.resetBtn) {
      this.resetBtn.addEventListener('click', () => {
        this.resetRace();
      });
    }
  }

  resetRace() {
    this.isRacing = false;
    if (this.raceTimer) clearTimeout(this.raceTimer);
    this.idx1 = 0;
    this.idx2 = 0;
    this.steps1 = generateSortingSteps(this.algo1, this.dataset);
    this.steps2 = generateSortingSteps(this.algo2, this.dataset);
    if (this.startBtn) this.startBtn.innerHTML = '<span>🏁</span> Start Race';
    if (this.winnerBanner) this.winnerBanner.style.display = 'none';

    this.renderSide(1, this.stage1, this.steps1[0], this.algo1);
    this.renderSide(2, this.stage2, this.steps2[0], this.algo2);
  }

  startRace() {
    if (this.isRacing) return;
    this.isRacing = true;
    if (this.startBtn) this.startBtn.innerHTML = '<span>⏸</span> Pause Race';

    const loop = () => {
      if (!this.isRacing) return;
      let hasAdv1 = false;
      let hasAdv2 = false;

      if (this.idx1 < this.steps1.length - 1) {
        this.idx1++;
        hasAdv1 = true;
        this.renderSide(1, this.stage1, this.steps1[this.idx1], this.algo1);
      }

      if (this.idx2 < this.steps2.length - 1) {
        this.idx2++;
        hasAdv2 = true;
        this.renderSide(2, this.stage2, this.steps2[this.idx2], this.algo2);
      }

      if (hasAdv1 || hasAdv2) {
        this.raceTimer = setTimeout(loop, 90);
      } else {
        this.isRacing = false;
        if (this.startBtn) this.startBtn.innerHTML = '<span>🏁</span> Race Finished';
        this.declareWinner();
      }
    };

    loop();
  }

  pauseRace() {
    this.isRacing = false;
    if (this.raceTimer) clearTimeout(this.raceTimer);
    if (this.startBtn) this.startBtn.innerHTML = '<span>▶</span> Resume Race';
  }

  renderSide(sideNum, stage, step, algoKey) {
    if (!stage || !step) return;
    const maxVal = Math.max(...step.array, 1);

    stage.innerHTML = `
      <div class="bar-chart-stage" style="height: 180px;">
        ${step.array.map((val, idx) => {
          let stateClass = 'state-default';
          if (step.sorted.includes(idx)) stateClass = 'state-sorted';
          else if (step.swapping.includes(idx)) stateClass = 'state-swapping';
          else if (step.comparing.includes(idx)) stateClass = 'state-comparing';
          const heightPct = Math.max(12, Math.round((val / maxVal) * 100));
          return `
            <div class="sort-bar-column">
              <div class="sort-bar ${stateClass}" style="height: ${heightPct}%;"></div>
            </div>
          `;
        }).join('')}
      </div>
    `;

    const compEl = document.getElementById(`race-comp-${sideNum}`);
    const swapEl = document.getElementById(`race-swap-${sideNum}`);
    const stepEl = document.getElementById(`race-step-${sideNum}`);

    if (compEl) compEl.textContent = step.comparisons;
    if (swapEl) swapEl.textContent = step.swaps;
    if (stepEl) stepEl.textContent = (sideNum === 1 ? this.idx1 : this.idx2) + 1;
  }

  declareWinner() {
    if (!this.winnerBanner) return;
    const name1 = ALGORITHM_INFO[this.algo1].name;
    const name2 = ALGORITHM_INFO[this.algo2].name;
    const ops1 = this.steps1[this.steps1.length - 1].comparisons + this.steps1[this.steps1.length - 1].swaps;
    const ops2 = this.steps2[this.steps2.length - 1].comparisons + this.steps2[this.steps2.length - 1].swaps;

    let text = '';
    if (this.steps1.length < this.steps2.length) {
      const speedup = (this.steps2.length / this.steps1.length).toFixed(1);
      text = `🏆 <strong>${name1} Won!</strong> Completed in ${this.steps1.length} steps (${ops1} total operations) vs ${name2}'s ${this.steps2.length} steps (${ops2} ops) — <strong>${speedup}x faster</strong>!`;
    } else if (this.steps2.length < this.steps1.length) {
      const speedup = (this.steps1.length / this.steps2.length).toFixed(1);
      text = `🏆 <strong>${name2} Won!</strong> Completed in ${this.steps2.length} steps (${ops2} total operations) vs ${name1}'s ${this.steps1.length} steps (${ops1} ops) — <strong>${speedup}x faster</strong>!`;
    } else {
      text = `🤝 <strong>Tie!</strong> Both algorithms completed in identical step counts (${this.steps1.length} steps).`;
    }

    this.winnerBanner.innerHTML = text;
    this.winnerBanner.style.display = 'block';
  }
}


/* ============================================================
   8. INITIALIZATION ON DOM CONTENT LOADED
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavigation();
  initCodeCopy();
  initHints();
  initTopicSyntaxHighlighting();

  // Mode Switcher Tabs Handler (Sorting Lab vs Array Ops vs Race Mode)
  const modeTabs = document.querySelectorAll('.lab-mode-tab');
  modeTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      modeTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const targetMode = tab.getAttribute('data-mode');

      const sortSec = document.getElementById('sorting-lab-section');
      const arraySec = document.getElementById('array-ops-section');
      const raceSec = document.getElementById('race-mode-section');

      if (sortSec) sortSec.style.display = (targetMode === 'sorting') ? 'block' : 'none';
      if (arraySec) arraySec.style.display = (targetMode === 'array-ops') ? 'block' : 'none';
      if (raceSec) raceSec.style.display = (targetMode === 'race') ? 'block' : 'none';
    });
  });

  // Initialize Sorting Lab Controller
  if (document.getElementById('sort-stage')) {
    const sortingLab = new SortingLabController();
    sortingLab.init();
  }

  // Initialize Dual Race Controller
  if (document.getElementById('race-stage-1')) {
    const dualRace = new DualRaceController();
    dualRace.init();
  }

  // Initialize Array Ops Visualizer if canvas element is present
  if (document.getElementById('viz-canvas')) {
    const vizEngine = new ArrayVisualizerEngine(
      'viz-canvas',
      'log-message',
      'log-step',
      'log-speed'
    );
    vizEngine.render();

    // Bind Visualizer buttons
    const accessBtn = document.getElementById('op-access-btn');
    if (accessBtn) {
      accessBtn.addEventListener('click', () => {
        const idx = parseInt(document.getElementById('access-idx-input').value, 10) || 0;
        vizEngine.access(idx);
      });
    }

    const searchBtn = document.getElementById('op-search-btn');
    if (searchBtn) {
      searchBtn.addEventListener('click', () => {
        const val = parseInt(document.getElementById('search-val-input').value, 10) || 0;
        vizEngine.linearSearch(val);
      });
    }

    const binarySearchBtn = document.getElementById('op-binary-search-btn');
    if (binarySearchBtn) {
      binarySearchBtn.addEventListener('click', () => {
        const val = parseInt(document.getElementById('binary-search-val-input').value, 10) || 0;
        vizEngine.binarySearch(val);
      });
    }

    const insertBtn = document.getElementById('op-insert-btn');
    if (insertBtn) {
      insertBtn.addEventListener('click', () => {
        const idx = parseInt(document.getElementById('insert-idx-input').value, 10) || 0;
        const val = parseInt(document.getElementById('insert-val-input').value, 10) || 99;
        vizEngine.insert(idx, val);
      });
    }

    const deleteBtn = document.getElementById('op-delete-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => {
        const idx = parseInt(document.getElementById('delete-idx-input').value, 10) || 0;
        vizEngine.delete(idx);
      });
    }

    const resetBtn = document.getElementById('op-reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        vizEngine.reset();
      });
    }

    const speedSlider = document.getElementById('speed-slider');
    if (speedSlider) {
      speedSlider.addEventListener('input', (e) => {
        vizEngine.setSpeed(parseInt(e.target.value, 10));
      });
    }
  }

  // Initialize Video Language Switcher
  const videoIframe = document.getElementById('walkthrough-video-frame');
  if (videoIframe) {
    const videoBtns = document.querySelectorAll('.video-lang-btn');
    videoBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const lang = btn.getAttribute('data-lang');
        switchVideoLang(lang);
      });
    });
  }

  // Initialize Quiz if container element is present
  if (document.getElementById('quiz-container')) {
    const quizCtrl = new QuizController();
    quizCtrl.init();
  }
});

const VIDEO_LECTURES = {
  en: {
    title: 'CS50 Harvard Array Lecture (English)',
    src: 'https://www.youtube-nocookie.com/embed/h5Gc1n8ZuU8?start=4370'
  },
  hi: {
    title: 'Codeitup C Array Tutorial (Hindi)',
    src: 'https://www.youtube-nocookie.com/embed/bnL5PtGbRRU'
  }
};

function switchVideoLang(lang) {
  const iframe = document.getElementById('walkthrough-video-frame');
  const label = document.getElementById('video-current-title');
  const btns = document.querySelectorAll('.video-lang-btn');

  if (VIDEO_LECTURES[lang]) {
    if (iframe) iframe.src = VIDEO_LECTURES[lang].src;
    if (label) label.textContent = VIDEO_LECTURES[lang].title;

    btns.forEach(btn => {
      if (btn.getAttribute('data-lang') === lang) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }
}
window.switchVideoLang = switchVideoLang;



