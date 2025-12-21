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

  const client = new pg.Client()
  client
    .connect()
    .then(() => {
      console.log('Thread: Connected to Postgres')
      bench
        .add(benchmark.name, () => client.query(benchmark.query))
        .run()
        .then(() => {
          const task = bench.tasks[0]
          const hz = task.result.hz // ops/sec
          const rme = task.result.rme // relative margin of error (%)
          const samples = task.result.samples.length

          const formattedHz = hz.toLocaleString('en-US', { maximumFractionDigits: 0 })
          const formattedRme = rme.toFixed(2)

          const output = `${task.name} x ${formattedHz} ops/sec ±${formattedRme}% (${samples} runs sampled)`
          parentPort.postMessage(output)
        })
        .catch((err) => parentPort.postMessage(`Error: ${err.message}`))
    })
    .catch((err) => parentPort.postMessage(`Error: ${err.message}`))
} catch (error) {
  parentPort.postMessage(`Error: ${error.message}`)
}
  