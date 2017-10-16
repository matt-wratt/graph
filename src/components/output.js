import React from 'react'
import { flatten, dedupe, keys } from '../utils'
import Json from './json'

export default ({ processor, graph, flat = true }) => {
  const output = []
  processor(graph, { log: (...args) => output.push(args) })
  const rows = flatten(output)
  const columns = dedupe(rows.reduce((cols, row) => [...cols, ...keys(row)], []))
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
}