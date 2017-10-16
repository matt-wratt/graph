import React, { Component } from 'react'
import dot from '../processors/graphviz'
import * as _d3 from 'd3'
import { graphviz } from 'd3-graphviz'

const d3 = Object.assign({ graphviz }, _d3)

let id = 0

export default class Graph extends Component {
  get graphId () {
    return `graph${this.id}`
  }
  get selector () {
    return `#${this.graphId}`
  }

  constructor (props) {
    super(props)
    this.id = ++id
  }

  graphDescription () {
    return dot(this.props.graph)
  }

  componentDidMount () {
    d3.select(this.selector)
      .graphviz().renderDot(this.graphDescription())
  }

  render () {
    return (
      <div>
        <div id={ this.graphId }></div>
        <pre>{ this.graphDescription() }</pre>
      </div>
    )
  }
}