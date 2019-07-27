require('dotenv').config()
const sql = require('mssql')

const config = {
  user: process.env.MSSQL_USER,
  password: process.env.MSSQL_PASSWORD,
  server: process.env.MSSQL_SERVER,
  database: process.env.MSSQL_DATABASE,
  options: {
    encrypt: true // Use this if you're on Windows Azure
  }
}

module.exports = class DB {
  static async insertUserBookmark(obj) {
    const { userid, eid, timestamp, comment, tags, starlen } = obj
    await sql.connect(config)
    // TODO: Injection
    const result = await sql.query`insert into USER_BOOKMARKS values (${userid},${eid},${timestamp},${comment},${tags},${starlen})`
    console.dir(result)
    await sql.close()
  }
}
