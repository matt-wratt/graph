
export default ([nodes, edges]) => {
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