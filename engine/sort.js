export function topologicalSort(nodes, edges) {
  // Initialize indegree map
  const indegree = new Map()
  nodes.forEach(node => indegree.set(node.id, 0))

  // Fill the indegree map
  edges.forEach(edge => {
    indegree.set(edge.target, indegree.get(edge.target) + 1)
  })

  // Initialize a queue with nodes of indegree 0
  const queue = []
  indegree.forEach((value, key) => {
    if (value === 0) queue.push(key)
  })

  // Array to store the topological order
  const sorted = []

  while (queue.length) {
    const node = queue.shift()
    sorted.push(node)

    // Decrease the indegree of all adjacent nodes
    edges.forEach(edge => {
      const from = edge.source
      const to = edge.target
      if (from === node) {
        indegree.set(to, indegree.get(to) - 1)
        if (indegree.get(to) === 0) queue.push(to)
      }
    })
  }

  // Check if there was a cycle
  if (sorted.length !== nodes.length) {
    throw new Error('Graph has at least one cycle')
  }

  return sorted
}
