const pg = require('../packages/pg/lib')
const client = new pg.Client({
  connectionTimeoutMillis: 5000,
})

console.log('Connecting with timeout 5s...');
client.connect()
  .then(() => {
    console.log('Connected!');
    return client.query('SELECT NOW()')
  })
  .then(res => {
    console.log('Query result:', res.rows[0])
    return client.end()
  })
  .catch(err => {
    console.error('Connection error:', err)
    process.exit(1)
  })
