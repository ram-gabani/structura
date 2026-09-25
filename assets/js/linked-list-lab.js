/**
 * LINKED LIST INTERACTIVE LAB ENGINE
 * Singly Linked List Simulation with Node-Level Memory Pointers,
 * Insertion, Deletion, Search, and Step-by-Step Operation Telemetry.
 */

class LinkedListLabEngine {
  constructor() {
    this.nodes = [10, 24, 38, 52];
    this.baseAddress = 0x3000;
    this.nodeAddresses = [0x3010, 0x3048, 0x3080, 0x30C0];
    this.isAnimating = false;
    this.speedMs = 600;

    this.stageEl = document.getElementById('ll-stage');
    this.logMsgEl = document.getElementById('ll-log-msg');
    this.logStepEl = document.getElementById('ll-log-step');
    this.logStatusEl = document.getElementById('ll-log-status');
    this.telemetryCountEl = document.getElementById('ll-node-count');
    this.telemetryHeadEl = document.getElementById('ll-head-addr');
  }

  setSpeed(val) {
    this.speedMs = 1400 - (val * 240);
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
    if (this.telemetryCountEl) this.telemetryCountEl.textContent = `${this.nodes.length} Nodes`;
    if (this.telemetryHeadEl) {
      this.telemetryHeadEl.textContent = this.nodes.length > 0 
        ? `0x${this.nodeAddresses[0].toString(16).toUpperCase()}` 
        : 'NULL';
    }
  }

  setDisabled(disabled) {
    this.isAnimating = disabled;
    const inputs = document.querySelectorAll('.ll-control-btn, .ll-input');
    inputs.forEach(el => { el.disabled = disabled; });
    const resetBtn = document.getElementById('ll-reset-btn');
    if (resetBtn) resetBtn.disabled = false;
  }

