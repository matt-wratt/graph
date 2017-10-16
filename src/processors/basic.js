const defaultRunOptions = {
  log: console.log.bind(console),
  step: f => f()
}

export default ([nodes, edges], { log } = defaultRunOptions) => {
  return [
    edges.reduce((nodes, [{ node: aIndex }, { node: bIndex, port }]) => {
      const a = Object.assign({ index: aIndex }, nodes[aIndex])
      const b = Object.assign({ index: bIndex }, nodes[bIndex])
      a.out = a.implementation(a.state, a.inputs)
      b.inputs[port] = a.out
      b.out = b.implementation(b.state, b.inputs)
      log({from: a.toString(), _: '->', to: b.toString() })
      nodes = Object.assign({}, nodes, { [aIndex]: a, [bIndex]: b })
      return nodes
    }, nodes),
    edges
  ]
}