'use strict'

const { workerData: benchmark, parentPort } = require('worker_threads')
const { Bench } = require('tinybench')
const pg = require('../packages/pg/lib')

try {
  const bench = new Bench({
    name: benchmark.name,
    time: 100,
    setup: (_task, mode) => {
      // Run the garbage collector before warmup at each cycle
      if (mode === 'warmup' && typeof global.gc === 'function') {
        global.gc()
      }
    },
  })

  const pool = new pg.Pool()

  bench
    .add(benchmark.name, async() => {
      await pool.query(benchmark.query)
    })
    .run()
    .then(() => {
      const task = bench.tasks[0]
      // use throughput mean as Hz if not available on result
      const hz = task.result.hz || task.result.throughput.mean
      // use throughput rme
      const rme = task.result.rme || task.result.throughput.rme
      // use latency samplesCount
      const samples = task.result.latency.samplesCount

      const formattedHz = hz.toLocaleString('en-US', { maximumFractionDigits: 0 })
      const formattedRme = rme.toFixed(2)

      const output = `${task.name} x ${formattedHz} req/sec ±${formattedRme}% (${samples} runs sampled)`
      parentPort.postMessage(output)
      return pool.end()
    })
    .catch((err) => {
      parentPort.postMessage(`Error: ${err.message}`)
      return pool.end()
    })

} catch (error) {
  parentPort.postMessage(`Error: ${error.message}`)
}
  