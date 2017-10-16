import React, { Component } from 'react';
import { render } from 'react-dom';
import * as _d3 from 'd3';
import { graphviz } from 'd3-graphviz';

const d3 = Object.assign({ graphviz }, _d3)

const graph = ({ value, add, tap, defaultValue, either, greater, not }) => {
  const nodes = {
    a: value({ value: 5 }),
    b: value({ value: 10 }),
    add1: add(),
    add2: add(),
    add3: add(),
    tap1: tap(),
    tap2: tap(),
    tap3: tap(),
    tap4: tap(),
    either: either(),
    not: not(),
    greater: greater(),
  }
  const edges = [
    [{ node: 'a' }, { node: 'add1', port: 'a' }],
    [{ node: 'b' }, { node: 'add1', port: 'b' }],
    [{ node: 'add1' }, { node: 'tap1', port: 'a' }],
    [{ node: 'add1' }, { node: 'greater', port: 'a' }],
    [{ node: 'a' }, { node: 'greater', port: 'b' }],
    [{ node: 'tap1' }, { node: 'add2', port: 'a' }],
    [{ node: 'b' }, { node: 'add2', port: 'b' }],
    [{ node: 'add2' }, { node: 'tap2', port: 'a' }],
    [{ node: 'tap2' }, { node: 'add3', port: 'b' }],
    [{ node: 'greater' }, { node: 'not', port: 'a' }],
    [{ node: 'not' }, { node: 'either', port: 'condition' }],
    [{ node: 'add2' }, { node: 'either', port: 'right' }],
    [{ node: 'a' }, { node: 'either', port: 'left' }],
    [{ node: 'either' }, { node: 'tap3', port: 'a' }],
    [{ node: 'tap3' }, { node: 'add3', port: 'a' }],
    [{ node: 'add3' }, { node: 'tap4', port: 'a' }],

  ]
  return [nodes, edges]
}

const keys = Object.keys.bind(Object)

const dedupe = a => {
  return a.reduce((b, c) => {
    return b.indexOf(c) !== -1 ? b : [...b, c]
  }, [])
}

const flatten = a => {
  return a.reduce((b, c) => {
    return Array.isArray(c) ? [...b, ...c] : [...b, c]
  }, [])
}

const spec = (() => {

  const defaultNode = {
    name: 'node',
    inputs: {},
    state: {},
    implementation: () => undefined,
    toString() {
      const desc = [
        this.name,
        this.index,
        JSON.stringify(this.inputs),
        JSON.stringify(this.state),
        JSON.stringify(this.out),
      ].join(' ')
      return `[${desc}]`
    }
  }

  const node = (spec) => {
    return Object.assign({}, defaultNode, spec)
  }

  const value = {
    state: { value: 0 },
    implementation: ({ value = 0 }) => value,
  }

  const add = {
    inputs: { a: Number, b: Number },
    implementation: ({ }, { a = 0, b = 0 }) => Number(a) + Number(b),
  }

  const tap = {
    inputs: { a: undefined },
    implementation: ({ }, { a }) => (console.log('tap', a), a),
  }

  const defaultValue = {
    inputs: { a: undefined },
    state: { value: undefined },
    implementation: ({ value }, { a }) => a === undefined ? value : a,
  }

  const either = {
    inputs: { condition: Boolean, left: undefined, right: undefined },
    implementation: ({ }, { condition, left, right }) => condition ? left : right,
  }

  const greater = {
    inputs: { a: Number, b: Number },
    implementation: ({ }, { a, b }) => a > b,
  }

  const not = {
    inputs: { a: Boolean },
    implementation: ({ }, { a }) => !a,
  }

  const map = a => b => (Object.keys(b).map((k, i) => b[k] = a(k, b[k], i)), b)

  const make = map((name, spec) => (state = {}) => {
    console.log(name)
    return Object.assign(node(spec), { name: name, state: state })
  })

  return make({
    value, add, tap, defaultValue, either, greater, not
  })
})()

