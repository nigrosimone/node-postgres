'use strict'
const helper = require('./test-helper')
const sql = require('./../../lib/sql')
const assert = require('assert')
const suite = new helper.Suite()
const test = suite.test.bind(suite)

test('builds text and values from the template', function () {
  const query = sql`SELECT * FROM users WHERE id = ${42} AND name = ${'brianc'}`
  assert.equal(query.text, 'SELECT * FROM users WHERE id = $1 AND name = $2')
  assert.deepEqual(query.values, [42, 'brianc'])
})

test('a template without values still names the statement', function () {
  const query = sql`SELECT now()`
  assert.equal(query.text, 'SELECT now()')
  assert.deepEqual(query.values, [])
  assert.ok(query.name)
})

test('the same call site keeps the same statement name', function () {
  const run = (id) => sql`SELECT ${id}::int AS num`
  const first = run(1)
  const second = run(2)
  assert.equal(first.name, second.name)
  assert.equal(first.text, second.text)
  assert.deepEqual(second.values, [2])
})

test('different call sites get different statement names', function () {
  const first = sql`SELECT 1`
  const second = sql`SELECT 1`
  assert.notEqual(first.name, second.name)
})

test('throws when not called as a tagged template', function () {
  assert.throws(() => sql('SELECT 1'), TypeError)
})
