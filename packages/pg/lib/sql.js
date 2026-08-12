'use strict'

// A tagged template gets the same frozen strings array on every call from the same
// call site, so it identifies the query: the text is built once and the statement
// name is stable, and the client reuses the prepared statement per connection.
const cache = new WeakMap()
let count = 0

function sql(strings, ...values) {
  if (!strings || !Array.isArray(strings.raw)) {
    throw new TypeError('sql must be called as a tagged template literal')
  }
  let entry = cache.get(strings)
  if (!entry) {
    let text = strings[0]
    for (let i = 1; i < strings.length; i++) {
      text += '$' + i + strings[i]
    }
    entry = { name: 'pg_sql_' + ++count, text }
    cache.set(strings, entry)
  }
  return { name: entry.name, text: entry.text, values }
}

module.exports = sql
