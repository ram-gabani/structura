/**
 * TREE & BST INTERACTIVE LAB ENGINE
 * Binary Search Tree Visualizer with Node Insertions, Recursive Search,
 * Animated Preorder, Inorder, and Postorder Traversals, and Real-Time Path Tracing.
 */

class TreeNode {
  constructor(val) {
    this.val = val;
    this.left = null;
    this.right = null;
    this.x = 0;
    this.y = 0;
  }
}

class TreeLabEngine {
  constructor() {
    this.root = null;
    this.isAnimating = false;
    this.speedMs = 600;

    this.stageEl = document.getElementById('tree-stage');
    this.logMsgEl = document.getElementById('tree-log-msg');
    this.logStepEl = document.getElementById('tree-log-step');
    this.logStatusEl = document.getElementById('tree-log-status');
    this.streamEl = document.getElementById('tree-traversal-stream');
    this.treeCountEl = document.getElementById('tree-node-count');
    this.treeHeightEl = document.getElementById('tree-height-val');

    this.initDefaultTree();
  }

  setSpeed(val) {
    this.speedMs = 1400 - (val * 240);
  }

  sleep() {
    return new Promise(resolve => setTimeout(resolve, this.speedMs));
  }

  initDefaultTree() {
    // Standard balanced 7-node BST: 50, 30, 70, 20, 40, 60, 80
    const vals = [50, 30, 70, 20, 40, 60, 80];
    this.root = null;
    vals.forEach(v => {
      this.root = this.insertNode(this.root, v);
    });
  }

  insertNode(node, val) {
    if (!node) return new TreeNode(val);
    if (val < node.val) {
      node.left = this.insertNode(node.left, val);
    } else if (val > node.val) {
      node.right = this.insertNode(node.right, val);
    }
    return node;
  }

