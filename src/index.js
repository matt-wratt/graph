import React from 'react'
import { render } from 'react-dom'
import App from './components/app'

if (typeof window !== "undefined") {
  render(<App />, document.getElementById("root"))
}
