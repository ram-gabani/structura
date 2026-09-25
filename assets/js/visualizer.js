/**
 * ARRAY MASTER — INTERACTIVE VISUALIZER ENGINE
 * Simulates C Contiguous Memory Layout, Pointer Arithmetic, Shifting & Traversals
 */

export class ArrayVisualizerEngine {
  constructor(canvasContainerId, logMessageId, logStepId, logComplexityId) {
    this.canvas = document.getElementById(canvasContainerId);
    this.logMessage = document.getElementById(logMessageId);
    this.logStep = document.getElementById(logStepId);
    this.logComplexity = document.getElementById(logComplexityId);
    
    this.array = [15, 28, 42, 57, 73, 89];
    this.baseAddress = 0x2000;
    this.elementSize = 4; // 4 bytes for standard C int
    this.isAnimating = false;
    this.speedMs = 600;
  }

  setSpeed(speedVal) {
    // 1 (slow) to 5 (fast) -> 1200ms down to 200ms
    this.speedMs = 1400 - (speedVal * 240);
  }

  sleep() {
    return new Promise(resolve => setTimeout(resolve, this.speedMs));
  }

  updateLog(message, step = 'Idle', complexity = 'O(1)') {
    if (this.logMessage) this.logMessage.textContent = message;
    if (this.logStep) this.logStep.textContent = step;
    if (this.logComplexity) this.logComplexity.textContent = complexity;
  }

  render(highlightIdx = -1, statusClass = 'highlight') {
    if (!this.canvas) return;

    this.canvas.innerHTML = `
      <div class="array-strip">
        ${this.array.map((val, idx) => {
          const addrHex = '0x' + (this.baseAddress + (idx * this.elementSize)).toString(16).toUpperCase();
          const isHighlighted = (idx === highlightIdx);
          const slotClass = isHighlighted ? statusClass : '';
          return `
            <div class="array-slot ${slotClass}" id="viz-slot-${idx}">
              <span class="array-address">${addrHex}</span>
              <div class="array-box ${slotClass}">${val}</div>
              <span class="array-index">[ ${idx} ]</span>
              ${isHighlighted ? `<span class="pointer-badge">*(arr + ${idx})</span>` : ''}
            </div>
          `;
        }).join('')}
      </div>
    `;
  }


  async access(index) {
    if (this.isAnimating) return;
    this.isAnimating = true;

    if (index < 0 || index >= this.array.length) {
      this.updateLog(`Buffer Overflow / Segfault: Index [${index}] is outside bounds [0, ${this.array.length - 1}].`, 'Bounds Error', 'O(1)');
      this.isAnimating = false;
      return;
    }

    const targetAddr = '0x' + (this.baseAddress + (index * this.elementSize)).toString(16).toUpperCase();
    this.updateLog(`Calculating Address: Base (0x2000) + (${index} × 4 bytes) = ${targetAddr}`, 'Pointer Math', 'O(1) Constant Time');
    this.render(index, 'highlight');
    await this.sleep();

    this.updateLog(`Retrieved value ${this.array[index]} from ${targetAddr} in a single clock cycle!`, 'Access Success', 'O(1)');
    this.render(index, 'found');
    this.isAnimating = false;
  }

  async update(index, value) {
    if (this.isAnimating) return;
    this.isAnimating = true;

    if (index < 0 || index >= this.array.length) {
      this.updateLog(`Error: Index [${index}] is outside valid range.`, 'Bounds Error', 'O(1)');
      this.isAnimating = false;
      return;
    }

    const oldVal = this.array[index];
    this.render(index, 'highlight');
    this.updateLog(`Targeting slot arr[${index}] (old value: ${oldVal}) for overwrite...`, 'Register Write', 'O(1)');
    await this.sleep();

    this.array[index] = value;
    this.render(index, 'found');
    this.updateLog(`Overwrote arr[${index}] with new value ${value}.`, 'Updated', 'O(1)');
    this.isAnimating = false;
  }

