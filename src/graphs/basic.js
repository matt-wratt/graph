export default ({ value, add, tap, defaultValue, either, greater, not }) => {
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