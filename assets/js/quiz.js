/**
 * ARRAY MASTER — INTERACTIVE QUIZ CONTROLLER
 * High-polish, theme-aware self-check quiz
 */

export class ArrayQuizController {
  constructor(questions, containerId) {
    this.questions = questions;
    this.container = document.getElementById(containerId);
    this.currentIndex = 0;
    this.score = 0;
    this.answered = false;
  }

  render() {
    if (!this.container) return;

    if (this.currentIndex >= this.questions.length) {
      this.renderSummary();
      return;
    }

    const currentQ = this.questions[this.currentIndex];

    this.container.innerHTML = `
      <div class="quiz-header">
        <span class="quiz-step-count">Question ${this.currentIndex + 1} of ${this.questions.length}</span>
        <span class="quiz-score-badge">Score: ${this.score}/${this.questions.length}</span>
      </div>

      <div class="quiz-question-text">${currentQ.question}</div>

      <div class="quiz-options-list" id="quiz-options">
        ${currentQ.options.map((opt, i) => `
          <button class="quiz-option-btn" data-index="${i}">
            <span style="font-family: 'JetBrains Mono', monospace; font-weight: bold; color: var(--accent-primary-text);">[ ${String.fromCharCode(65 + i)} ]</span>
            <span>${opt}</span>
          </button>
        `).join('')}
      </div>

      <div class="quiz-feedback-box" id="quiz-feedback"></div>

      <div class="quiz-actions">
        <button class="btn-primary" id="quiz-next-btn" disabled>Next Question &rarr;</button>
      </div>
    `;

    this.attachEvents();
  }

  attachEvents() {
    const optionsContainer = document.getElementById('quiz-options');
    const nextBtn = document.getElementById('quiz-next-btn');
    const feedbackBox = document.getElementById('quiz-feedback');
    const currentQ = this.questions[this.currentIndex];

    if (optionsContainer) {
      optionsContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('.quiz-option-btn');
        if (!btn || this.answered) return;

        this.answered = true;
        const selectedIdx = parseInt(btn.getAttribute('data-index'), 10);
        const isCorrect = (selectedIdx === currentQ.correctIndex);

        const allButtons = optionsContainer.querySelectorAll('.quiz-option-btn');
        allButtons.forEach((b, idx) => {
          b.disabled = true;
          if (idx === currentQ.correctIndex) {
            b.classList.add('selected-correct');
          } else if (idx === selectedIdx && !isCorrect) {
            b.classList.add('selected-wrong');
          }
        });

        if (isCorrect) {
          this.score++;
          feedbackBox.className = 'quiz-feedback-box correct';
          feedbackBox.innerHTML = `<strong>&check; Correct!</strong> ${currentQ.explanation}`;
        } else {
          feedbackBox.className = 'quiz-feedback-box wrong';
          feedbackBox.innerHTML = `<strong>&cross; Incorrect.</strong> ${currentQ.explanation}`;
        }

        const scoreBadge = this.container.querySelector('.quiz-score-badge');
        if (scoreBadge) {
          scoreBadge.textContent = `Score: ${this.score}/${this.questions.length}`;
        }

        if (nextBtn) {
          nextBtn.disabled = false;
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        this.currentIndex++;
        this.answered = false;
        this.render();
      });
    }
  }

  renderSummary() {
    const percentage = Math.round((this.score / this.questions.length) * 100);
    this.container.innerHTML = `
      <div style="text-align: center; padding: 2.5rem 1rem;">
        <div style="font-size: 3.25rem; margin-bottom: 1rem;">${percentage >= 75 ? '🏆' : '📚'}</div>
        <h3 style="font-size: 1.6rem; font-weight: 800; color: var(--text-primary); margin-bottom: 0.5rem;">Knowledge Check Complete!</h3>
        <p style="color: var(--text-secondary); font-size: 1.05rem; margin-bottom: 1.75rem;">
          You scored <strong>${this.score} / ${this.questions.length}</strong> (${percentage}%).
        </p>
        <button class="btn-primary" id="quiz-restart-btn">Retake Knowledge Check</button>
      </div>
    `;

    const restartBtn = document.getElementById('quiz-restart-btn');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        this.currentIndex = 0;
        this.score = 0;
        this.answered = false;
        this.render();
      });
    }
  }
}
