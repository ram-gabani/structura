/**
 * GRAPH INTERACTIVE LAB ENGINE
 * Network Vertex-Edge Graph Visualizer with BFS (Queue) and DFS (Stack) Traversal Animations,
 * Visited Array Tracking, and Live Step Telemetry.
 */

class GraphLabEngine {
  constructor() {
    this.vertices = ['A', 'B', 'C', 'D', 'E', 'F'];
    // Vertex pixel coordinates in 100% stage
    this.coords = {
      'A': { x: 15, y: 35 },
      'B': { x: 42, y: 18 },
      'C': { x: 42, y: 65 },
      'D': { x: 72, y: 22 },
      'E': { x: 72, y: 65 },
      'F': { x: 92, y: 45 }
    };

    // Adjacency List for undirected graph
    this.adjList = {
      'A': ['B', 'C'],
      'B': ['A', 'D', 'E'],
      'C': ['A', 'E'],
      'D': ['B', 'F'],
      'E': ['B', 'C', 'F'],
      'F': ['D', 'E']
    };

    this.edges = [
      ['A', 'B'], ['A', 'C'],
      ['B', 'D'], ['B', 'E'],
      ['C', 'E'],
      ['D', 'F'],
      ['E', 'F']
    ];

    this.isAnimating = false;
    this.speedMs = 650;

    this.stageEl = document.getElementById('graph-stage');
    this.logMsgEl = document.getElementById('graph-log-msg');
    this.logStepEl = document.getElementById('graph-log-step');
    this.logStatusEl = document.getElementById('graph-log-status');
    this.streamEl = document.getElementById('graph-visited-stream');
    this.dsDisplayEl = document.getElementById('graph-ds-display');
  }

  setSpeed(val) {
    this.speedMs = 1500 - (val * 260);
  }

  sleep() {
    return new Promise(resolve => setTimeout(resolve, this.speedMs));
  }

  updateLog(message, step = 'Idle', statusBadge = 'Ready') {
    if (this.logMsgEl) this.logMsgEl.textContent = message;
    if (this.logStepEl) this.logStepEl.textContent = step;
    if (this.logStatusEl) this.logStatusEl.textContent = statusBadge;
  }

  setDisabled(disabled) {
    this.isAnimating = disabled;
    const inputs = document.querySelectorAll('.graph-btn, .graph-select');
    inputs.forEach(el => { el.disabled = disabled; });
    const resetBtn = document.getElementById('graph-reset-btn');
    if (resetBtn) resetBtn.disabled = false;
  }

  render(vertexStates = {}, activeEdges = {}) {
    if (!this.stageEl) return;

    let svgLines = '';
    this.edges.forEach(([u, v]) => {
      const p1 = this.coords[u];
      const p2 = this.coords[v];
      const edgeKey1 = `${u}-${v}`;
      const edgeKey2 = `${v}-${u}`;
      const edgeState = activeEdges[edgeKey1] || activeEdges[edgeKey2] || '';

      svgLines += `
        <line x1="${p1.x}%" y1="${p1.y}%" x2="${p2.x}%" y2="${p2.y}%" 
              class="graph-edge-line ${edgeState}" id="edge-${u}-${v}"/>
      `;
    });

    let verticesHtml = '';
    this.vertices.forEach(v => {
      const p = this.coords[v];
      const state = vertexStates[v] || 'state-unvisited';

      verticesHtml += `
        <div class="graph-vertex ${state}" id="vtx-${v}" 
             style="left: ${p.x}%; top: ${p.y}%;">
          ${v}
        </div>
      `;
    });

    this.stageEl.innerHTML = `
      <svg class="graph-svg">
        ${svgLines}
      </svg>
      ${verticesHtml}
    `;
  }

  async runBFS(startNode = 'A') {
    if (this.isAnimating) return;
    this.setDisabled(true);

    const visited = {};
    const queue = [startNode];
    visited[startNode] = true;

    const vStates = {};
    const eStates = {};
    vStates[startNode] = 'state-queued';

    const visitedOrder = [];
    this.updateLog(`Starting Breadth-First Search (BFS) from Vertex ${startNode} using FIFO Queue...`, 'BFS Started', '⏳ Queueing');
    this.render(vStates, eStates);
    if (this.dsDisplayEl) this.dsDisplayEl.textContent = `Queue: [ ${queue.join(', ')} ]`;
    await this.sleep();

    while (queue.length > 0) {
      const curr = queue.shift();
      visitedOrder.push(curr);
      vStates[curr] = 'state-active';

      if (this.streamEl) {
        this.streamEl.innerHTML = visitedOrder.map(n => `<span class="tree-stream-item">${n}</span>`).join(' ');
      }
      if (this.dsDisplayEl) this.dsDisplayEl.textContent = `Queue: [ ${queue.join(', ')} ]`;

      this.updateLog(`Dequeued ${curr} for exploration. Inspecting adjacent neighbors...`, `Visiting ${curr}`, '🚶 Scanning');
      this.render(vStates, eStates);
      await this.sleep();

      const neighbors = this.adjList[curr];
      for (let i = 0; i < neighbors.length; i++) {
        const neighbor = neighbors[i];
        const edgeKey = `${curr}-${neighbor}`;

        if (!visited[neighbor]) {
          visited[neighbor] = true;
          queue.push(neighbor);
          vStates[neighbor] = 'state-queued';
          eStates[edgeKey] = 'active';

          if (this.dsDisplayEl) this.dsDisplayEl.textContent = `Queue: [ ${queue.join(', ')} ]`;
          this.updateLog(`Discovered unvisited neighbor ${neighbor}. Marking visited[${neighbor}]=1 and enqueueing...`, `Enqueue ${neighbor}`, '📥 Enqueued');
          this.render(vStates, eStates);
          await this.sleep();
        }
      }

      vStates[curr] = 'state-visited';
      this.render(vStates, eStates);
    }

    this.updateLog(`BFS Complete! Visited all reachable vertices: ${visitedOrder.join(' → ')} in O(V + E) time.`, 'Complete', '✓ BFS Done');
    this.setDisabled(false);
  }

