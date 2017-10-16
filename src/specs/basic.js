const makeSpec = () => {

    const defaultNode = {
      name: 'node',
      inputs: {},
      state: {},
      implementation: () => undefined,
      toString() {
        const desc = [
          this.name,
          this.index,
          JSON.stringify(this.inputs),
          JSON.stringify(this.state),
          JSON.stringify(this.out),
        ].join(' ')
        return `[${desc}]`
      }
    }

    const node = (spec) => {
      return Object.assign({}, defaultNode, spec)
    }

    const value = {
      state: { value: 0 },
      implementation: ({ value = 0 }) => value,
    }

    const add = {
      inputs: { a: Number, b: Number },
      implementation: (_, { a = 0, b = 0 }) => Number(a) + Number(b),
    }

    const tap = {
      inputs: { a: undefined },
      implementation: (_, { a }) => {
        console.log('tap', a)
        return a
      }
    }

    const defaultValue = {
      inputs: { a: undefined },
      state: { value: undefined },
      implementation: ({ value }, { a }) => a === undefined ? value : a,
    }

    const either = {
      inputs: { condition: Boolean, left: undefined, right: undefined },
      implementation: (_, { condition, left, right }) => condition ? left : right,
    }

    const greater = {
      inputs: { a: Number, b: Number },
      implementation: (_, { a, b }) => a > b,
    }

    const not = {
      inputs: { a: Boolean },
      implementation: (_, { a }) => !a,
    }

    const map = a => b => {
      Object.keys(b).map((k, i) => b[k] = a(k, b[k], i))
      return b
    }

    const make = map((name, spec) => (state = {}) => {
      console.log(name)
      return Object.assign(node(spec), { name: name, state: state })
    })

    return make({
      value, add, tap, defaultValue, either, greater, not
    })
  }

  export default makeSpec()