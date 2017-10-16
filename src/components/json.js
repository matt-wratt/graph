import React from 'react'

export default ({ value }) => <pre>{ typeof value === "string" ? value : JSON.stringify(value) }</pre>