export const keys = Object.keys.bind(Object)

export const dedupe = a => {
  return a.reduce((b, c) => {
    return b.indexOf(c) !== -1 ? b : [...b, c]
  }, [])
}

export const flatten = a => {
  return a.reduce((b, c) => {
    return Array.isArray(c) ? [...b, ...c] : [...b, c]
  }, [])
}