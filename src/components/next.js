import { Component } from 'react'

export default class Next extends Component {
  state = { child: null }

  componentDidMount () {
    this.props.next(child => this.setState({ child }))
  }

  render () {
    return this.state.child
  }
}