const sql = require('mssql')

const config = {
  user: process.env.MSSQL_USER,
  password: process.env.MSSQL_PASSWORD,
  server: process.env.MSSQL_SERVER,
  database: process.env.MSSQL_DATABASE,
  options: {
    // encrypt: true // Use this if you're on Windows Azure
  }
}

;(async () => {
  await sql.connect(config)
  const result = await sql.query`select * from HATENA_BOOKMARKS`
  console.dir(result)
  await sql.close()
})().catch(e => {
  console.warn(e)
})
