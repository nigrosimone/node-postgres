const Client = require('../')
const assert = require('assert')

describe('pipeline mode', function () {
  before(function (done) {
    this.client = new Client({ pipelineMode: true })
    this.client.connect(done)
  })

  after(function (done) {
    this.client.end(done)
  })

  it('simple query', function (done) {
    this.client.query("SELECT '10'::int as num", function (err, rows) {
      assert.ifError(err)
      assert.equal(rows.length, 1, 'should return one set of rows')
      assert.equal(rows[0].num, '10')
      done()
    })
  })
})
