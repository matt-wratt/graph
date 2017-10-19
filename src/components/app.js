import React, { Component } from 'react'
import spec from '../specs/basic'
import graph from '../graphs/basic'
import runReactive from '../processors/reactive'
import Output from './output'
import Graph from './graph'

export default class App extends Component {
  render () {
    return (
      <div className="workspace" style={{ fontFamily: 'verdana !important' }}>
        <Graph graph={runReactive(graph(spec))} />
        <Output processor={runReactive} graph={graph(spec)} />
      </div>
    )
  }
}