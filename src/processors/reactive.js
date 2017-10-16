import { keys, dedupe } from '../utils'

const defaultRunOptions = {
  log: console.log.bind(console),
  step: f => f()
}

export default ([nodes, edges], { log, step } = defaultRunOptions) => {
  const nextTick = f => setTimeout(f, 0)
  const map = a => b => (Object.keys(b).map((k, i) => b[k] = a(k, b[k], i)), b)

  const nodeEdges = node => {
    return edges.reduce((edges, edge) => {
      const [{ node: a }, { node: b, port }] = edge
      return a === node || b === node ? [edge].concat(edges) : edges
    }, [])
  }

  const isUpStream = node => edge => {
    const [{ node: a }, _] = edge
    return node === a
  }

  const isDownStream = node => edge => {
    const [_, { node: b }] = edge
    return node === b
  }

  const getAll = a => b => {
    return b.reduce((all, x) => a(x) ? [x].concat(all) : all, [])
  }

  const node = (k, a) => {
    return {
      desc: a,
      name: a.name,
      index: k,
      up: getAll(isDownStream(k))(edges),
      down: getAll(isUpStream(k))(edges),
      value: undefined,
    }
  }

  nodes = map(node)(nodes)

  const startingNodes = edges.reduce((nodes, [_, { node }]) => {
    const index = nodes.indexOf(node)
    return index === -1 ? nodes : [
      ...nodes.slice(0, index),
      ...nodes.slice(index + 1)
    ]
  }, keys(nodes))

  const iterate = ([nodes, edges], keys) => {
    return [
      [nodes, edges],
      dedupe(keys.reduce((next, index) => {
        const node = nodes[index]
        const inputs = node.up.reduce((inputs, [{ node }, { port }]) => {
          return Object.assign(inputs, { [port]: nodes[node].value })
        }, {})
        node.value = node.desc.implementation(node.desc.state, inputs)
        log({ name: node.name, index: node.index, value: `${node.value}`, inputs: inputs, state: node.desc.state, next: node.down.map(([_, { node }]) => node) })
        return next.concat(node.down.map(([_, { node }]) => node))
      }, []))
    ]
  }

  let graph = [nodes, edges]
  let iteration = startingNodes
  while ([graph, iteration] = iterate(graph, iteration), iteration.length) { }

  return graph
}