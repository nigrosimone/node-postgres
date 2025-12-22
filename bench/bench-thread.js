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

  const { native, Pool } = pg
  const { Pool: NativePool } = native
  const pool = new Pool()
  const nativePool = new NativePool()

  Promise.all([pool.query('SELECT 1'), nativePool.query('SELECT 1')])
    .then(() => {
      bench
        .add(benchmark.name, async () => {
          if (benchmark.native) {
            return nativePool.query(benchmark.query)
          }
          return pool.query(benchmark.query)
        })
        .run()
        .then(() => {
          const task = bench.tasks[0]
          // use throughput mean as Hz if not available on result
          const hz = task.result.hz || task.result.throughput.mean
          // use throughput rme
          const rme = task.result.rme || task.result.throughput?.rme
          // use latency samplesCount
          const samples = task.result.latency.samplesCount

          const formattedHz = hz.toLocaleString('en-US', { maximumFractionDigits: 0 })
          const formattedRme = rme.toFixed(2)

          const output = `${task.name} x ${formattedHz} req/sec ±${formattedRme}% (${samples} runs sampled)`
          parentPort.postMessage(output)

          return Promise.all([pool.end(), nativePool.end()])
        })
        .catch((err) => {
          console.log(err)
          parentPort.postMessage(`Error: ${err.message}`)
          return Promise.all([pool.end(), nativePool.end()])
        })
    })
    .catch((err) => {
      console.log(err)
      parentPort.postMessage(`Error: ${err.message}`)
      return Promise.all([pool.end(), nativePool.end()])
    })
} catch (error) {
  console.log(error)
  parentPort.postMessage(`Error: ${error.message}`)
}