  render(activeIdx = -1, statusClass = 'active-cyan') {
    if (!this.stageEl) return;
    this.updateTelemetry();

    if (this.nodes.length === 0) {
      this.stageEl.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.75rem; margin: auto; color: var(--text-muted); font-family: 'JetBrains Mono', monospace;">
          <div class="ll-head-label">HEAD</div>
          <span style="font-size: 1.2rem; color: var(--brand);">&rarr;</span>
          <div class="ll-null-badge">NULL (List is Empty)</div>
        </div>
      `;
      return;
    }

    let html = `
      <div class="ll-head-label">HEAD &rarr;</div>
    `;

    this.nodes.forEach((val, idx) => {
      const isHighlighted = idx === activeIdx;
      const addrHex = '0x' + this.nodeAddresses[idx].toString(16).toUpperCase();
      const nextHex = idx < this.nodes.length - 1 
        ? '0x' + this.nodeAddresses[idx + 1].toString(16).toUpperCase()
        : 'NULL';

      html += `
        <div class="ll-node-wrapper" id="ll-node-wrap-${idx}">
          <div class="ll-node ${isHighlighted ? statusClass : ''}" id="ll-node-${idx}">
            <div class="ll-data-field">
              <span class="ll-field-label">${addrHex}</span>
              <span>${val}</span>
            </div>
            <div class="ll-ptr-field">
              <span class="ll-field-label">next</span>
              <span style="color: ${nextHex === 'NULL' ? 'var(--danger)' : 'var(--brand)'};">${nextHex}</span>
            </div>
          </div>
          <div class="ll-arrow-connector">&rarr;</div>
        </div>
      `;
    });

    html += `<div class="ll-null-badge">NULL</div>`;
    this.stageEl.innerHTML = html;
  }

  generateAddress() {
    return 0x3000 + Math.floor(Math.random() * 0x0F00);
  }

  async insertBeginning(val) {
    if (this.isAnimating) return;
    this.setDisabled(true);

    this.updateLog(`Allocating new node with malloc(sizeof(struct Node)). Setting data = ${val}...`, 'Allocation', '⏳ In Progress');
    await this.sleep();

    const newAddr = this.generateAddress();
    this.nodes.unshift(val);
    this.nodeAddresses.unshift(newAddr);

    this.render(0, 'active-cyan');
    this.updateLog(`Linked new node at address 0x${newAddr.toString(16).toUpperCase()}. Updated HEAD to point to new node in O(1) time.`, 'Complete', '✓ Success');
    await this.sleep();

    this.render(0, 'found-green');
    this.setDisabled(false);
  }

  async insertEnd(val) {
    if (this.isAnimating) return;
    this.setDisabled(true);

    if (this.nodes.length === 0) {
      await this.insertBeginning(val);
      return;
    }

    this.updateLog(`Traversing from HEAD to find the last node where next == NULL...`, 'Traversing', '🚶 O(n)');
    for (let i = 0; i < this.nodes.length; i++) {
      this.render(i, 'active-cyan');
      this.updateLog(`Inspecting Node [${i}]: data = ${this.nodes[i]}...`, `Step ${i + 1}`, '🚶 Scanning');
      await this.sleep();
    }

    const newAddr = this.generateAddress();
    this.nodes.push(val);
    this.nodeAddresses.push(newAddr);

    const lastIdx = this.nodes.length - 1;
    this.render(lastIdx, 'active-cyan');
    this.updateLog(`Allocated Node (0x${newAddr.toString(16).toUpperCase()}) and linked previous tail to this new node. New node's next = NULL.`, 'Linking', '✓ Success');
    await this.sleep();

    this.render(lastIdx, 'found-green');
    this.setDisabled(false);
  }

  async insertAtPosition(pos, val) {
    if (this.isAnimating) return;
    if (pos <= 0 || pos > this.nodes.length + 1) {
      this.updateLog(`Invalid position ${pos}! Valid range is 1 to ${this.nodes.length + 1}.`, 'Error', '⚠️ Out of Bounds');
      return;
    }

    if (pos === 1) {
      await this.insertBeginning(val);
      return;
    }
    if (pos === this.nodes.length + 1) {
      await this.insertEnd(val);
      return;
    }

    this.setDisabled(true);
    this.updateLog(`Traversing to position ${pos - 1} to update next pointer...`, 'Traversing', '🚶 O(pos)');

    for (let i = 0; i < pos - 1; i++) {
      this.render(i, 'active-cyan');
      this.updateLog(`Step ${i + 1}: Visiting node at index ${i}...`, `Step ${i + 1}`, '🚶 Scanning');
      await this.sleep();
    }

    const newAddr = this.generateAddress();
    this.nodes.splice(pos - 1, 0, val);
    this.nodeAddresses.splice(pos - 1, 0, newAddr);

    this.render(pos - 1, 'active-cyan');
    this.updateLog(`Inserted node ${val} at position ${pos}. Rewired next pointers.`, 'Complete', '✓ Success');
    await this.sleep();

    this.render(pos - 1, 'found-green');
    this.setDisabled(false);
  }

  async deleteBeginning() {
    if (this.isAnimating) return;
    if (this.nodes.length === 0) {
      this.updateLog(`Underflow: Cannot delete from an empty list!`, 'Underflow', '⚠️ Empty List');
      return;
    }

    this.setDisabled(true);
    this.render(0, 'deleted-rose');
    this.updateLog(`Identifying first node (data = ${this.nodes[0]}). Advancing HEAD = HEAD->next and calling free(temp)...`, 'Freeing Node', '⏳ O(1)');
    await this.sleep();

    const val = this.nodes.shift();
    this.nodeAddresses.shift();

    this.render();
    this.updateLog(`Deleted node ${val} from beginning in O(1) time. Memory freed safely.`, 'Complete', '✓ Deleted');
    this.setDisabled(false);
  }

  async deleteEnd() {
    if (this.isAnimating) return;
    if (this.nodes.length === 0) {
      this.updateLog(`Underflow: Cannot delete from an empty list!`, 'Underflow', '⚠️ Empty List');
      return;
    }

    if (this.nodes.length === 1) {
      await this.deleteBeginning();
      return;
    }

    this.setDisabled(true);
    this.updateLog(`Traversing to second-to-last node to update its next pointer to NULL...`, 'Traversing', '🚶 O(n)');

    for (let i = 0; i < this.nodes.length - 1; i++) {
      this.render(i, 'active-cyan');
      this.updateLog(`Traversing through node ${i}: data = ${this.nodes[i]}...`, `Step ${i + 1}`, '🚶 Scanning');
      await this.sleep();
    }

    const lastIdx = this.nodes.length - 1;
    this.render(lastIdx, 'deleted-rose');
    this.updateLog(`Freeing tail node (data = ${this.nodes[lastIdx]}). Setting previous node's next = NULL.`, 'Freeing Tail', '⏳ O(n)');
    await this.sleep();

    const val = this.nodes.pop();
    this.nodeAddresses.pop();

    this.render();
    this.updateLog(`Successfully deleted tail node ${val}. Tail is now set to NULL.`, 'Complete', '✓ Deleted');
    this.setDisabled(false);
  }

  async deleteAtPosition(pos) {
    if (this.isAnimating) return;
    if (pos <= 0 || pos > this.nodes.length) {
      this.updateLog(`Invalid position ${pos}! Valid range is 1 to ${this.nodes.length}.`, 'Error', '⚠️ Out of Bounds');
      return;
    }

    if (pos === 1) {
      await this.deleteBeginning();
      return;
    }

    this.setDisabled(true);
    this.updateLog(`Traversing to node prior to position ${pos}...`, 'Traversing', '🚶 O(pos)');

    for (let i = 0; i < pos - 1; i++) {
      this.render(i, 'active-cyan');
      await this.sleep();
    }

    this.render(pos - 1, 'deleted-rose');
    this.updateLog(`Bypassing node at position ${pos} (data = ${this.nodes[pos - 1]}) and freeing memory...`, 'Freeing Node', '⏳ O(pos)');
    await this.sleep();

    const val = this.nodes.splice(pos - 1, 1)[0];
    this.nodeAddresses.splice(pos - 1, 1);

    this.render();
    this.updateLog(`Deleted node ${val} at position ${pos}. Pointers rewired cleanly.`, 'Complete', '✓ Deleted');
    this.setDisabled(false);
  }

  async search(val) {
    if (this.isAnimating) return;
    if (this.nodes.length === 0) {
      this.updateLog(`List is empty. Value ${val} not found.`, 'Search Empty', '❌ Not Found');
      return;
    }

    this.setDisabled(true);
    this.updateLog(`Starting linear traversal to find value ${val}...`, 'Search Started', '🔍 Sequential Scan');
    await this.sleep();

    let found = false;
    for (let i = 0; i < this.nodes.length; i++) {
      this.render(i, 'active-cyan');
      this.updateLog(`Inspecting Node ${i + 1}: data (${this.nodes[i]}) == target (${val})?`, `Checking [${i + 1}]`, '🔍 Scanning');
      await this.sleep();

      if (this.nodes[i] === val) {
        this.render(i, 'found-green');
        this.updateLog(`Target ${val} found at Position ${i + 1} (Memory: 0x${this.nodeAddresses[i].toString(16).toUpperCase()})!`, 'Found!', '✓ Found');
        found = true;
        break;
      }
    }

    if (!found) {
      this.render();
      this.updateLog(`Reached NULL. Target ${val} does not exist in the linked list.`, 'Finished', '❌ Not Found');
    }

    this.setDisabled(false);
  }

  reset() {
    this.nodes = [10, 24, 38, 52];
    this.nodeAddresses = [0x3010, 0x3048, 0x3080, 0x30C0];
    this.isAnimating = false;
    this.render();
    this.updateLog(`Linked list reset to default 4-node state.`, 'Reset Complete', 'Ready');
    this.setDisabled(false);
  }
}

// Auto-initialize when canvas exists
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('ll-stage')) {
    const engine = new LinkedListLabEngine();
    window.linkedListEngine = engine;
    engine.render();

    // Bind Controls
    const insertBegBtn = document.getElementById('ll-insert-beg-btn');
    if (insertBegBtn) {
      insertBegBtn.addEventListener('click', () => {
        const val = parseInt(document.getElementById('ll-val-input').value, 10);
        if (!isNaN(val)) engine.insertBeginning(val);
      });
    }

    const insertEndBtn = document.getElementById('ll-insert-end-btn');
    if (insertEndBtn) {
      insertEndBtn.addEventListener('click', () => {
        const val = parseInt(document.getElementById('ll-val-input').value, 10);
        if (!isNaN(val)) engine.insertEnd(val);
      });
    }

    const insertPosBtn = document.getElementById('ll-insert-pos-btn');
    if (insertPosBtn) {
      insertPosBtn.addEventListener('click', () => {
        const val = parseInt(document.getElementById('ll-val-input').value, 10);
        const pos = parseInt(document.getElementById('ll-pos-input').value, 10);
        if (!isNaN(val) && !isNaN(pos)) engine.insertAtPosition(pos, val);
      });
    }

    const delBegBtn = document.getElementById('ll-del-beg-btn');
    if (delBegBtn) {
      delBegBtn.addEventListener('click', () => engine.deleteBeginning());
    }

    const delEndBtn = document.getElementById('ll-del-end-btn');
    if (delEndBtn) {
      delEndBtn.addEventListener('click', () => engine.deleteEnd());
    }

    const delPosBtn = document.getElementById('ll-del-pos-btn');
    if (delPosBtn) {
      delPosBtn.addEventListener('click', () => {
        const pos = parseInt(document.getElementById('ll-pos-input').value, 10);
        if (!isNaN(pos)) engine.deleteAtPosition(pos);
      });
    }

    const searchBtn = document.getElementById('ll-search-btn');
    if (searchBtn) {
      searchBtn.addEventListener('click', () => {
        const val = parseInt(document.getElementById('ll-search-input').value, 10);
        if (!isNaN(val)) engine.search(val);
      });
    }

    const resetBtn = document.getElementById('ll-reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => engine.reset());
    }

    const speedSlider = document.getElementById('ll-speed-slider');
    if (speedSlider) {
      speedSlider.addEventListener('input', (e) => {
        engine.setSpeed(parseInt(e.target.value, 10));
      });
    }
  }
});
