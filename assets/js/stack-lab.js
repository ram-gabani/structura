/**
 * STACK INTERACTIVE LAB ENGINE
 * Vertical LIFO Stack Visualizer with Top Pointer Tracking,
 * Push, Pop, Peek, Overflow & Underflow Detection, and Operation Telemetry.
 */

class StackLabEngine {
  constructor() {
    this.capacity = 6;
    this.stack = [15, 32, 48]; // default items
    this.isAnimating = false;
    this.speedMs = 500;

    this.wellEl = document.getElementById('stack-well');
    this.logMsgEl = document.getElementById('stack-log-msg');
    this.logStepEl = document.getElementById('stack-log-step');
    this.logStatusEl = document.getElementById('stack-log-status');
    this.topIdxEl = document.getElementById('stack-top-idx');
    this.sizeEl = document.getElementById('stack-size-val');
    this.capacityEl = document.getElementById('stack-cap-val');
  }

  setSpeed(val) {
    this.speedMs = 1200 - (val * 200);
  }

  sleep() {
    return new Promise(resolve => setTimeout(resolve, this.speedMs));
  }

  updateLog(message, step = 'Idle', statusBadge = 'Ready') {
    if (this.logMsgEl) this.logMsgEl.textContent = message;
    if (this.logStepEl) this.logStepEl.textContent = step;
    if (this.logStatusEl) this.logStatusEl.textContent = statusBadge;
  }

  updateTelemetry() {
    const top = this.stack.length - 1;
    if (this.topIdxEl) this.topIdxEl.textContent = top >= 0 ? `[${top}]` : '-1 (Empty)';
    if (this.sizeEl) this.sizeEl.textContent = `${this.stack.length}`;
    if (this.capacityEl) this.capacityEl.textContent = `${this.capacity}`;
  }

  setDisabled(disabled) {
    this.isAnimating = disabled;
    const inputs = document.querySelectorAll('.stack-btn, .stack-input');
    inputs.forEach(el => { el.disabled = disabled; });
    const resetBtn = document.getElementById('stack-reset-btn');
    if (resetBtn) resetBtn.disabled = false;
  }

  render(highlightIdx = -1, stateClass = 'top-active') {
    if (!this.wellEl) return;
    this.updateTelemetry();

    let html = `
      <div class="stack-well-label">Stack Base [Index 0]</div>
    `;

    for (let i = 0; i < this.capacity; i++) {
      const hasItem = i < this.stack.length;
      const isTop = i === this.stack.length - 1;
      const isHighlighted = i === highlightIdx;

      if (hasItem) {
        const val = this.stack[i];
        html += `
          <div class="stack-slot" id="slot-${i}">
            <div class="stack-element ${isHighlighted ? stateClass : (isTop ? 'top-active' : '')}">
              <span style="font-size: 0.72rem; color: var(--text-muted);">Slot [${i}]</span>
              <span>${val}</span>
            </div>
            ${isTop ? `<div class="stack-top-pointer">TOP = ${i}</div>` : ''}
          </div>
        `;
      } else {
        html += `
          <div class="stack-slot" id="slot-${i}">
            <span>[ Slot ${i} ]</span>
            <span style="font-size: 0.68rem; color: var(--text-muted); opacity: 0.6;">Empty</span>
          </div>
        `;
      }
    }

    this.wellEl.innerHTML = html;
  }

  async push(val) {
    if (this.isAnimating) return;
    if (this.stack.length >= this.capacity) {
      this.updateLog(`Stack Overflow Error! Cannot push ${val}. Capacity of ${this.capacity} slots is completely full.`, 'Overflow', '🚨 Overflow');
      return;
    }

    this.setDisabled(true);
    const newTop = this.stack.length;
    this.updateLog(`Checking isFull(): false. Incrementing top to ${newTop} and placing value ${val} at arr[${newTop}]...`, 'Pushing', '⚡ O(1)');
    await this.sleep();

    this.stack.push(val);
    this.render(newTop, 'top-active');
    this.updateLog(`Pushed value ${val} onto top of stack in O(1) time. TOP is now at Slot [${newTop}].`, 'Complete', '✓ Pushed');
    await this.sleep();

    this.setDisabled(false);
  }