  getHeight(node) {
    if (!node) return 0;
    return 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));
  }

  countNodes(node) {
    if (!node) return 0;
    return 1 + this.countNodes(node.left) + this.countNodes(node.right);
  }

  updateLog(message, step = 'Idle', statusBadge = 'Ready') {
    if (this.logMsgEl) this.logMsgEl.textContent = message;
    if (this.logStepEl) this.logStepEl.textContent = step;
    if (this.logStatusEl) this.logStatusEl.textContent = statusBadge;
  }

  updateTelemetry() {
    if (this.treeCountEl) this.treeCountEl.textContent = `${this.countNodes(this.root)} Nodes`;
    if (this.treeHeightEl) this.treeHeightEl.textContent = `Height: ${this.getHeight(this.root)}`;
  }

  setDisabled(disabled) {
    this.isAnimating = disabled;
    const inputs = document.querySelectorAll('.tree-btn, .tree-input');
    inputs.forEach(el => { el.disabled = disabled; });
    const resetBtn = document.getElementById('tree-reset-btn');
    if (resetBtn) resetBtn.disabled = false;
  }

  calculatePositions(node, x, y, xOffset) {
    if (!node) return;
    node.x = x;
    node.y = y;
    if (node.left) this.calculatePositions(node.left, x - xOffset, y + 70, xOffset * 0.55);
    if (node.right) this.calculatePositions(node.right, x + xOffset, y + 70, xOffset * 0.55);
  }

  render(highlightedVals = {}, customStreamHtml = '') {
    if (!this.stageEl) return;
    this.updateTelemetry();

    if (!this.root) {
      this.stageEl.innerHTML = `<div style="margin: auto; color: var(--text-muted); font-family: 'JetBrains Mono', monospace;">Tree is empty. Insert nodes to begin!</div>`;
      return;
    }

    const stageWidth = Math.max(this.stageEl.clientWidth || 700, 600);
    this.calculatePositions(this.root, stageWidth / 2, 45, stageWidth * 0.24);

    let svgLines = '';
    let nodesHtml = '';

    const traverseRender = (node) => {
      if (!node) return;

      if (node.left) {
        svgLines += `<line x1="${node.x}" y1="${node.y}" x2="${node.left.x}" y2="${node.left.y}" stroke="var(--border-strong)" stroke-width="2"/>`;
        traverseRender(node.left);
      }
      if (node.right) {
        svgLines += `<line x1="${node.x}" y1="${node.y}" x2="${node.right.x}" y2="${node.right.y}" stroke="var(--border-strong)" stroke-width="2"/>`;
        traverseRender(node.right);
      }

      const hlClass = highlightedVals[node.val] || '';
      nodesHtml += `
        <div class="tree-node-circle ${hlClass}" id="tnode-${node.val}" style="position: absolute; left: ${node.x}px; top: ${node.y}px; transform: translate(-50%, -50%);">
          ${node.val}
        </div>
      `;
    };

    traverseRender(this.root);

    const heightPx = Math.max(380, this.getHeight(this.root) * 85 + 40);
    this.stageEl.style.height = `${heightPx}px`;

    this.stageEl.innerHTML = `
      <svg style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none;">
        ${svgLines}
      </svg>
      ${nodesHtml}
    `;

    if (this.streamEl && customStreamHtml) {
      this.streamEl.innerHTML = customStreamHtml;
    }
  }

  async insert(val) {
    if (this.isAnimating) return;
    if (this.getHeight(this.root) >= 5) {
      this.updateLog(`Visualizer capped at tree height 5 for clear readability.`, 'Capped', '⚠️ Limit');
      return;
    }

    this.setDisabled(true);
    this.updateLog(`Starting BST insertion for value ${val}... Comparing with root...`, 'Insert Start', '⏳ Inserting');
    await this.sleep();

    let curr = this.root;
    const path = {};

    while (curr) {
      path[curr.val] = 'current';
      this.render(path);

      if (val === curr.val) {
        this.updateLog(`Value ${val} already exists in BST! BSTs typically store unique keys.`, 'Duplicate', '⚠️ Duplicate');
        this.setDisabled(false);
        return;
      } else if (val < curr.val) {
        this.updateLog(`${val} < ${curr.val}: Branching LEFT to left subtree...`, `Branch Left`, '🚶 Traversal');
        await this.sleep();
        path[curr.val] = 'visited';
        if (!curr.left) {
          curr.left = new TreeNode(val);
          break;
        }
        curr = curr.left;
      } else {
        this.updateLog(`${val} > ${curr.val}: Branching RIGHT to right subtree...`, `Branch Right`, '🚶 Traversal');
        await this.sleep();
        path[curr.val] = 'visited';
        if (!curr.right) {
          curr.right = new TreeNode(val);
          break;
        }
        curr = curr.right;
      }
    }

    path[val] = 'found';
    this.render(path);
    this.updateLog(`Successfully inserted ${val} as a new leaf node in O(log n) average time!`, 'Complete', '✓ Inserted');
    await this.sleep();

    this.render();
    this.setDisabled(false);
  }

  async search(val) {
    if (this.isAnimating) return;
    if (!this.root) {
      this.updateLog(`Tree is empty. Cannot search.`, 'Empty', '❌ Not Found');
      return;
    }

    this.setDisabled(true);
    this.updateLog(`Searching for target ${val} using BST comparison logic...`, 'Search Start', '🔍 BST Search');
    await this.sleep();

    let curr = this.root;
    const path = {};
    let found = false;

    while (curr) {
      path[curr.val] = 'current';
      this.render(path);

      if (curr.val === val) {
        path[curr.val] = 'found';
        this.render(path);
        this.updateLog(`Match found! Node with key ${val} exists in the BST.`, 'Found!', '✓ Found');
        found = true;
        break;
      } else if (val < curr.val) {
        this.updateLog(`${val} < ${curr.val}: Key must be in LEFT subtree. Discarding right half.`, 'Left Subtree', '🔍 O(log n)');
        await this.sleep();
        path[curr.val] = 'visited';
        curr = curr.left;
      } else {
        this.updateLog(`${val} > ${curr.val}: Key must be in RIGHT subtree. Discarding left half.`, 'Right Subtree', '🔍 O(log n)');
        await this.sleep();
        path[curr.val] = 'visited';
        curr = curr.right;
      }
    }

    if (!found) {
      this.updateLog(`Reached NULL. Target key ${val} is not present in the tree.`, 'Not Found', '❌ Not Found');
    }

    await this.sleep();
    this.render();
    this.setDisabled(false);
  }

  async runTraversal(type) {
    if (this.isAnimating) return;
    if (!this.root) return;

    this.setDisabled(true);
    const order = [];

    if (type === 'inorder') {
      this.updateLog(`Running In-Order Traversal: Left → Root → Right (Produces Sorted Sequence!).`, 'In-Order', '⚡ Traversal');
      const inOrder = (node) => {
        if (!node) return;
        inOrder(node.left);
        order.push(node.val);
        inOrder(node.right);
      };
      inOrder(this.root);
    } else if (type === 'preorder') {
      this.updateLog(`Running Pre-Order Traversal: Root → Left → Right (Used for copying/serializing trees).`, 'Pre-Order', '⚡ Traversal');
      const preOrder = (node) => {
        if (!node) return;
        order.push(node.val);
        preOrder(node.left);
        preOrder(node.right);
      };
      preOrder(this.root);
    } else if (type === 'postorder') {
      this.updateLog(`Running Post-Order Traversal: Left → Right → Root (Used for deleting trees & expression evaluation).`, 'Post-Order', '⚡ Traversal');
      const postOrder = (node) => {
        if (!node) return;
        postOrder(node.left);
        postOrder(node.right);
        order.push(node.val);
      };
      postOrder(this.root);
    }

    let streamHtml = `<span style="color: var(--text-muted); font-size: 0.78rem;">${type.toUpperCase()} OUTPUT:</span>`;
    const highlighted = {};

    for (let i = 0; i < order.length; i++) {
      const v = order[i];
      highlighted[v] = 'current';
      streamHtml += `<span class="tree-stream-item">${v}</span>`;
      this.render(highlighted, streamHtml);
      this.updateLog(`Step ${i + 1}/${order.length}: Visited Node [ ${v} ]`, `Step ${i + 1}`, '🚶 Visiting');
      await this.sleep();
      highlighted[v] = 'visited';
    }

    this.updateLog(`Completed ${type} traversal! Processed all ${order.length} nodes in O(n) time.`, 'Complete', '✓ Finished');
    this.setDisabled(false);
  }

  reset() {
    this.initDefaultTree();
    this.render();
    if (this.streamEl) {
      this.streamEl.innerHTML = `<span style="color: var(--text-muted); font-size: 0.78rem;">Traversal Output will appear here...</span>`;
    }
    this.updateLog(`Tree reset to balanced 7-node BST.`, 'Reset', 'Ready');
    this.setDisabled(false);
  }
}

