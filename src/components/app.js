import React, { Component } from 'react'
import spec from '../specs/basic'
import graph from '../graphs/basic'
import run from '../processors/basic'
import runReactive from '../processors/reactive'
import dot from '../processors/graphviz'
import Output from './output'
import * as _d3 from 'd3'
import { graphviz } from 'd3-graphviz'

const d3 = Object.assign({ graphviz }, _d3)

export default class App extends Component {
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