  async runDFS(startNode = 'A') {
    if (this.isAnimating) return;
    this.setDisabled(true);

    const visited = {};
    const vStates = {};
    const eStates = {};
    const visitedOrder = [];
    const callStack = [];

    this.updateLog(`Starting Depth-First Search (DFS) from Vertex ${startNode} using LIFO Call Stack...`, 'DFS Started', '⏳ Exploring');

    const dfsVisit = async (u) => {
      visited[u] = true;
      visitedOrder.push(u);
      callStack.push(u);

      vStates[u] = 'state-active';
      if (this.streamEl) {
        this.streamEl.innerHTML = visitedOrder.map(n => `<span class="tree-stream-item">${n}</span>`).join(' ');
      }
      if (this.dsDisplayEl) this.dsDisplayEl.textContent = `Call Stack: [ ${callStack.join(' → ')} ]`;

      this.updateLog(`Pushed ${u} onto call stack. Exploring deepest unvisited branch...`, `Visiting ${u}`, '🚶 Branching');
      this.render(vStates, eStates);
      await this.sleep();

      const neighbors = this.adjList[u];
      for (let i = 0; i < neighbors.length; i++) {
        const v = neighbors[i];
        const edgeKey = `${u}-${v}`;

        if (!visited[v]) {
          eStates[edgeKey] = 'active';
          this.render(vStates, eStates);
          await dfsVisit(v);
        }
      }

      vStates[u] = 'state-visited';
      callStack.pop();
      if (this.dsDisplayEl) this.dsDisplayEl.textContent = `Call Stack: [ ${callStack.join(' → ')} ]`;
      this.updateLog(`Finished exploring all paths from ${u}. Backtracking...`, `Backtrack from ${u}`, '↩ Backtracking');
      this.render(vStates, eStates);
      await this.sleep();
    };

    await dfsVisit(startNode);

    this.updateLog(`DFS Complete! Visited all reachable vertices: ${visitedOrder.join(' → ')} in O(V + E) time.`, 'Complete', '✓ DFS Done');
    this.setDisabled(false);
  }

  reset() {
    this.render();
    if (this.streamEl) {
      this.streamEl.innerHTML = `<span style="color: var(--text-muted); font-size: 0.78rem;">Visited stream will appear here...</span>`;
    }
    if (this.dsDisplayEl) {
      this.dsDisplayEl.textContent = `Data Structure: Idle`;
    }
    this.updateLog(`Graph network reset to default unvisited state.`, 'Reset', 'Ready');
    this.setDisabled(false);
  }
}

// Auto-initialize when canvas exists
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('graph-stage')) {
    const engine = new GraphLabEngine();
    window.graphEngine = engine;
    engine.render();

    const bfsBtn = document.getElementById('graph-bfs-btn');
    if (bfsBtn) {
      bfsBtn.addEventListener('click', () => {
        const start = document.getElementById('graph-start-node').value || 'A';
        engine.runBFS(start);
      });
    }

    const dfsBtn = document.getElementById('graph-dfs-btn');
    if (dfsBtn) {
      dfsBtn.addEventListener('click', () => {
        const start = document.getElementById('graph-start-node').value || 'A';
        engine.runDFS(start);
      });
    }

    const resetBtn = document.getElementById('graph-reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => engine.reset());
    }

    const speedSlider = document.getElementById('graph-speed-slider');
    if (speedSlider) {
      speedSlider.addEventListener('input', (e) => {
        engine.setSpeed(parseInt(e.target.value, 10));
      });
    }

    const params = new URLSearchParams(window.location.search);
    if (params.get('theme') === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    }
    const action = params.get('action');
    if (action === 'bfs') {
      const start = params.get('start') || 'A';
      setTimeout(() => engine.runBFS(start), 150);
    } else if (action === 'dfs') {
      const start = params.get('start') || 'A';
      setTimeout(() => engine.runDFS(start), 150);
    }
  }
});
