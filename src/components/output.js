import React from 'react'
import { flatten, dedupe, keys } from '../utils'
import Json from './json'
import Next from './next'

export default ({ processor, graph, flat = true }) => {
  const next = (next) => {
    const output = []
    processor(graph, { log: (...args) => output.push(args) }).subscribe(graph => {
      const rows = flatten(output)
      const columns = dedupe(rows.reduce((cols, row) => [...cols, ...keys(row)], []))
      next(
        <table>
          <thead>
            <tr>
              { columns.map(col => <th key={col}>{col}</th>) }
            </tr>
          </thead>
          <tbody>
            { rows.map((row, i) => <tr key={i}>{ columns.map(col => <td key={col}><Json value={row[col]} /></td>) }</tr>) }
          </tbody>
        </table>
      )
    })
  }
  return <Next next={next} />
}