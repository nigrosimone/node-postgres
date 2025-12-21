'use strict'

const path = require('path')
const { Worker } = require('worker_threads')

const BENCH_THREAD_PATH = path.join(__dirname, 'bench-thread.js')

const benchmarks = [
  {
    name: 'simple query',
    query: {
      text: `select
      $1::int as int,
      $2 as string,
      $3::timestamp with time zone as timestamp,
      $4 as null,
      $5::bool as boolean
      FROM generate_series(1,5)`,
      values: [1337, 'wat', new Date().toISOString(), null, false],
      name: 'pg',
    },
  },
]

async function runBenchmark(benchmark) {
  const worker = new Worker(BENCH_THREAD_PATH, { workerData: benchmark })

  return new Promise((resolve, reject) => {
    let result = null
    worker.on('error', (err) => {
        console.error('Worker error:', err)
        reject(err)
    })
    worker.on('message', (benchResult) => {
      console.log('Worker message received')
      result = benchResult
    })
    worker.on('exit', (code) => {
        console.log('Worker exited with code', code)
      if (code === 0) {
        resolve(result)
      } else {
        reject(new Error(`Worker stopped with exit code ${code}`))
      }
    })
  })
}

async function runBenchmarks() {
  let maxNameLength = 0
  for (const benchmark of benchmarks) {
    maxNameLength = Math.max(benchmark.name.length, maxNameLength)
  }

  for (const benchmark of benchmarks) {
    benchmark.name = benchmark.name.padEnd(maxNameLength, '.')
    const resultMessage = await runBenchmark(benchmark)
    console.log(resultMessage)
  }
}

runBenchmarks()