// Auto-initialize when canvas exists
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('tree-stage')) {
    const engine = new TreeLabEngine();
    window.treeEngine = engine;
    engine.render();

    const insertBtn = document.getElementById('tree-insert-btn');
    if (insertBtn) {
      insertBtn.addEventListener('click', () => {
        const val = parseInt(document.getElementById('tree-val-input').value, 10);
        if (!isNaN(val)) engine.insert(val);
      });
    }

    const searchBtn = document.getElementById('tree-search-btn');
    if (searchBtn) {
      searchBtn.addEventListener('click', () => {
        const val = parseInt(document.getElementById('tree-val-input').value, 10);
        if (!isNaN(val)) engine.search(val);
      });
    }

    const inOrderBtn = document.getElementById('tree-inorder-btn');
    if (inOrderBtn) {
      inOrderBtn.addEventListener('click', () => engine.runTraversal('inorder'));
    }

    const preOrderBtn = document.getElementById('tree-preorder-btn');
    if (preOrderBtn) {
      preOrderBtn.addEventListener('click', () => engine.runTraversal('preorder'));
    }

    const postOrderBtn = document.getElementById('tree-postorder-btn');
    if (postOrderBtn) {
      postOrderBtn.addEventListener('click', () => engine.runTraversal('postorder'));
    }

    const resetBtn = document.getElementById('tree-reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => engine.reset());
    }

    const speedSlider = document.getElementById('tree-speed-slider');
    if (speedSlider) {
      speedSlider.addEventListener('input', (e) => {
        engine.setSpeed(parseInt(e.target.value, 10));
      });
    }
  }
});
