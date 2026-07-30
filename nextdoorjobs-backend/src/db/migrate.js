'use strict'

require('dotenv').config()

const fs = require('fs')
const path = require('path')
const db = require('./index')

async function migrate() {
  const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8')
  await db.query(sql)
  console.log('Migration complete')
  await db.pool.end()
}

migrate().catch((err) => {
  console.error(err)
  process.exit(1)
})
