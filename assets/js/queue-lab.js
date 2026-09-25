/**
 * QUEUE INTERACTIVE LAB ENGINE
 * Linear & Circular FIFO Queue Visualizer with Front/Rear Pointer Tracking,
 * Modulo Wrap-Around Arithmetic, Enqueue, Dequeue, and Status Telemetry.
 */

class QueueLabEngine {
  constructor() {
    this.maxSize = 6;
    this.mode = 'circular'; // 'linear' or 'circular'
    this.queue = [null, null, null, null, null, null];
    this.front = 0;
    this.rear = 2;
    this.count = 3;

    // Seed initial values
    this.queue[0] = 12;
    this.queue[1] = 27;
    this.queue[2] = 45;

    this.isAnimating = false;
    this.speedMs = 500;

    this.stageEl = document.getElementById('queue-stage');
    this.tubeEl = document.getElementById('queue-tube');
    this.logMsgEl = document.getElementById('queue-log-msg');
    this.logStepEl = document.getElementById('queue-log-step');
    this.logStatusEl = document.getElementById('queue-log-status');
    this.frontIdxEl = document.getElementById('queue-front-idx');
    this.rearIdxEl = document.getElementById('queue-rear-idx');
    this.countEl = document.getElementById('queue-count-val');
    this.mathFormulaEl = document.getElementById('queue-math-formula');
  }

  setSpeed(val) {
    this.speedMs = 1200 - (val * 200);
  }

  sleep() {
    return new Promise(resolve => setTimeout(resolve, this.speedMs));
  }

  setMode(newMode) {
    this.mode = newMode;
    this.reset();
  }

  updateLog(message, step = 'Idle', statusBadge = 'Ready') {
    if (this.logMsgEl) this.logMsgEl.textContent = message;
    if (this.logStepEl) this.logStepEl.textContent = step;
    if (this.logStatusEl) this.logStatusEl.textContent = statusBadge;
  }

  updateTelemetry() {
    if (this.frontIdxEl) this.frontIdxEl.textContent = this.count > 0 ? `[${this.front}]` : '-1';
    if (this.rearIdxEl) this.rearIdxEl.textContent = this.count > 0 ? `[${this.rear}]` : '-1';
    if (this.countEl) this.countEl.textContent = `${this.count} / ${this.maxSize}`;
    if (this.mathFormulaEl) {
      if (this.mode === 'circular') {
        const nextRear = (this.rear + 1) % this.maxSize;
        this.mathFormulaEl.textContent = `Next Rear = (${this.rear} + 1) % ${this.maxSize} = Slot [${nextRear}]`;
      } else {
        this.mathFormulaEl.textContent = `Linear: Next Rear = ${this.rear + 1}`;
      }
    }
  }

  setDisabled(disabled) {
    this.isAnimating = disabled;
    const inputs = document.querySelectorAll('.queue-btn, .queue-input');
    inputs.forEach(el => { el.disabled = disabled; });
    const resetBtn = document.getElementById('queue-reset-btn');
    if (resetBtn) resetBtn.disabled = false;
  }

  render(highlightIdx = -1, stateClass = '') {
    if (!this.tubeEl) return;
    this.updateTelemetry();

    let html = '';
    for (let i = 0; i < this.maxSize; i++) {
      const val = this.queue[i];
      const isOccupied = val !== null;
      const isFront = isOccupied && (i === this.front);
      const isRear = isOccupied && (i === this.rear);
      const isBoth = isFront && isRear;
      const isHighlighted = i === highlightIdx;

      let cellClass = 'queue-cell';
      if (isBoth) cellClass += ' is-both';
      else if (isFront) cellClass += ' is-front';
      else if (isRear) cellClass += ' is-rear';

      if (isHighlighted && stateClass) cellClass += ` ${stateClass}`;

      html += `
        <div class="${cellClass}" id="queue-slot-${i}">
          ${isFront ? '<div class="queue-marker-badge queue-marker-front">FRONT ↓</div>' : ''}
          <span class="queue-cell-val">${isOccupied ? val : '—'}</span>
          <span class="queue-cell-idx">Slot [${i}]</span>
          ${isRear ? '<div class="queue-marker-badge queue-marker-rear">↑ REAR</div>' : ''}
        </div>
      `;
    }

    this.tubeEl.innerHTML = html;
  }

