'use strict'
const helper = require('./test-helper')
const sql = require('./../../../lib/sql')
const assert = require('assert')
const suite = new helper.Suite()

suite.test('sql template runs a parameterized query', async function () {
  const client = new helper.Client()
  await client.connect()

  const id = 42
  const name = 'brianc'
  const result = await client.query(sql`SELECT ${id}::int AS id, ${name}::text AS name`)
  assert.equal(result.rows[0].id, 42)
  assert.equal(result.rows[0].name, 'brianc')

  await client.end()
})

suite.test('the same call site reuses one prepared statement', async function () {
  const client = new helper.Client()
  await client.connect()

  const make = (num) => sql`SELECT ${num}::int AS num`
  const statementName = make(0).name
  for (let i = 1; i <= 5; i++) {
    assert.equal((await client.query(make(i))).rows[0].num, i)
  }

  const prepared = await client.query('SELECT count(*)::int AS c FROM pg_prepared_statements WHERE name = $1', [
    statementName,
  ])
  assert.equal(prepared.rows[0].c, 1)

  await client.end()
})

suite.test('sql template works with pool.query', async function () {
  const pool = new helper.pg.Pool({ max: 2 })

  const nums = [1, 2, 3, 4, 5]
  const results = await Promise.all(nums.map((num) => pool.query(sql`SELECT ${num}::int AS num`)))
  assert.deepEqual(
    results.map((res) => res.rows[0].num),
    nums
  )

  await pool.end()
})

suite.test('sql is attached to the pool and runs the query directly', async function () {
  const pool = new helper.pg.Pool({ max: 2 })
  const { sql } = pool

  const id = 7
  const result = await sql`SELECT ${id}::int AS id`
  assert.equal(result.rows[0].id, 7)

  await pool.end()
})

suite.test('sql is attached to the client and runs the query directly', async function () {
  const client = new helper.Client()
  await client.connect()
  const { sql } = client

  const result = await sql`SELECT ${'hello'}::text AS msg`
  assert.equal(result.rows[0].msg, 'hello')

  await client.end()
})