  async linearSearch(target) {
    if (this.isAnimating) return;
    this.isAnimating = true;

    this.updateLog(`Starting linear scan from index 0 for target value ${target}...`, 'Search Start', 'O(n) Worst-Case');

    for (let i = 0; i < this.array.length; i++) {
      this.render(i, 'highlight');
      this.updateLog(`Comparing arr[${i}] (${this.array[i]}) == ${target}?`, `Scan Step ${i + 1}/${this.array.length}`, 'O(n)');
      await this.sleep();

      if (this.array[i] === target) {
        this.render(i, 'found');
        this.updateLog(`Match Found! Value ${target} located at index [${i}] at address *(arr + ${i}).`, 'Found', 'O(n)');
        this.isAnimating = false;
        return;
      }
    }

    this.render(-1);
    this.updateLog(`Search Complete: Target ${target} does not exist in the array.`, 'Not Found', 'O(n)');
    this.isAnimating = false;
  }

  async insert(index, value) {
    if (this.isAnimating) return;
    this.isAnimating = true;

    if (this.array.length >= 10) {
      this.updateLog('Capacity Exceeded: Maximum visualizer buffer capacity (10 elements) reached.', 'Overflow', 'N/A');
      this.isAnimating = false;
      return;
    }

    if (index < 0 || index > this.array.length) {
      this.updateLog(`Invalid Index: Insertion index must be between 0 and ${this.array.length}.`, 'Index Error', 'Error');
      this.isAnimating = false;
      return;
    }

    this.updateLog(`Beginning rightward element shift to open space at index [${index}]...`, 'Shift Init', 'O(n)');

    // Add temporary slot
    this.array.push(0);
    for (let i = this.array.length - 1; i > index; i--) {
      this.array[i] = this.array[i - 1];
      this.render(i, 'shifting');
      this.updateLog(`Shifted element ${this.array[i]} from arr[${i - 1}] -> arr[${i}]`, `Shifting (${this.array.length - 1 - i})`, 'O(n)');
      await this.sleep();
    }

    this.array[index] = value;
    this.render(index, 'found');
    this.updateLog(`Inserted value ${value} into arr[${index}]. Total active elements: ${this.array.length}`, 'Inserted', 'O(n)');
    this.isAnimating = false;
  }

  async delete(index) {
    if (this.isAnimating) return;
    this.isAnimating = true;

    if (this.array.length <= 1) {
      this.updateLog('Underflow: Cannot delete when array contains only 1 element.', 'Underflow', 'N/A');
      this.isAnimating = false;
      return;
    }

    if (index < 0 || index >= this.array.length) {
      this.updateLog(`Invalid Index: Deletion index must be between 0 and ${this.array.length - 1}.`, 'Index Error', 'Error');
      this.isAnimating = false;
      return;
    }

    const deletedVal = this.array[index];
    this.render(index, 'highlight');
    this.updateLog(`Deleting value ${deletedVal} from index [${index}]. Shifting subsequent elements left to close gap...`, 'Delete Init', 'O(n)');
    await this.sleep();

    for (let i = index; i < this.array.length - 1; i++) {
      this.array[i] = this.array[i + 1];
      this.render(i, 'shifting');
      this.updateLog(`Shifted element ${this.array[i]} from arr[${i + 1}] <- arr[${i}]`, `Shifting left`, 'O(n)');
      await this.sleep();
    }

    this.array.pop();
    this.render(-1);
    this.updateLog(`Deleted element ${deletedVal}. Contiguous array packed without gaps. Size: ${this.array.length}.`, 'Complete', 'O(n)');
    this.isAnimating = false;
  }

  reset() {
    this.array = [15, 28, 42, 57, 73, 89];
    this.isAnimating = false;
    this.render(-1);
    this.updateLog('Visualizer reset to default 6-element contiguous C array.', 'Ready', 'O(1)');
  }
}