const Spec = props =>
  <div className="spec">{JSON.stringify(props)}</div>

const uiSpec = (spec => {
  const map = a => b => (Object.keys(b).map(k => b[k] = a(k, b[k])), b)
  let x = 0
  let y = 300
  const make = map((name, spec) => (state = {}) => {
    x += 100
    return { x: x, y: y, ...spec(state) }
  })

  return make(Object.assign({}, spec))
})(spec)

const defaultRunOptions = {
  log: console.log.bind(console),
  step: f => f()
}

const run = ([nodes, edges], { log } = defaultRunOptions) => {
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

const runReactive = ([nodes, edges], { log, step } = defaultRunOptions) => {
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

const dot = ([nodes, edges]) => {
  edges = edges.reduce((text, [{ node: aIndex }, { node: bIndex, port }]) => {
    const a = nodes[aIndex]
    const b = nodes[bIndex]
    const extra = b.name !== 'tap' ? '' : ([
      ' ',
      bIndex,
      '->',
      `${bIndex}value`,
      `[arrowhead="none"; style="dashed"];`
    ].join(' ') + '\n')
    return [
      text,
      '',
      aIndex,
      '->',
      bIndex,
      `[headlabel="${port}"; fontname=verdana; fontsize="11pt"; fontcolor="#999999"];`
    ].join(' ') + '\n' + extra
  }, '')
  nodes = Object.keys(nodes).reduce((text, index) => {
    const { name, value } = nodes[index]
    const extra = name !== 'tap' ? '' :
      `\n  node [shape=box fontname=verdana fontsize="11pt" label="${value}" style="dashed"]; ${index}value;`
    return [
      text,
      `  node [shape=ellipse fontname=verdana fontsize="11pt" style="solid" label="${name}${name === 'value' ? `(${index})` : ''}"]; ${index};`
    ].join('\n') + extra
  }, '')
  return `digraph G {\n  rankdir="LR";\n\n${nodes}\n\n\n${edges}\n}`
}

const Node = ({ x = 50, y = 50, name = 'Node' }) =>
  <div className="node" style={{ left: x, top: y }}>{name}</div>

const edge = nodes => ([{ node: aIndex }, { node: bIndex, port }]) =>
  <div className="edge">Edge {aIndex} {bIndex} {port}</div>

const Json = ({ value }) => <pre>{ typeof value === "string" ? value : JSON.stringify(value) }</pre>

const Output = ({ processor, graph, flat = true }) => {
  const output = []
  processor(graph, { log: (...args) => output.push(args) })
  const rows = flatten(output)
  const columns = dedupe(rows.reduce((cols, row) => [...cols, ...keys(row)], []))
  debugger
  return (
    <table>
      <thead>
        { columns.map(col => <th>{col}</th>) }
      </thead>
      <tbody>
        { rows.map(row => <tr>{ columns.map(col => <td><Json value={row[col]} /></td>) }</tr>) }
      </tbody>
    </table>
  )
  return <pre>{rows.join('\n')}</pre>
}

export default class App extends Component {
  newNode = (e) => {
    const nodes = this.state.nodes || []
    const x = e.clientX
    const y = e.clientY
    this.setState({
      nodes: [{ name: 'Node', x: x, y: y }].concat(nodes)
    })
    console.log(this.state)
  }

  componentDidMount () {
    d3.select('#graph')
      .graphviz().renderDot(dot(runReactive(graph(spec))))
  }

  render () {
    return (
      <div className="workspace" style={{ fontFamily: 'verdana !important' }}>
        <div id="graph"></div>
        <Output processor={runReactive} graph={graph(spec)} />
        <Output processor={run} graph={graph(spec)} />
        <pre style={{ padding: '1em' }}>{dot(runReactive(graph(spec)))}</pre>
      </div>
    );
  }
}

if (typeof window !== "undefined") {
  render(<App />, document.getElementById("root"));
}