  async pop() {
    if (this.isAnimating) return;
    if (this.stack.length === 0) {
      this.updateLog(`Stack Underflow Error! Cannot pop from an empty stack (top == -1).`, 'Underflow', '⚠️ Underflow');
      return;
    }

    this.setDisabled(true);
    const topIdx = this.stack.length - 1;
    const val = this.stack[topIdx];

    this.render(topIdx, 'pop-active');
    this.updateLog(`Reading top item ${val} from Slot [${topIdx}]. Decrementing TOP from ${topIdx} to ${topIdx - 1}...`, 'Popping', '⚡ O(1)');
    await this.sleep();

    this.stack.pop();
    this.render();
    this.updateLog(`Popped value ${val} from stack in O(1) time. Slot vacated.`, 'Complete', '✓ Popped');
    this.setDisabled(false);
  }

  async peek() {
    if (this.isAnimating) return;
    if (this.stack.length === 0) {
      this.updateLog(`Stack is empty (top == -1). Nothing to peek!`, 'Peek', '⚠️ Empty');
      return;
    }

    this.setDisabled(true);
    const topIdx = this.stack.length - 1;
    const val = this.stack[topIdx];

    this.render(topIdx, 'peek-active');
    this.updateLog(`Peek inspection: Top element is ${val} at Slot [${topIdx}]. Note that stack size is unchanged!`, 'Peeking', '🔍 O(1)');
    await this.sleep();

    this.render();
    this.setDisabled(false);
  }

  checkEmpty() {
    const empty = this.stack.length === 0;
    this.updateLog(`isEmpty() returned ${empty ? 'TRUE (top == -1)' : 'FALSE (top >= 0)'}. Current count: ${this.stack.length}.`, 'Check Empty', empty ? 'Empty' : 'Not Empty');
  }

  checkFull() {
    const full = this.stack.length >= this.capacity;
    this.updateLog(`isFull() returned ${full ? 'TRUE (top == MAX - 1)' : 'FALSE (slots available)'}. Capacity: ${this.capacity}.`, 'Check Full', full ? 'Full' : 'Not Full');
  }

  reset() {
    this.stack = [15, 32, 48];
    this.render();
    this.updateLog(`Stack reset to default initial state (3 items).`, 'Reset', 'Ready');
    this.setDisabled(false);
  }
}

// Auto-initialize when canvas exists
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('stack-well')) {
    const engine = new StackLabEngine();
    window.stackEngine = engine;
    engine.render();

    const pushBtn = document.getElementById('stack-push-btn');
    if (pushBtn) {
      pushBtn.addEventListener('click', () => {
        const val = parseInt(document.getElementById('stack-val-input').value, 10);
        if (!isNaN(val)) engine.push(val);
      });
    }

    const popBtn = document.getElementById('stack-pop-btn');
    if (popBtn) {
      popBtn.addEventListener('click', () => engine.pop());
    }

    const peekBtn = document.getElementById('stack-peek-btn');
    if (peekBtn) {
      peekBtn.addEventListener('click', () => engine.peek());
    }

    const isEmpBtn = document.getElementById('stack-empty-btn');
    if (isEmpBtn) {
      isEmpBtn.addEventListener('click', () => engine.checkEmpty());
    }

    const isFullBtn = document.getElementById('stack-full-btn');
    if (isFullBtn) {
      isFullBtn.addEventListener('click', () => engine.checkFull());
    }

    const resetBtn = document.getElementById('stack-reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => engine.reset());
    }

    const speedSlider = document.getElementById('stack-speed-slider');
    if (speedSlider) {
      speedSlider.addEventListener('input', (e) => {
        engine.setSpeed(parseInt(e.target.value, 10));
      });
    }
  }
});