  async enqueue(val) {
    if (this.isAnimating) return;

    if (this.mode === 'linear') {
      if (this.rear >= this.maxSize - 1) {
        if (this.count < this.maxSize && this.front > 0) {
          this.updateLog(`False Overflow in Linear Queue! Rear has reached MAX-1, but slots at front are empty. Switch to Circular Queue to solve this!`, 'Linear Overflow', '⚠️ False Overflow');
        } else {
          this.updateLog(`Queue Overflow! Queue is completely full (${this.maxSize} items).`, 'Overflow', '🚨 Overflow');
        }
        return;
      }
    } else {
      if (this.count >= this.maxSize) {
        this.updateLog(`Circular Queue Overflow! Capacity (${this.maxSize}) is full.`, 'Overflow', '🚨 Overflow');
        return;
      }
    }

    this.setDisabled(true);

    let nextRear;
    if (this.count === 0) {
      this.front = 0;
      this.rear = 0;
      nextRear = 0;
    } else {
      nextRear = this.mode === 'circular' ? (this.rear + 1) % this.maxSize : this.rear + 1;
    }

    this.updateLog(`Calculating insertion slot: Rear advances to [${nextRear}]. Writing value ${val}...`, 'Enqueueing', '⚡ O(1)');
    await this.sleep();

    this.rear = nextRear;
    this.queue[this.rear] = val;
    this.count++;

    this.render(this.rear, 'is-rear');
    this.updateLog(`Enqueued ${val} at Slot [${this.rear}] in O(1) time. New count: ${this.count}.`, 'Complete', '✓ Enqueued');
    await this.sleep();

    this.setDisabled(false);
  }

  async dequeue() {
    if (this.isAnimating) return;
    if (this.count === 0) {
      this.updateLog(`Queue Underflow! Queue is completely empty. Cannot dequeue.`, 'Underflow', '⚠️ Underflow');
      return;
    }

    this.setDisabled(true);
    const val = this.queue[this.front];

    this.updateLog(`Reading front value ${val} from Slot [${this.front}]. Moving Front pointer forward...`, 'Dequeuing', '⚡ O(1)');
    this.render(this.front, 'is-front');
    await this.sleep();

    this.queue[this.front] = null;
    this.count--;

    if (this.count === 0) {
      this.front = 0;
      this.rear = -1;
    } else {
      this.front = this.mode === 'circular' ? (this.front + 1) % this.maxSize : this.front + 1;
    }

    this.render();
    this.updateLog(`Dequeued ${val} in O(1) time. Front is now at Slot [${this.count > 0 ? this.front : -1}].`, 'Complete', '✓ Dequeued');
    this.setDisabled(false);
  }

  async peek() {
    if (this.isAnimating) return;
    if (this.count === 0) {
      this.updateLog(`Queue is empty. Front points to nothing.`, 'Peek', '⚠️ Empty');
      return;
    }

    this.setDisabled(true);
    const val = this.queue[this.front];
    this.updateLog(`Peek Inspection: Front element is ${val} at Slot [${this.front}]. FIFO order preserved.`, 'Peeking', '🔍 O(1)');
    this.render(this.front, 'is-front');
    await this.sleep();

    this.render();
    this.setDisabled(false);
  }

  reset() {
    this.queue = [12, 27, 45, null, null, null];
    this.front = 0;
    this.rear = 2;
    this.count = 3;
    this.render();
    this.updateLog(`Queue reset to default state (${this.mode.toUpperCase()} mode).`, 'Reset', 'Ready');
    this.setDisabled(false);
  }
}

// Auto-initialize when canvas exists
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('queue-tube')) {
    const engine = new QueueLabEngine();
    window.queueEngine = engine;
    engine.render();

    const enqBtn = document.getElementById('queue-enq-btn');
    if (enqBtn) {
      enqBtn.addEventListener('click', () => {
        const val = parseInt(document.getElementById('queue-val-input').value, 10);
        if (!isNaN(val)) engine.enqueue(val);
      });
    }

    const deqBtn = document.getElementById('queue-deq-btn');
    if (deqBtn) {
      deqBtn.addEventListener('click', () => engine.dequeue());
    }

    const peekBtn = document.getElementById('queue-peek-btn');
    if (peekBtn) {
      peekBtn.addEventListener('click', () => engine.peek());
    }

    const resetBtn = document.getElementById('queue-reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => engine.reset());
    }

    const modeLinearBtn = document.getElementById('queue-mode-linear');
    const modeCircularBtn = document.getElementById('queue-mode-circular');

    if (modeLinearBtn && modeCircularBtn) {
      modeLinearBtn.addEventListener('click', () => {
        modeLinearBtn.classList.add('active');
        modeCircularBtn.classList.remove('active');
        engine.setMode('linear');
      });

      modeCircularBtn.addEventListener('click', () => {
        modeCircularBtn.classList.add('active');
        modeLinearBtn.classList.remove('active');
        engine.setMode('circular');
      });
    }

    const speedSlider = document.getElementById('queue-speed-slider');
    if (speedSlider) {
      speedSlider.addEventListener('input', (e) => {
        engine.setSpeed(parseInt(e.target.value, 10));
      });
    }
  }
});
