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
    this.state = { graph: [{}, []] }
    this.id = ++id
  }

  componentDidMount () {
    this.props.graph.subscribe((graph, iteration) => this.setState({ graph: graph, activeNodes: iteration }))
  }

  graphDescription () {
    return dot(this.state.graph, { highlight: this.state.activeNodes, highlightColor: "green2" })
  }



  renderGraph = () => {
    try {
      this.graphviz = this.graphviz || d3.select(this.selector).graphviz()
      this.graphviz
        .dot(this.graphDescription())
        .render()
    } catch (err) {
      console.error('Graph Component: ', err)
    }
  }

  render () {
    setTimeout(() => this.renderGraph(), 0)
    return (
      <div>
        <div id={ this.graphId }></div>
        <pre>{ this.graphDescription() }</pre>
      </div>
    )
  }
}