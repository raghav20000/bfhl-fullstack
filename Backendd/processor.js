
function isValidEntry(raw) {
  const entry = raw.trim();
  if (!entry) return false;
  const regex = /^([A-Z])->([A-Z])$/;
  const match = entry.match(regex);
  if (!match) return false;
  if (match[1] === match[2]) return false; 
  return true;
}


function parseEntry(raw) {
  const entry = raw.trim();
  const [parent, child] = entry.split('->');
  return { parent, child };
}

function processBFHL(data, user_id, email_id, college_roll_number) {
  const invalid_entries = [];
  const duplicate_edges = [];
  const seenEdges = new Set();
  const seenDuplicates = new Set();
  const validEdges = [];

  
  for (const raw of data) {
    const trimmed = (typeof raw === 'string') ? raw.trim() : String(raw).trim();

    if (!isValidEntry(trimmed)) {
      invalid_entries.push(trimmed === '' ? raw : trimmed);
      continue;
    }

    const key = trimmed;
    if (seenEdges.has(key)) {
     
      if (!seenDuplicates.has(key)) {
        duplicate_edges.push(key);
        seenDuplicates.add(key);
      }
    } else {
      seenEdges.add(key);
      validEdges.push(parseEntry(trimmed));
    }
  }

  
  const childParentMap = new Map(); 
  const adjacency = new Map();     
  const allNodes = new Set();

  for (const { parent, child } of validEdges) {
    allNodes.add(parent);
    allNodes.add(child);

    if (childParentMap.has(child)) {
     
      continue;
    }
    childParentMap.set(child, parent);

    if (!adjacency.has(parent)) adjacency.set(parent, []);
    adjacency.get(parent).push(child);
  }

  const roots = [];
  for (const node of allNodes) {
    if (!childParentMap.has(node)) {
      roots.push(node);
    }
  }

  const visited = new Set();
  const components = [];

  function getComponentNodes(startNode) {
    const comp = new Set();
    const stack = [startNode];
    while (stack.length) {
      const n = stack.pop();
      if (comp.has(n)) continue;
      comp.add(n);
      if (adjacency.has(n)) {
        for (const c of adjacency.get(n)) stack.push(c);
      }
      if (childParentMap.has(n)) {
        stack.push(childParentMap.get(n));
      }
    }
    return comp;
  }

  const rootedComponentNodes = new Set();
  for (const root of roots.sort()) {
    if (visited.has(root)) continue;
    const comp = getComponentNodes(root);
    comp.forEach(n => visited.add(n));
    comp.forEach(n => rootedComponentNodes.add(n));
    components.push({ root, nodes: comp });
  }

  const cycleNodes = [];
  for (const node of allNodes) {
    if (!visited.has(node)) cycleNodes.push(node);
  }

  // Group cycle nodes into their own components
  const cycleVisited = new Set();
  for (const node of cycleNodes.sort()) {
    if (cycleVisited.has(node)) continue;
    const comp = getComponentNodes(node);
    comp.forEach(n => cycleVisited.add(n));
    const cycleRoot = [...comp].sort()[0];
    components.push({ root: cycleRoot, nodes: comp, isPureCycle: true });
  }

  function hasCycleDFS(compNodes) {
    const WHITE = 0, GRAY = 1, BLACK = 2;
    const color = {};
    for (const n of compNodes) color[n] = WHITE;

    function dfs(u) {
      color[u] = GRAY;
      const children = adjacency.get(u) || [];
      for (const v of children) {
        if (!compNodes.has(v)) continue;
        if (color[v] === GRAY) return true;
        if (color[v] === WHITE && dfs(v)) return true;
      }
      color[u] = BLACK;
      return false;
    }

    for (const n of compNodes) {
      if (color[n] === WHITE) {
        if (dfs(n)) return true;
      }
    }
    return false;
  }

  // Step 5: Build tree object recursively
  function buildTree(node, compNodes) {
    const children = (adjacency.get(node) || []).filter(c => compNodes.has(c));
    const treeObj = {};
    for (const child of children) {
      treeObj[child] = buildTree(child, compNodes);
    }
    return treeObj;
  }

  // Step 6: Depth calculation (nodes on longest root-to-leaf path)
  function calcDepth(node, compNodes) {
    const children = (adjacency.get(node) || []).filter(c => compNodes.has(c));
    if (children.length === 0) return 1;
    return 1 + Math.max(...children.map(c => calcDepth(c, compNodes)));
  }

  // Step 7: Build hierarchies
  const hierarchies = [];

  for (const { root, nodes, isPureCycle } of components) {
    const cycleDetected = isPureCycle || hasCycleDFS(nodes);

    if (cycleDetected) {
      hierarchies.push({ root, tree: {}, has_cycle: true });
    } else {
      const tree = {};
      tree[root] = buildTree(root, nodes);
      const depth = calcDepth(root, nodes);
      hierarchies.push({ root, tree, depth });
    }
  }

  // Step 8: Summary
  const nonCyclic = hierarchies.filter(h => !h.has_cycle);
  const cyclic = hierarchies.filter(h => h.has_cycle);

  let largest_tree_root = '';
  if (nonCyclic.length > 0) {
    // Sort by depth desc, then lex asc for tiebreaker
    const sorted = [...nonCyclic].sort((a, b) => {
      if (b.depth !== a.depth) return b.depth - a.depth;
      return a.root.localeCompare(b.root);
    });
    largest_tree_root = sorted[0].root;
  }

  return {
    user_id,
    email_id,
    college_roll_number,
    hierarchies,
    invalid_entries,
    duplicate_edges,
    summary: {
      total_trees: nonCyclic.length,
      total_cycles: cyclic.length,
      largest_tree_root
    }
  };
}

module.exports = { processBFHL };
