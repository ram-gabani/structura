/**
 * TREE TYPE EXPLORER ENGINE — Structura
 * Structura — Master Data Structures Visually in C
 *
 * Implements interactive exploration and step-by-step property validation
 * for all 5 fundamental Binary Tree types:
 * 1. Full Binary Tree (Strict / Proper)
 * 2. Complete Binary Tree
 * 3. Perfect Binary Tree
 * 4. Balanced Binary Tree (Height-Balanced)
 * 5. Degenerate / Skewed Binary Tree (Left & Right Skewed)
 */

(function () {
  'use strict';

  // --- MODEL DEFINITIONS ---

  class ExplorerNode {
    constructor(id, val, left = null, right = null) {
      this.id = id;
      this.val = val;
      this.left = left;
      this.right = right;
      this.x = 0;
      this.y = 0;
      this.level = 0;
    }
  }

  const TYPE_METADATA = {
    full: {
      name: 'Full Binary Tree (Strict / Proper)',
      rule: 'Every node has either 0 children (leaf) or exactly 2 children (internal). No node has exactly 1 child.',
      purpose: 'Foundational in Huffman compression trees, expression trees, and tournament trees.',
      cTarget: 'code-full-tree'
    },
    complete: {
      name: 'Complete Binary Tree',
      rule: 'All levels are completely filled except possibly the last level, which fills strictly from left to right without gaps.',
      purpose: 'The backbone of Binary Heaps and Priority Queues; efficiently stored in contiguous arrays without pointer overhead.',
      cTarget: 'code-complete-tree'
    },
    perfect: {
      name: 'Perfect Binary Tree',
      rule: 'All internal nodes have exactly 2 children, and all leaves reside at the exact same depth/level.',
      purpose: 'The ideal theoretical tree with maximum nodes 2^(h+1) - 1 for height h and perfectly minimal search depth.',
      cTarget: 'code-perfect-tree'
    },
    balanced: {
      name: 'Balanced Binary Tree (Height-Balanced)',
      rule: 'For every node, the height difference between left and right subtrees is at most 1: |BF| = |h(L) - h(R)| ≤ 1.',
      purpose: 'Guarantees O(log N) worst-case search and insertion times by preventing tree degradation into linear chains.',
      cTarget: 'code-balanced-tree'
    },
    degenerate: {
      name: 'Degenerate / Skewed Binary Tree',
      rule: 'Every internal node has exactly one child. The tree behaves structurally like a Singly Linked List.',
      purpose: 'Demonstrates the worst-case degradation of naive trees when items are inserted in sorted order: O(N) lookup.',
      cTarget: 'code-degenerate-tree'
    }
  };

  class TreeTypeExplorer {
    constructor() {
      this.currentType = 'full';
      this.stageEl = document.getElementById('tree-explorer-svg-stage');
      this.summaryCardEl = document.getElementById('type-property-summary');
      this.telemetryStepEl = document.getElementById('explorer-log-step');
      this.telemetryStatusEl = document.getElementById('explorer-log-status');
      this.telemetryMsgEl = document.getElementById('explorer-log-msg');
      this.completeArrayStripEl = document.getElementById('complete-array-strip-container');
      this.perfectMetricsStripEl = document.getElementById('perfect-metrics-strip');
      this.degenerateMetricsStripEl = document.getElementById('degenerate-metrics-strip');
      this.balancedNoticeEl = document.getElementById('balanced-notice-strip');

      // Playback / Step Engine State
      this.steps = [];
      this.currentStepIdx = -1;
      this.isPlaying = false;
      this.playTimer = null;
      this.speedMs = 700;

      // Tree Data Models per Type
      this.models = {
        full: null,
        complete: null,
        perfect: null,
        balanced: null,
        degenerate: null
      };

      // Violation Flags
      this.isViolating = {
        full: false,
        complete: false,
        perfect: false,
        balanced: false,
        degenerate: false
      };

      // Type-specific params
      this.perfectLevel = 2; // Default level 2 (7 nodes)
      this.degenerateDirection = 'left'; // 'left' or 'right'

      this.initDefaultModels();
      this.bindEvents();
      this.render();
    }

    // ----------------------------------------------------
    // INITIAL MODEL GENERATION
    // ----------------------------------------------------

    initDefaultModels() {
      // 1. Full Tree: Root 10 -> (5, 20), 20 -> (15, 30) (All nodes have 0 or 2 children)
      this.models.full = new ExplorerNode('f1', 10,
        new ExplorerNode('f2', 5),
        new ExplorerNode('f3', 20,
          new ExplorerNode('f4', 15),
          new ExplorerNode('f5', 30)
        )
      );
      this.isViolating.full = false;

      // 2. Complete Tree: Level-order [10, 5, 20, 2, 7, 15] (6 nodes, perfectly left-aligned at level 2)
      this.buildCompleteModel([10, 5, 20, 2, 7, 15]);
      this.isViolating.complete = false;

      // 3. Perfect Tree: Level 2 (7 nodes)
      this.perfectLevel = 2;
      this.buildPerfectModel(2);
      this.isViolating.perfect = false;

      // 4. Balanced Tree: [40, 20, 60, 10, 30, 50, 70]
      this.buildBalancedModel([40, 20, 60, 10, 30, 50, 70]);
      this.isViolating.balanced = false;

      // 5. Degenerate Tree: Left-skewed [50 -> 40 -> 30 -> 20 -> 10]
      this.degenerateDirection = 'left';
      this.buildDegenerateModel([50, 40, 30, 20, 10], 'left');
      this.isViolating.degenerate = false;
    }

    buildCompleteModel(arr) {
      if (!arr || arr.length === 0) {
        this.models.complete = null;
        return;
      }
      const nodes = arr.map((v, i) => v !== null ? new ExplorerNode(`c_${i}`, v) : null);
      for (let i = 0; i < nodes.length; i++) {
        if (!nodes[i]) continue;
        const leftIdx = 2 * i + 1;
        const rightIdx = 2 * i + 2;
        if (leftIdx < nodes.length) nodes[i].left = nodes[leftIdx];
        if (rightIdx < nodes.length) nodes[i].right = nodes[rightIdx];
      }
      this.models.complete = nodes[0];
      this.completeRawArray = arr;
    }

    buildPerfectModel(level) {
      this.perfectLevel = Math.max(0, Math.min(3, level));
      const buildSubtree = (val, currentLvl, maxLvl, prefix) => {
        const node = new ExplorerNode(`p_${prefix}`, val);
        if (currentLvl < maxLvl) {
          node.left = buildSubtree(val * 2, currentLvl + 1, maxLvl, `${prefix}L`);
          node.right = buildSubtree(val * 2 + 1, currentLvl + 1, maxLvl, `${prefix}R`);
        }
        return node;
      };
      this.models.perfect = buildSubtree(1, 0, this.perfectLevel, 'root');
    }

    buildBalancedModel(values) {
      // Build balanced BST from sorted array to guarantee height-balance
      const sorted = [...values].sort((a, b) => a - b);
      const build = (start, end, prefix) => {
        if (start > end) return null;
        const mid = Math.floor((start + end) / 2);
        const node = new ExplorerNode(`b_${prefix}_${sorted[mid]}`, sorted[mid]);
        node.left = build(start, mid - 1, `${prefix}L`);
        node.right = build(mid + 1, end, `${prefix}R`);
        return node;
      };
      this.models.balanced = build(0, sorted.length - 1, 'rt');
      this.balancedValues = [...values];
    }

    buildDegenerateModel(values, dir) {
      if (!values || values.length === 0) {
        this.models.degenerate = null;
        return;
      }
      const root = new ExplorerNode(`d_0`, values[0]);
      let curr = root;
      for (let i = 1; i < values.length; i++) {
        const next = new ExplorerNode(`d_${i}`, values[i]);
        if (dir === 'left') {
          curr.left = next;
        } else {
          curr.right = next;
        }
        curr = next;
      }
      this.models.degenerate = root;
      this.degenerateValues = [...values];
    }

    // ----------------------------------------------------
    // METRICS & HEIGHT CALCULATIONS
    // ----------------------------------------------------

    getNodeHeight(node) {
      if (!node) return 0;
      return 1 + Math.max(this.getNodeHeight(node.left), this.getNodeHeight(node.right));
    }

    getBalanceFactor(node) {
      if (!node) return 0;
      const lh = this.getNodeHeight(node.left);
      const rh = this.getNodeHeight(node.right);
      return lh - rh;
    }

    countTotalNodes(node) {
      if (!node) return 0;
      return 1 + this.countTotalNodes(node.left) + this.countTotalNodes(node.right);
    }

    countLeaves(node) {
      if (!node) return 0;
      if (!node.left && !node.right) return 1;
      return this.countLeaves(node.left) + this.countLeaves(node.right);
    }

    // ----------------------------------------------------
    // SVG TREE POSITIONING & RENDERING (PART D & E)
    // ----------------------------------------------------

    calculateCoordinates(root, type) {
      if (!root) return { width: 720, height: 380 };

      // Set level depths
      const setLevels = (node, lvl) => {
        if (!node) return;
        node.level = lvl;
        setLevels(node.left, lvl + 1);
        setLevels(node.right, lvl + 1);
      };
      setLevels(root, 0);

      const treeHeight = this.getNodeHeight(root);

      if (type === 'degenerate') {
        const count = this.countTotalNodes(root);
        const stageW = Math.max(540, count * 75 + 100);
        const stageH = Math.max(380, count * 65 + 60);
        let curr = root;
        let idx = 0;
        const startX = this.degenerateDirection === 'left' ? stageW - 80 : 80;
        const stepX = this.degenerateDirection === 'left' ? -65 : 65;

        while (curr) {
          curr.x = startX + idx * stepX;
          curr.y = 55 + idx * 62;
          curr = this.degenerateDirection === 'left' ? curr.left : curr.right;
          idx++;
        }
        return { width: stageW, height: stageH };
      }

      // Hierarchical layout with in-order horizontal distribution for collision-free layout
      let order = 0;
      const inOrderAssign = (node) => {
        if (!node) return;
        inOrderAssign(node.left);
        node.order = order++;
        inOrderAssign(node.right);
      };
      inOrderAssign(root);

      const totalNodes = Math.max(order, 1);
      const stageW = Math.max(720, totalNodes * 75 + 80);
      const stageH = Math.max(380, treeHeight * 90 + 70);

      const assignPositions = (node) => {
        if (!node) return;
        const marginX = 60;
        const availW = stageW - marginX * 2;
        node.x = marginX + (node.order / (totalNodes - 1 || 1)) * availW;
        node.y = 55 + node.level * 82;
        assignPositions(node.left);
        assignPositions(node.right);
      };
      assignPositions(root);

      return { width: stageW, height: stageH };
    }

    render(stepHighlight = null) {
      if (!this.stageEl) return;

      const root = this.models[this.currentType];
      this.updateSummaryCard();
      this.updateAuxiliaryStrips();

      if (!root) {
        this.stageEl.innerHTML = `<svg viewBox="0 0 720 200" style="width: 100%; height: 200px;"><text x="360" y="100" text-anchor="middle" fill="var(--text-muted)" font-family="'JetBrains Mono', monospace">Tree is empty. Reset or choose a type.</text></svg>`;
        return;
      }

      const dims = this.calculateCoordinates(root, this.currentType);
      const R = 24; // Standard circle radius (48px diameter)

      // Traverse to gather edges and nodes
      const edges = [];
      const nodes = [];

      const gatherElements = (node) => {
        if (!node) return;

        // Collect children edges
        if (node.left) {
          edges.push({
            pId: node.id,
            cId: node.left.id,
            x1: node.x,
            y1: node.y,
            x2: node.left.x,
            y2: node.left.y
          });
          gatherElements(node.left);
        }
        if (node.right) {
          edges.push({
            pId: node.id,
            cId: node.right.id,
            x1: node.x,
            y1: node.y,
            x2: node.right.x,
            y2: node.right.y
          });
          gatherElements(node.right);
        }

        // Determine node role
        const isRoot = node === root;
        const isLeaf = !node.left && !node.right;
        const isInternal = !isRoot && !isLeaf;

        // Outside annotation label (balance factor or role)
        let outsideLabel = '';
        let labelColor = 'var(--text-muted)';
        let labelOffset = 38;

        if (this.currentType === 'balanced') {
          const bf = this.getBalanceFactor(node);
          const bfClass = (bf >= -1 && bf <= 1) ? 'var(--success)' : 'var(--danger)';
          outsideLabel = `BF: ${bf >= 0 ? '+' : ''}${bf}`;
          labelColor = bfClass;
        } else if (this.currentType === 'full') {
          const deg = (node.left ? 1 : 0) + (node.right ? 1 : 0);
          outsideLabel = isLeaf ? 'Leaf (deg: 0)' : `deg: ${deg}`;
          labelColor = deg === 1 ? 'var(--danger)' : (isLeaf ? 'var(--success)' : 'var(--concept)');
        } else if (this.currentType === 'perfect') {
          outsideLabel = isLeaf ? `Lvl ${node.level} Leaf` : `Lvl ${node.level}`;
          labelColor = isLeaf ? 'var(--success)' : 'var(--concept)';
        } else if (this.currentType === 'degenerate') {
          outsideLabel = isLeaf ? 'Sole Leaf' : 'Degree 1';
          labelColor = isLeaf ? 'var(--success)' : 'var(--concept)';
        } else {
          outsideLabel = isRoot ? 'Root' : (isLeaf ? 'Leaf' : 'Internal');
          labelColor = isRoot ? 'var(--brand)' : (isLeaf ? 'var(--success)' : 'var(--concept)');
        }

        nodes.push({
          id: node.id,
          val: node.val,
          x: node.x,
          y: node.y,
          isRoot,
          isLeaf,
          isInternal,
          outsideLabel,
          labelColor,
          labelOffset
        });
      };

      gatherElements(root);

      // Edge Rendering with Unit Vector Clipping (Starts and ends exactly at circle boundary)
      let edgesSvg = '';
      edges.forEach(e => {
        const dx = e.x2 - e.x1;
        const dy = e.y2 - e.y1;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let x1 = e.x1, y1 = e.y1, x2 = e.x2, y2 = e.y2;
        if (dist > R * 2) {
          x1 = e.x1 + (dx / dist) * R;
          y1 = e.y1 + (dy / dist) * R;
          x2 = e.x2 - (dx / dist) * R;
          y2 = e.y2 - (dy / dist) * R;
        }

        // Active edge highlighting
        let strokeColor = 'var(--border-strong)';
        let strokeW = '2.5';
        if (stepHighlight && stepHighlight.activeEdges &&
            stepHighlight.activeEdges.some(ae => ae[0] === e.pId && ae[1] === e.cId)) {
          strokeColor = 'var(--brand)';
          strokeW = '3.5';
        }

        edgesSvg += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${strokeColor}" stroke-width="${strokeW}" stroke-linecap="round" />`;
      });

      // Node Rendering
      let nodesSvg = '';
      nodes.forEach(n => {
        let circleStroke = n.isRoot ? 'var(--brand)' : (n.isLeaf ? 'var(--success)' : 'var(--concept)');
        let circleFill = n.isRoot ? 'rgba(56, 189, 248, 0.15)' : (n.isLeaf ? 'rgba(52, 211, 153, 0.15)' : 'rgba(167, 139, 250, 0.15)');
        let textFill = 'var(--text-primary)';
        let strokeWidth = n.isRoot ? '3' : '2.5';
        let filterAttr = n.isRoot ? 'filter="url(#explorer-root-glow)"' : '';

        // Apply Step Engine Overrides
        if (stepHighlight) {
          if (stepHighlight.activeNodeId === n.id) {
            circleStroke = 'var(--warning)';
            circleFill = 'rgba(251, 191, 36, 0.25)';
            strokeWidth = '3.5';
          } else if (stepHighlight.violatingNodeId === n.id) {
            circleStroke = 'var(--danger)';
            circleFill = 'rgba(251, 113, 133, 0.3)';
            textFill = 'var(--danger)';
            strokeWidth = '3.5';
          } else if (stepHighlight.passedNodeIds && stepHighlight.passedNodeIds.includes(n.id)) {
            circleStroke = 'var(--success)';
            circleFill = 'rgba(52, 211, 153, 0.22)';
          }
        }

        // Node Circle + Centered Value
        nodesSvg += `
          <g id="exp-node-${n.id}">
            <circle cx="${n.x}" cy="${n.y}" r="${R}" stroke="${circleStroke}" stroke-width="${strokeWidth}" fill="${circleFill}" ${filterAttr} />
            <text x="${n.x}" y="${n.y}" text-anchor="middle" dominant-baseline="central" font-family="'JetBrains Mono', monospace" font-size="16" font-weight="800" fill="${textFill}">
              ${n.val}
            </text>
            <!-- Outside Property Label (Always outside circle, >14px gap) -->
            <text x="${n.x}" y="${n.y + n.labelOffset}" text-anchor="middle" font-family="'JetBrains Mono', monospace" font-size="11" font-weight="700" fill="${n.labelColor}">
              ${n.outsideLabel}
            </text>
          </g>
        `;
      });

      // Assemble SVG Canvas
      this.stageEl.innerHTML = `
        <svg viewBox="0 0 ${dims.width} ${dims.height}" style="width: 100%; max-width: 100%; height: auto; min-width: 480px; display: block;" aria-label="${TYPE_METADATA[this.currentType].name} Interactive Diagram">
          <defs>
            <filter id="explorer-root-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3.5" flood-color="var(--brand)" flood-opacity="0.35"/>
            </filter>
          </defs>
          <g class="explorer-edges">${edgesSvg}</g>
          <g class="explorer-nodes">${nodesSvg}</g>
        </svg>
      `;
    }

    // ----------------------------------------------------
    // SUMMARY CARD & AUXILIARY STRIPS
    // ----------------------------------------------------

    updateSummaryCard() {
      const meta = TYPE_METADATA[this.currentType];
      const isViolated = this.isViolating[this.currentType];

      const titleEl = document.getElementById('type-card-title');
      const ruleEl = document.getElementById('type-card-rule');
      const purposeEl = document.getElementById('type-card-purpose');
      const badgeEl = document.getElementById('type-status-badge');

      if (titleEl) titleEl.textContent = meta.name;
      if (ruleEl) ruleEl.textContent = meta.rule;
      if (purposeEl) purposeEl.textContent = meta.purpose;

      if (badgeEl) {
        if (isViolated) {
          badgeEl.className = 'tree-status-pill pill-invalid';
          badgeEl.textContent = `✗ Violated ${meta.name.split(' ')[0]} Property`;
        } else {
          badgeEl.className = 'tree-status-pill pill-valid';
          badgeEl.textContent = `✓ Valid ${meta.name.split(' ')[0]} Tree`;
        }
      }
    }

    updateAuxiliaryStrips() {
      // 1. Complete Tree Array Strip
      if (this.completeArrayStripEl) {
        if (this.currentType === 'complete') {
          this.completeArrayStripEl.style.display = 'block';
          this.renderCompleteArrayStrip();
        } else {
          this.completeArrayStripEl.style.display = 'none';
        }
      }

      // 2. Perfect Tree Metrics Strip
      if (this.perfectMetricsStripEl) {
        if (this.currentType === 'perfect') {
          this.perfectMetricsStripEl.style.display = 'flex';
          const h = this.perfectLevel;
          const maxNodes = Math.pow(2, h + 1) - 1;
          const curNodes = this.countTotalNodes(this.models.perfect);
          const leafNodes = Math.pow(2, h);
          this.perfectMetricsStripEl.innerHTML = `
            <div>Tree Height (h): <strong style="color: var(--brand);">${h}</strong></div>
            <div>Total Levels: <strong style="color: var(--concept);">${h + 1}</strong></div>
            <div>Current Nodes: <strong style="color: ${curNodes === maxNodes ? 'var(--success)' : 'var(--danger)'};">${curNodes}</strong> / Expected: <strong>${maxNodes}</strong> (2<sup>${h}+1</sup> - 1)</div>
            <div>Max Leaves at Level ${h}: <strong style="color: var(--success);">${leafNodes}</strong></div>
          `;
        } else {
          this.perfectMetricsStripEl.style.display = 'none';
        }
      }

      // 3. Degenerate Metrics Strip
      if (this.degenerateMetricsStripEl) {
        if (this.currentType === 'degenerate') {
          this.degenerateMetricsStripEl.style.display = 'flex';
          const n = this.countTotalNodes(this.models.degenerate);
          const h = n > 0 ? n - 1 : 0;
          this.degenerateMetricsStripEl.innerHTML = `
            <div>Direction: <strong style="color: var(--brand);">${this.degenerateDirection === 'left' ? 'Left-Skewed' : 'Right-Skewed'}</strong></div>
            <div>Node Count (N): <strong style="color: var(--concept);">${n}</strong></div>
            <div>Tree Height (h = N - 1): <strong style="color: var(--warning);">${h} Edges</strong></div>
            <div>Search Complexity: <strong style="color: var(--danger);">O(N) (Linear Linked-List Behavior)</strong></div>
          `;
        } else {
          this.degenerateMetricsStripEl.style.display = 'none';
        }
      }

      // 4. Balanced Notice Strip
      if (this.balancedNoticeEl) {
        this.balancedNoticeEl.style.display = this.currentType === 'balanced' ? 'block' : 'none';
      }

      // Synchronize C Code tabs
      this.syncCCodeTab(this.currentType);
    }

    renderCompleteArrayStrip() {
      if (!this.completeArrayStripEl) return;
      const arr = this.completeRawArray || [];
      let cells = '';
      for (let i = 0; i < arr.length; i++) {
        const val = arr[i];
        const isNull = val === null;
        cells += `
          <div class="complete-array-cell ${isNull ? 'cell-gap' : ''}">
            <span class="cell-idx">[${i}]</span>
            <span class="cell-val">${isNull ? 'GAP' : val}</span>
          </div>
        `;
      }
      this.completeArrayStripEl.innerHTML = `
        <div style="font-family: 'JetBrains Mono', monospace; font-size: 0.76rem; color: var(--text-muted); margin-bottom: 0.4rem; font-weight: 700;">
          Contiguous Array Representation (Heap Storage Formula: Parent = ⌊(i-1)/2⌋, Left = 2i+1, Right = 2i+2):
        </div>
        <div class="complete-array-row">${cells}</div>
      `;
    }

    syncCCodeTab(type) {
      const tabs = document.querySelectorAll('.c-code-tab-btn');
      tabs.forEach(tab => {
        const target = tab.getAttribute('data-type');
        const isActive = target === type;
        tab.classList.toggle('active', isActive);
        tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });

      const panels = document.querySelectorAll('.c-code-tab-panel');
      panels.forEach(p => {
        const pType = p.getAttribute('data-type');
        p.style.display = pType === type ? 'block' : 'none';
      });
    }

    // ----------------------------------------------------
    // STEP ENGINE: GENERATE & RUN VALIDATION (PART F)
    // ----------------------------------------------------

    generateValidationSteps() {
      this.steps = [];
      const root = this.models[this.currentType];
      if (!root) return;

      const passed = [];

      if (this.currentType === 'full') {
        // Queue traversal to validate every node degree in {0, 2}
        const queue = [root];
        while (queue.length > 0) {
          const curr = queue.shift();
          const deg = (curr.left ? 1 : 0) + (curr.right ? 1 : 0);
          const activeEdges = [];
          if (curr.left) activeEdges.push([curr.id, curr.left.id]);
          if (curr.right) activeEdges.push([curr.id, curr.right.id]);

          if (deg === 1) {
            this.steps.push({
              activeNodeId: curr.id,
              violatingNodeId: curr.id,
              activeEdges,
              passedNodeIds: [...passed],
              property: 'Degree Check',
              localResult: `Violated! Node [${curr.val}] has exactly 1 child.`,
              msg: `Node [${curr.val}] has degree 1 (${curr.left ? 'Left' : 'Right'} child only). Full Binary Trees strictly prohibit nodes with exactly one child.`,
              status: '✗ Violated'
            });
            return;
          } else {
            passed.push(curr.id);
            this.steps.push({
              activeNodeId: curr.id,
              violatingNodeId: null,
              activeEdges,
              passedNodeIds: [...passed],
              property: 'Degree Check',
              localResult: `Valid (Degree: ${deg})`,
              msg: `Node [${curr.val}] has degree ${deg} (${deg === 0 ? 'Leaf: 0 children' : 'Internal: 2 children'}). Meets Full Binary Tree rule.`,
              status: 'Checking...'
            });
            if (curr.left) queue.push(curr.left);
            if (curr.right) queue.push(curr.right);
          }
        }
        // Final completion step
        this.steps.push({
          activeNodeId: null,
          violatingNodeId: null,
          activeEdges: [],
          passedNodeIds: [...passed],
          property: 'Validation Complete',
          localResult: '100% Valid Full Tree',
          msg: 'Every single node has either 0 or 2 children. Confirmed Full Binary Tree!',
          status: '✓ Valid Full Tree'
        });

      } else if (this.currentType === 'complete') {
        // Check level-order gap: no occupied index after a null index
        const arr = this.completeRawArray || [];
        let seenGap = false;
        let gapIdx = -1;

        for (let i = 0; i < arr.length; i++) {
          const val = arr[i];
          if (val === null) {
            seenGap = true;
            gapIdx = i;
          } else if (seenGap) {
            // Found occupied cell after a gap!
            this.steps.push({
              activeNodeId: `c_${i}`,
              violatingNodeId: `c_${i}`,
              activeEdges: [],
              passedNodeIds: [...passed],
              property: 'Level-Order Gap Check',
              localResult: `Violated! Unfilled gap detected at array index ${gapIdx}`,
              msg: `Node [${val}] appears at index ${i}, but preceding index ${gapIdx} is empty! In a Complete Binary Tree, the bottom level must fill strictly from left to right without internal gaps.`,
              status: '✗ Violated'
            });
            return;
          } else {
            passed.push(`c_${i}`);
            this.steps.push({
              activeNodeId: `c_${i}`,
              violatingNodeId: null,
              activeEdges: [],
              passedNodeIds: [...passed],
              property: 'Level-Order Sequence Check',
              localResult: `Valid (Occupies contiguous index ${i})`,
              msg: `Index ${i}: Node [${val}] is placed in valid left-to-right level order without any missing predecessors.`,
              status: 'Checking...'
            });
          }
        }
        this.steps.push({
          activeNodeId: null,
          violatingNodeId: null,
          activeEdges: [],
          passedNodeIds: [...passed],
          property: 'Validation Complete',
          localResult: '100% Valid Complete Tree',
          msg: 'All levels are full, and the final level fills contiguously from left to right. Confirmed Complete Binary Tree!',
          status: '✓ Valid Complete Tree'
        });

      } else if (this.currentType === 'perfect') {
        // Validate all internal nodes have 2 children AND all leaves are at depth h
        const targetDepth = this.perfectLevel;
        const queue = [root];

        while (queue.length > 0) {
          const curr = queue.shift();
          const deg = (curr.left ? 1 : 0) + (curr.right ? 1 : 0);
          const isLeaf = deg === 0;

          if (isLeaf && curr.level !== targetDepth) {
            this.steps.push({
              activeNodeId: curr.id,
              violatingNodeId: curr.id,
              activeEdges: [],
              passedNodeIds: [...passed],
              property: 'Leaf Uniform Depth Check',
              localResult: `Violated! Leaf at level ${curr.level} ≠ Expected ${targetDepth}`,
              msg: `Leaf Node [${curr.val}] terminates at level ${curr.level}, but maximum tree level is ${targetDepth}. In a Perfect Tree, ALL leaves must share the exact same depth!`,
              status: '✗ Violated'
            });
            return;
          } else if (!isLeaf && deg !== 2) {
            this.steps.push({
              activeNodeId: curr.id,
              violatingNodeId: curr.id,
              activeEdges: [],
              passedNodeIds: [...passed],
              property: 'Internal Node Branching Check',
              localResult: `Violated! Internal node has degree ${deg} ≠ 2`,
              msg: `Internal Node [${curr.val}] has ${deg} child. In a Perfect Tree, EVERY internal node must have exactly 2 children!`,
              status: '✗ Violated'
            });
            return;
          } else {
            passed.push(curr.id);
            this.steps.push({
              activeNodeId: curr.id,
              violatingNodeId: null,
              activeEdges: curr.left && curr.right ? [[curr.id, curr.left.id], [curr.id, curr.right.id]] : [],
              passedNodeIds: [...passed],
              property: isLeaf ? 'Leaf Depth Check' : 'Internal Node Check',
              localResult: isLeaf ? `Valid Leaf at Level ${curr.level}` : `Valid Internal Node (Degree 2)`,
              msg: isLeaf
                ? `Node [${curr.val}] is a leaf located at level ${curr.level}, matching the required tree depth ${targetDepth}.`
                : `Internal Node [${curr.val}] branches into exactly 2 children.`,
              status: 'Checking...'
            });
            if (curr.left) queue.push(curr.left);
            if (curr.right) queue.push(curr.right);
          }
        }

        const totalNodes = this.countTotalNodes(root);
        const expected = Math.pow(2, targetDepth + 1) - 1;
        if (totalNodes !== expected) {
          this.steps.push({
            activeNodeId: null,
            violatingNodeId: root.id,
            activeEdges: [],
            passedNodeIds: [...passed],
            property: 'Total Node Count Check',
            localResult: `Violated! Current: ${totalNodes} ≠ Expected: ${expected}`,
            msg: `Tree has ${totalNodes} nodes, but a perfect tree of height ${targetDepth} must have 2^(h+1)-1 = ${expected} nodes. Missing nodes detected!`,
            status: '✗ Violated'
          });
          return;
        }

        this.steps.push({
          activeNodeId: null,
          violatingNodeId: null,
          activeEdges: [],
          passedNodeIds: [...passed],
          property: 'Validation Complete',
          localResult: '100% Valid Perfect Tree',
          msg: `All internal nodes have 2 children, and all ${Math.pow(2, targetDepth)} leaves reside uniformly at level ${targetDepth}. Confirmed Perfect Binary Tree!`,
          status: '✓ Valid Perfect Tree'
        });

      } else if (this.currentType === 'balanced') {
        // Post-order evaluation to verify |BF| <= 1 at every node
        const traverse = (node) => {
          if (!node) return true;
          if (!traverse(node.left)) return false;
          if (!traverse(node.right)) return false;

          const lh = this.getNodeHeight(node.left);
          const rh = this.getNodeHeight(node.right);
          const bf = lh - rh;
          const isBal = bf >= -1 && bf <= 1;

          if (!isBal) {
            this.steps.push({
              activeNodeId: node.id,
              violatingNodeId: node.id,
              activeEdges: [],
              passedNodeIds: [...passed],
              property: 'Balance Factor Evaluation',
              localResult: `Violated! BF = ${bf} (Left h: ${lh}, Right h: ${rh})`,
              msg: `Node [${node.val}] has |BF| = ${Math.abs(bf)} > 1! Subtree heights differ by more than 1, violating the Height-Balanced condition.`,
              status: '✗ Violated'
            });
            return false;
          } else {
            passed.push(node.id);
            this.steps.push({
              activeNodeId: node.id,
              violatingNodeId: null,
              activeEdges: [],
              passedNodeIds: [...passed],
              property: 'Balance Factor Evaluation',
              localResult: `Valid (BF: ${bf >= 0 ? '+' : ''}${bf}, Left h: ${lh}, Right h: ${rh})`,
              msg: `Node [${node.val}] balance factor BF = ${bf} ∈ {-1, 0, 1}. Subtree heights are balanced.`,
              status: 'Checking...'
            });
            return true;
          }
        };

        const ok = traverse(root);
        if (ok) {
          this.steps.push({
            activeNodeId: null,
            violatingNodeId: null,
            activeEdges: [],
            passedNodeIds: [...passed],
            property: 'Validation Complete',
            localResult: '100% Height-Balanced',
            msg: 'Every single node in the tree satisfies |height(left) - height(right)| ≤ 1. Confirmed Balanced Binary Tree!',
            status: '✓ Valid Balanced Tree'
          });
        }

      } else if (this.currentType === 'degenerate') {
        // Verify every internal node has degree 1
        let curr = root;
        while (curr) {
          const deg = (curr.left ? 1 : 0) + (curr.right ? 1 : 0);
          const isLeaf = deg === 0;

          if (!isLeaf && deg !== 1) {
            this.steps.push({
              activeNodeId: curr.id,
              violatingNodeId: curr.id,
              activeEdges: [],
              passedNodeIds: [...passed],
              property: 'Single-Child Chain Check',
              localResult: `Violated! Node [${curr.val}] has ${deg} children`,
              msg: `Node [${curr.val}] branches into 2 children! In a Degenerate / Skewed tree, EVERY internal node must have exactly 1 child.`,
              status: '✗ Violated'
            });
            return;
          } else {
            passed.push(curr.id);
            this.steps.push({
              activeNodeId: curr.id,
              violatingNodeId: null,
              activeEdges: [],
              passedNodeIds: [...passed],
              property: isLeaf ? 'Chain Terminal Check' : 'Degenerate Link Check',
              localResult: isLeaf ? 'Valid Sole Terminal Leaf' : 'Valid Single-Child Link',
              msg: isLeaf
                ? `Node [${curr.val}] is the single terminal leaf at the end of the linear chain.`
                : `Node [${curr.val}] has exactly 1 child. Continues the linear linked-list chain.`,
              status: 'Checking...'
            });
            curr = curr.left || curr.right;
          }
        }

        this.steps.push({
          activeNodeId: null,
          violatingNodeId: null,
          activeEdges: [],
          passedNodeIds: [...passed],
          property: 'Validation Complete',
          localResult: '100% Valid Degenerate Tree',
          msg: `Every internal node has exactly one child. Tree height = ${this.countTotalNodes(root) - 1}. Behavers structurally like a Singly Linked List.`,
          status: '✓ Valid Degenerate Tree'
        });
      }
    }

    applyStep(index) {
      if (index < 0 || index >= this.steps.length) return;
      this.currentStepIdx = index;
      const step = this.steps[index];

      // Update Telemetry Header
      if (this.telemetryStepEl) {
        this.telemetryStepEl.textContent = `Step ${index + 1} of ${this.steps.length} (${step.property})`;
      }
      if (this.telemetryStatusEl) {
        this.telemetryStatusEl.textContent = step.status;
        this.telemetryStatusEl.className = step.status.includes('Violated')
          ? 'speed-pill pill-danger'
          : (step.status.includes('Valid') ? 'speed-pill pill-success' : 'speed-pill pill-warning');
      }
      if (this.telemetryMsgEl) {
        this.telemetryMsgEl.innerHTML = `
          <div><strong>Local Check:</strong> ${step.localResult}</div>
          <div style="margin-top: 0.35rem; color: var(--text-secondary);">${step.msg}</div>
        `;
      }

      // Render with step highlight
      this.render(step);

      // Disable/enable step buttons
      const prevBtn = document.getElementById('step-prev-btn');
      const nextBtn = document.getElementById('step-next-btn');
      if (prevBtn) prevBtn.disabled = index === 0;
      if (nextBtn) nextBtn.disabled = index === this.steps.length - 1;
    }

    startValidation() {
      this.generateValidationSteps();
      this.applyStep(0);
    }

    stepNext() {
      if (this.currentStepIdx < this.steps.length - 1) {
        this.applyStep(this.currentStepIdx + 1);
      } else {
        this.pausePlayback();
      }
    }

    stepPrev() {
      if (this.currentStepIdx > 0) {
        this.applyStep(this.currentStepIdx - 1);
      }
    }

    togglePlay() {
      if (this.isPlaying) {
        this.pausePlayback();
      } else {
        this.startPlayback();
      }
    }

    startPlayback() {
      if (this.steps.length === 0 || this.currentStepIdx >= this.steps.length - 1) {
        this.generateValidationSteps();
        this.currentStepIdx = -1;
      }

      this.isPlaying = true;
      const playBtn = document.getElementById('step-play-btn');
      if (playBtn) playBtn.textContent = '⏸ Pause';

      // Set disabled state on conflicting structure edit buttons
      this.setEditButtonsDisabled(true);

      const speedVal = parseInt(document.getElementById('tree-speed-slider')?.value || '3', 10);
      const delay = Math.max(300, 1400 - speedVal * 240);

      this.playTimer = setInterval(() => {
        if (this.currentStepIdx < this.steps.length - 1) {
          this.stepNext();
        } else {
          this.pausePlayback();
        }
      }, delay);
    }

    pausePlayback() {
      this.isPlaying = false;
      if (this.playTimer) {
        clearInterval(this.playTimer);
        this.playTimer = null;
      }
      const playBtn = document.getElementById('step-play-btn');
      if (playBtn) playBtn.textContent = '▶ Play';
      this.setEditButtonsDisabled(false);
    }

    resetValidation() {
      this.pausePlayback();
      this.steps = [];
      this.currentStepIdx = -1;
      if (this.telemetryStepEl) this.telemetryStepEl.textContent = 'Idle';
      if (this.telemetryStatusEl) {
        this.telemetryStatusEl.textContent = 'Ready';
        this.telemetryStatusEl.className = 'speed-pill instant';
      }
      if (this.telemetryMsgEl) {
        this.telemetryMsgEl.textContent = `Select an action or click 'Validate Structure' to begin step-by-step examination of the ${TYPE_METADATA[this.currentType].name}.`;
      }
      this.render();
      const prevBtn = document.getElementById('step-prev-btn');
      const nextBtn = document.getElementById('step-next-btn');
      if (prevBtn) prevBtn.disabled = true;
      if (nextBtn) nextBtn.disabled = false;
    }

    setEditButtonsDisabled(disabled) {
      const editBtns = document.querySelectorAll('.type-action-btn');
      editBtns.forEach(b => { b.disabled = disabled; });
    }

    // ----------------------------------------------------
    // TYPE-SPECIFIC INTERACTIONS (PART E)
    // ----------------------------------------------------

    switchType(newType) {
      if (newType === this.currentType) return;
      this.pausePlayback();
      this.currentType = newType;

      // Update selector buttons
      const typeBtns = document.querySelectorAll('.tree-type-btn');
      typeBtns.forEach(btn => {
        const isMatch = btn.getAttribute('data-type') === newType;
        btn.classList.toggle('active', isMatch);
        btn.setAttribute('aria-selected', isMatch ? 'true' : 'false');
        btn.setAttribute('tabindex', isMatch ? '0' : '-1');
      });

      // Show the matching action docks
      const docks = document.querySelectorAll('.type-controls-dock');
      docks.forEach(d => {
        const dType = d.getAttribute('data-type');
        d.style.display = dType === newType ? 'flex' : 'none';
      });

      this.resetValidation();
    }

    // --- FULL TREE OPERATIONS ---

    fullAddChildPair() {
      const root = this.models.full;
      if (!root) return;
      // Find first available leaf to attach a sibling pair
      let target = null;
      const findLeaf = (n) => {
        if (!n || target) return;
        if (!n.left && !n.right) {
          target = n;
          return;
        }
        findLeaf(n.left);
        findLeaf(n.right);
      };
      findLeaf(root);

      if (target) {
        const valL = target.val * 2 - 1;
        const valR = target.val * 2 + 2;
        target.left = new ExplorerNode(`f_${Date.now()}_L`, valL);
        target.right = new ExplorerNode(`f_${Date.now()}_R`, valR);
        this.isViolating.full = false;
        this.resetValidation();
        this.updateLog(`Added sibling pair [${valL}] and [${valR}] to leaf [${target.val}]. Full Tree condition preserved (both children added together).`);
      }
    }

    fullRemoveLeafPair() {
      const root = this.models.full;
      if (!root) return;
      // Find parent whose both children are leaves
      let targetParent = null;
      const findParent = (n) => {
        if (!n || targetParent) return;
        if (n.left && n.right && !n.left.left && !n.left.right && !n.right.left && !n.right.right) {
          targetParent = n;
          return;
        }
        findParent(n.left);
        findParent(n.right);
      };
      findParent(root);

      if (targetParent && targetParent !== root) {
        const removed = `[${targetParent.left.val}] & [${targetParent.right.val}]`;
        targetParent.left = null;
        targetParent.right = null;
        this.isViolating.full = false;
        this.resetValidation();
        this.updateLog(`Removed leaf pair ${removed}. Node [${targetParent.val}] is now a leaf with 0 children. Full Tree condition maintained.`);
      } else {
        this.updateLog('Cannot remove further leaf pairs without collapsing the minimum root structure.');
      }
    }

    fullDemonstrateViolation() {
      const root = this.models.full;
      if (!root) return;
      // Temporarily remove one child to produce a single-child internal node
      if (root.right && root.right.right) {
        this._fullBackupChild = root.right.right;
        root.right.right = null;
        this.isViolating.full = true;
        this.resetValidation();
        this.updateLog(`⚡ VIOLATION CREATED: Removed right child of Node [${root.right.val}]. It now has exactly 1 child! Full Binary Trees strictly prohibit single-child nodes.`, 'Violated', '✗ Violated');
      }
    }

    fullRestore() {
      if (this._fullBackupChild && this.models.full?.right) {
        this.models.full.right.right = this._fullBackupChild;
        this._fullBackupChild = null;
      } else {
        this.initDefaultModels();
      }
      this.isViolating.full = false;
      this.resetValidation();
      this.updateLog('🛡️ RESTORED: Both children restored. Every internal node again has exactly 2 children.');
    }

    // --- COMPLETE TREE OPERATIONS ---

    completeAddNode() {
      const arr = this.completeRawArray || [];
      if (arr.length >= 15) {
        this.updateLog('Complete Tree visualizer capped at 15 nodes for clear diagram readability.');
        return;
      }
      const nextVal = (arr[arr.length - 1] || 10) + 5;
      arr.push(nextVal);
      this.buildCompleteModel(arr);
      this.isViolating.complete = false;
      this.resetValidation();
      this.updateLog(`Added Node [${nextVal}] at index ${arr.length - 1} in level-order. Tree remains complete.`);
    }

    completeRemoveNode() {
      const arr = this.completeRawArray || [];
      if (arr.length <= 3) {
        this.updateLog('Minimum complete tree reached (3 nodes).');
        return;
      }
      const removed = arr.pop();
      this.buildCompleteModel(arr);
      this.isViolating.complete = false;
      this.resetValidation();
      this.updateLog(`Removed last node [${removed}] from index ${arr.length}. Tree remains complete.`);
    }

    completeDemonstrateGap() {
      const arr = [...(this.completeRawArray || [10, 5, 20, 2, 7, 15])];
      if (arr.length >= 5) {
        // Make index 3 null (a gap) while keeping index 4
        this._completeBackupArray = [...arr];
        arr[3] = null;
        this.buildCompleteModel(arr);
        this.isViolating.complete = true;
        this.resetValidation();
        this.updateLog('⚡ GAP VIOLATION CREATED: Index 3 was emptied while index 4 remains occupied! Complete trees require the bottom level to fill contiguously from left to right without any gaps.', 'Gap Violated', '✗ Violated');
      }
    }

    completeRestore() {
      if (this._completeBackupArray) {
        this.buildCompleteModel(this._completeBackupArray);
        this._completeBackupArray = null;
      } else {
        this.buildCompleteModel([10, 5, 20, 2, 7, 15]);
      }
      this.isViolating.complete = false;
      this.resetValidation();
      this.updateLog('🛡️ RESTORED: Gap removed. All nodes in bottom level are left-aligned contiguously.');
    }

    // --- PERFECT TREE OPERATIONS ---

    perfectSetLevel(lvl) {
      this.buildPerfectModel(lvl);
      this.isViolating.perfect = false;
      this.resetValidation();
      this.updateLog(`Regenerated Perfect Binary Tree at level ${lvl} (Height = ${lvl}, Total Nodes = ${Math.pow(2, lvl + 1) - 1}).`);
    }

    perfectGrow() {
      if (this.perfectLevel < 3) {
        this.perfectSetLevel(this.perfectLevel + 1);
      } else {
        this.updateLog('Level 3 (15 nodes) is the maximum recommended level for clear mobile viewports.');
      }
    }

    perfectShrink() {
      if (this.perfectLevel > 0) {
        this.perfectSetLevel(this.perfectLevel - 1);
      } else {
        this.updateLog('Level 0 (1 node root) is the minimum level.');
      }
    }

    perfectDemonstrateMissing() {
      const root = this.models.perfect;
      if (!root || !root.right) return;
      // Remove rightmost leaf
      let curr = root;
      let parent = null;
      while (curr.right) {
        parent = curr;
        curr = curr.right;
      }
      if (parent) {
        this._perfectBackupParent = parent;
        this._perfectBackupLeaf = curr;
        parent.right = null;
        this.isViolating.perfect = true;
        this.resetValidation();
        this.updateLog(`⚡ MISSING LEAF VIOLATION CREATED: Removed leaf [${curr.val}]. The tree is no longer perfect because not all leaves reside at the same level and node count ${this.countTotalNodes(root)} ≠ 2^(h+1)-1.`, 'Violated', '✗ Violated');
      }
    }

    perfectRestore() {
      if (this._perfectBackupParent && this._perfectBackupLeaf) {
        this._perfectBackupParent.right = this._perfectBackupLeaf;
        this._perfectBackupParent = null;
        this._perfectBackupLeaf = null;
      } else {
        this.buildPerfectModel(this.perfectLevel);
      }
      this.isViolating.perfect = false;
      this.resetValidation();
      this.updateLog('🛡️ RESTORED: Missing leaf returned. All leaves once again reside at the identical depth.');
    }

    // --- BALANCED TREE OPERATIONS ---

    balancedInsert(val) {
      if (isNaN(val)) return;
      const values = [...(this.balancedValues || [40, 20, 60, 10, 30, 50, 70])];
      if (values.includes(val)) {
        this.updateLog(`Value ${val} is already present in the demonstration.`);
        return;
      }
      if (values.length >= 15) {
        this.updateLog('Balanced tree capped at 15 nodes for visual clarity.');
        return;
      }
      values.push(val);
      this.buildBalancedModel(values);
      this.isViolating.balanced = false;
      this.resetValidation();
      this.updateLog(`Inserted node [${val}] and recalculated balance factors across all subtrees.`);
    }

    balancedDemonstrateImbalance() {
      // Build an unbalanced skewed branch on a BST
      const unbalancedRoot = new ExplorerNode('ub_root', 30,
        new ExplorerNode('ub_15', 15),
        new ExplorerNode('ub_50', 50,
          null,
          new ExplorerNode('ub_70', 70,
            null,
            new ExplorerNode('ub_85', 85)
          )
        )
      );
      this._balancedBackup = this.models.balanced;
      this.models.balanced = unbalancedRoot;
      this.isViolating.balanced = true;
      this.resetValidation();
      this.updateLog('⚡ IMBALANCE DEMONSTRATED: Added a long right branch (50 → 70 → 85). Root [30] now has left height 1 and right height 3 (BF = -2)! This violates the height-balanced condition |BF| ≤ 1.', 'Imbalance', '✗ Violated');
    }

    balancedRestore() {
      if (this._balancedBackup) {
        this.models.balanced = this._balancedBackup;
        this._balancedBackup = null;
      } else {
        this.buildBalancedModel([40, 20, 60, 10, 30, 50, 70]);
      }
      this.isViolating.balanced = false;
      this.resetValidation();
      this.updateLog('🛡️ RESTORED: Tree reverted to balanced configuration. All balance factors lie within {-1, 0, 1}.');
    }

    // --- DEGENERATE / SKEWED TREE OPERATIONS ---

    degenerateSetDirection(dir) {
      this.degenerateDirection = dir;
      this.buildDegenerateModel(this.degenerateValues, dir);
      this.isViolating.degenerate = false;
      this.resetValidation();
      this.updateLog(`Switched orientation to ${dir === 'left' ? 'Left-Skewed' : 'Right-Skewed'}. Every internal node now has a single ${dir} child.`);
    }

    degenerateAddNode() {
      const vals = [...(this.degenerateValues || [50, 40, 30, 20, 10])];
      if (vals.length >= 8) {
        this.updateLog('Degenerate chain capped at 8 nodes to prevent container overflow.');
        return;
      }
      const last = vals[vals.length - 1];
      const nextVal = this.degenerateDirection === 'left' ? Math.max(1, last - 10) : last + 10;
      vals.push(nextVal);
      this.buildDegenerateModel(vals, this.degenerateDirection);
      this.isViolating.degenerate = false;
      this.resetValidation();
      this.updateLog(`Added Node [${nextVal}] to the degenerate chain. Tree Height is now ${vals.length - 1}.`);
    }

    degenerateRemoveNode() {
      const vals = [...(this.degenerateValues || [50, 40, 30, 20, 10])];
      if (vals.length <= 3) {
        this.updateLog('Minimum degenerate chain length is 3 nodes.');
        return;
      }
      const removed = vals.pop();
      this.buildDegenerateModel(vals, this.degenerateDirection);
      this.isViolating.degenerate = false;
      this.resetValidation();
      this.updateLog(`Removed terminal leaf [${removed}]. Chain length reduced to ${vals.length}.`);
    }

    degenerateDemonstrateBranch() {
      const root = this.models.degenerate;
      if (!root) return;
      // Add a second child to the root or internal node to break degeneracy
      if (this.degenerateDirection === 'left') {
        root.right = new ExplorerNode('d_violate_r', 88);
      } else {
        root.left = new ExplorerNode('d_violate_l', 12);
      }
      this.isViolating.degenerate = true;
      this.resetValidation();
      this.updateLog(`⚡ NON-DEGENERATE BRANCH CREATED: Node [${root.val}] was given a second child! It now has degree 2, violating the Degenerate condition where every internal node must have exactly 1 child.`, 'Violated', '✗ Violated');
    }

    degenerateRestore() {
      const root = this.models.degenerate;
      if (root) {
        if (this.degenerateDirection === 'left') root.right = null;
        else root.left = null;
      } else {
        this.buildDegenerateModel([50, 40, 30, 20, 10], this.degenerateDirection);
      }
      this.isViolating.degenerate = false;
      this.resetValidation();
      this.updateLog('🛡️ RESTORED: Extraneous branch removed. Every internal node once again has strictly 1 child.');
    }

    // ----------------------------------------------------
    // LOGGING HELPER
    // ----------------------------------------------------

    updateLog(msg, step = 'Idle', statusBadge = 'Ready') {
      if (this.telemetryMsgEl) this.telemetryMsgEl.textContent = msg;
      if (this.telemetryStepEl) this.telemetryStepEl.textContent = step;
      if (this.telemetryStatusEl) {
        this.telemetryStatusEl.textContent = statusBadge;
        this.telemetryStatusEl.className = statusBadge.includes('Violated') || statusBadge.includes('✗')
          ? 'speed-pill pill-danger'
          : (statusBadge.includes('✓') ? 'speed-pill pill-success' : 'speed-pill instant');
      }
    }

    // ----------------------------------------------------
    // EVENT BINDINGS
    // ----------------------------------------------------

    bindEvents() {
      // 1. Dual Mode Switcher: BST Operations <-> Tree Type Explorer
      const bstTabBtn = document.getElementById('tab-bst-mode');
      const explorerTabBtn = document.getElementById('tab-explorer-mode');
      const bstView = document.getElementById('bst-lab-view');
      const explorerView = document.getElementById('type-explorer-view');
      const modeTabs = [bstTabBtn, explorerTabBtn].filter(Boolean);

      const activateModeTab = (activeBtn) => {
        if (activeBtn === bstTabBtn) {
          bstTabBtn.classList.add('active');
          bstTabBtn.setAttribute('aria-selected', 'true');
          bstTabBtn.setAttribute('tabindex', '0');
          explorerTabBtn.classList.remove('active');
          explorerTabBtn.setAttribute('aria-selected', 'false');
          explorerTabBtn.setAttribute('tabindex', '-1');

          bstView.style.display = 'block';
          explorerView.style.display = 'none';
        } else {
          explorerTabBtn.classList.add('active');
          explorerTabBtn.setAttribute('aria-selected', 'true');
          explorerTabBtn.setAttribute('tabindex', '0');
          bstTabBtn.classList.remove('active');
          bstTabBtn.setAttribute('aria-selected', 'false');
          bstTabBtn.setAttribute('tabindex', '-1');

          explorerView.style.display = 'block';
          bstView.style.display = 'none';

          this.render();
        }
        activeBtn.focus();
      };

      if (bstTabBtn && explorerTabBtn && bstView && explorerView) {
        bstTabBtn.addEventListener('click', () => activateModeTab(bstTabBtn));
        explorerTabBtn.addEventListener('click', () => activateModeTab(explorerTabBtn));

        modeTabs.forEach((tab, idx) => {
          tab.addEventListener('keydown', (e) => {
            let targetTab = null;
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
              e.preventDefault();
              targetTab = modeTabs[(idx + 1) % modeTabs.length];
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
              e.preventDefault();
              targetTab = modeTabs[(idx - 1 + modeTabs.length) % modeTabs.length];
            } else if (e.key === 'Home') {
              e.preventDefault();
              targetTab = modeTabs[0];
            } else if (e.key === 'End') {
              e.preventDefault();
              targetTab = modeTabs[modeTabs.length - 1];
            }
            if (targetTab) activateModeTab(targetTab);
          });
        });
      }

      // 2. 5 Tree Type Selectors
      const typeBtns = Array.from(document.querySelectorAll('.tree-type-btn'));
      typeBtns.forEach((btn, idx) => {
        btn.addEventListener('click', () => {
          const type = btn.getAttribute('data-type');
          if (type) {
            this.switchType(type);
            btn.focus();
          }
        });

        btn.addEventListener('keydown', (e) => {
          let targetBtn = null;
          if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
            e.preventDefault();
            targetBtn = typeBtns[(idx + 1) % typeBtns.length];
          } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
            e.preventDefault();
            targetBtn = typeBtns[(idx - 1 + typeBtns.length) % typeBtns.length];
          } else if (e.key === 'Home') {
            e.preventDefault();
            targetBtn = typeBtns[0];
          } else if (e.key === 'End') {
            e.preventDefault();
            targetBtn = typeBtns[typeBtns.length - 1];
          }
          if (targetBtn) {
            const type = targetBtn.getAttribute('data-type');
            if (type) {
              this.switchType(type);
              targetBtn.focus();
            }
          }
        });
      });

      // 3. Step Navigation Toolbar
      const playBtn = document.getElementById('step-play-btn');
      if (playBtn) playBtn.addEventListener('click', () => this.togglePlay());

      const nextBtn = document.getElementById('step-next-btn');
      if (nextBtn) nextBtn.addEventListener('click', () => this.stepNext());

      const prevBtn = document.getElementById('step-prev-btn');
      if (prevBtn) prevBtn.addEventListener('click', () => this.stepPrev());

      const resetCheckBtn = document.getElementById('step-reset-btn');
      if (resetCheckBtn) resetCheckBtn.addEventListener('click', () => this.resetValidation());

      const validateBtn = document.getElementById('type-validate-btn');
      if (validateBtn) validateBtn.addEventListener('click', () => this.startValidation());

      // 4. Type Action Buttons: Full
      const fullAddBtn = document.getElementById('full-add-pair-btn');
      if (fullAddBtn) fullAddBtn.addEventListener('click', () => this.fullAddChildPair());

      const fullRemBtn = document.getElementById('full-rem-pair-btn');
      if (fullRemBtn) fullRemBtn.addEventListener('click', () => this.fullRemoveLeafPair());

      const fullViolateBtn = document.getElementById('full-violate-btn');
      if (fullViolateBtn) fullViolateBtn.addEventListener('click', () => this.fullDemonstrateViolation());

      const fullRestoreBtn = document.getElementById('full-restore-btn');
      if (fullRestoreBtn) fullRestoreBtn.addEventListener('click', () => this.fullRestore());

      // Complete Actions
      const compAddBtn = document.getElementById('complete-add-btn');
      if (compAddBtn) compAddBtn.addEventListener('click', () => this.completeAddNode());

      const compRemBtn = document.getElementById('complete-rem-btn');
      if (compRemBtn) compRemBtn.addEventListener('click', () => this.completeRemoveNode());

      const compViolateBtn = document.getElementById('complete-violate-btn');
      if (compViolateBtn) compViolateBtn.addEventListener('click', () => this.completeDemonstrateGap());

      const compRestoreBtn = document.getElementById('complete-restore-btn');
      if (compRestoreBtn) compRestoreBtn.addEventListener('click', () => this.completeRestore());

      // Perfect Actions
      const perfGrowBtn = document.getElementById('perfect-grow-btn');
      if (perfGrowBtn) perfGrowBtn.addEventListener('click', () => this.perfectGrow());

      const perfShrinkBtn = document.getElementById('perfect-shrink-btn');
      if (perfShrinkBtn) perfShrinkBtn.addEventListener('click', () => this.perfectShrink());

      const perfViolateBtn = document.getElementById('perfect-violate-btn');
      if (perfViolateBtn) perfViolateBtn.addEventListener('click', () => this.perfectDemonstrateMissing());

      const perfRestoreBtn = document.getElementById('perfect-restore-btn');
      if (perfRestoreBtn) perfRestoreBtn.addEventListener('click', () => this.perfectRestore());

      // Balanced Actions
      const balInsertBtn = document.getElementById('balanced-insert-btn');
      if (balInsertBtn) {
        balInsertBtn.addEventListener('click', () => {
          const input = document.getElementById('balanced-val-input');
          const val = parseInt(input?.value, 10);
          if (!isNaN(val)) this.balancedInsert(val);
        });
      }

      const balViolateBtn = document.getElementById('balanced-violate-btn');
      if (balViolateBtn) balViolateBtn.addEventListener('click', () => this.balancedDemonstrateImbalance());

      const balRestoreBtn = document.getElementById('balanced-restore-btn');
      if (balRestoreBtn) balRestoreBtn.addEventListener('click', () => this.balancedRestore());

      // Degenerate Actions
      const degenDirLeftBtn = document.getElementById('degen-dir-left');
      const degenDirRightBtn = document.getElementById('degen-dir-right');
      if (degenDirLeftBtn && degenDirRightBtn) {
        degenDirLeftBtn.addEventListener('click', () => {
          degenDirLeftBtn.classList.add('active');
          degenDirRightBtn.classList.remove('active');
          this.degenerateSetDirection('left');
        });
        degenDirRightBtn.addEventListener('click', () => {
          degenDirRightBtn.classList.add('active');
          degenDirLeftBtn.classList.remove('active');
          this.degenerateSetDirection('right');
        });
      }

      const degenAddBtn = document.getElementById('degen-add-btn');
      if (degenAddBtn) degenAddBtn.addEventListener('click', () => this.degenerateAddNode());

      const degenRemBtn = document.getElementById('degen-rem-btn');
      if (degenRemBtn) degenRemBtn.addEventListener('click', () => this.degenerateRemoveNode());

      const degenViolateBtn = document.getElementById('degen-violate-btn');
      if (degenViolateBtn) degenViolateBtn.addEventListener('click', () => this.degenerateDemonstrateBranch());

      const degenRestoreBtn = document.getElementById('degen-restore-btn');
      if (degenRestoreBtn) degenRestoreBtn.addEventListener('click', () => this.degenerateRestore());

      // Reset Active Type Button
      const resetExampleBtn = document.getElementById('type-reset-example-btn');
      if (resetExampleBtn) {
        resetExampleBtn.addEventListener('click', () => {
          this.initDefaultModels();
          this.resetValidation();
          this.updateLog(`Reset ${TYPE_METADATA[this.currentType].name} to standard textbook configuration.`);
        });
      }

      // C Code Tab Buttons
      const cTabs = document.querySelectorAll('.c-code-tab-btn');
      cTabs.forEach(tab => {
        tab.addEventListener('click', () => {
          const type = tab.getAttribute('data-type');
          if (type) this.syncCCodeTab(type);
        });
      });
    }
  }

  // Auto-initialize when interactive lab is loaded
  document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('tree-explorer-svg-stage')) {
      const explorer = new TreeTypeExplorer();
      window.treeTypeExplorer = explorer;

      // Handle URL deep-linking parameters (e.g. ?mode=explorer&type=complete)
      const params = new URLSearchParams(window.location.search);
      if (params.get('theme') === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
      }

      if (params.get('mode') === 'explorer') {
        const explorerTabBtn = document.getElementById('tab-explorer-mode');
        if (explorerTabBtn) explorerTabBtn.click();
      }

      const typeParam = params.get('type');
      if (typeParam && ['full', 'complete', 'perfect', 'balanced', 'degenerate'].includes(typeParam)) {
        explorer.switchType(typeParam);
      }

      if (params.get('violate') === 'true') {
        const curType = explorer.currentType;
        if (curType === 'full') explorer.fullDemonstrateViolation();
        else if (curType === 'complete') explorer.completeDemonstrateGap();
        else if (curType === 'perfect') explorer.perfectDemonstrateMissing();
        else if (curType === 'balanced') explorer.balancedDemonstrateImbalance();
        else if (curType === 'degenerate') explorer.degenerateDemonstrateBranch();
      }

      const stepParam = parseInt(params.get('step'), 10);
      if (!isNaN(stepParam)) {
        explorer.startValidation();
        explorer.applyStep(stepParam);
      }
    }
  });

})();

