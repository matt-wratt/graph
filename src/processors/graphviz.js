import { keys } from '../utils'

const flip = f => a => b => f(b)(a)
const pipe = (...fn) => a => fn.reduce((b, f) => f(b), a)
const prop = a => b => b[a]
const propFrom = flip(prop)
const eq = expected => actual => actual === expected

const joinProps = attrs => {
  return keys(attrs).map(key => `${key}="${attrs[key]}"`).join(' ')
}

const fontDefaults = {
  fontname: 'verdana',
  fontsize: '11pt',
}

const nodeDefaults = {
  ...fontDefaults,
  shape: 'ellipse',
  style: 'solid',
}

const edgeDefaults = {
  ...fontDefaults,
  fontcolor: '#999999',
  style: 'solid',
}

export default ([nodes, edges]) => {
  nodes = keys(nodes).map(propFrom(nodes))

  const tapFilter =
    pipe(prop('name'), eq('tap'))

  const emptyGraph = { lines: [], indent: 0 }

  const build = (graph, ...lines) => {
    let indent = graph.indent || 0
    return {
      lines: graph.lines.concat(lines.map(line => {
        if (line.match(/\}$/)) --indent
        let tab = ''
        for (let i = 0; i < indent; ++i) {
          tab += '  '
        }
        if (line.match(/\{$/)) ++indent
        return tab + line
      })),
      indent: indent
    }
  }

  const buildSubset = (graph, nodes, edges, { nodeMap, edgeMap, nodeAttrs = {}, edgeAttrs = {} }) => {
    graph = build(graph, '', `edge [${joinProps({ ...edgeDefaults, ...edgeAttrs })}]`)
    graph = build(graph, `node [${joinProps({ ...nodeDefaults, ...nodeAttrs })}]`)
    graph = build(graph, ...nodes.map(nodeMap).map(([index, attrs]) => `node [${joinProps(attrs)}] ${index};`))
    graph = build(graph, ...edges.map(edgeMap).map(([a, b, attrs]) => `${a} -> ${b} [${joinProps(attrs)}]`))
    return graph
  }

  let dotGraph = build(emptyGraph, 'digraph X {', 'rankdir="LR"')

  // all nodes/edges
  dotGraph = buildSubset(dotGraph, nodes, edges, {
    nodeMap: ({ name, index }) => [index, { label: name }],
    edgeMap: ([{ node: a }, { node: b, port }]) => [a, b, { headlabel: port }],
  })

  // additional tap output nodes/edges
  dotGraph = buildSubset(dotGraph, nodes.filter(tapFilter), nodes.filter(tapFilter), {
    nodeMap: ({ value, index }) => [`${index}_output`, { label: value }],
    edgeMap: ({ index }) => [index, `${index}_output`, { arrowhead: "none" }],
    nodeAttrs: { shape: 'box', style: 'dashed' },
  })

  dotGraph = build(dotGraph, '}')

  return dotGraph.lines.join('\n')
}