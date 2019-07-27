require('dotenv').config()
const db = require('mssql')
const dg = require('debug')('app:DB')

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

  /**
   * 蓄積したブクマの最新タイムスタンプを得る。
   * 過去にスクレイピングしたものをまた取得する無駄をなくすため。
   * ただし、過去分でも直近２週間はスター増加とコメントの修正が
   * 想定されるため、必ずしもここで得られたタイムスタンプより
   * 過去のものは更新しない、といったことは守る必要はない。
   */
  static async selectMaxTimestampOfUserBookmark(user) {
    await db.connect(config)
    // TODO: Injection
    const sql = `select max(timestamp) as timestamp from USER_BOOKMARKS where userid = '${user}'`
    dg(sql)
    const res = await db.query(sql)
    await db.close()
    const result = res.recordset[0].timestamp
    dg(result)
    return result
  }

  static async deleteRecentForUpdate(obj) {
    const { userid, date } = obj
    await db.connect(config)
    // TODO: Injection
    const sql1 = `delete from USER_BOOKMARKS where userid = '${userid}' and date >= '${date}'`
    dg(sql1)
    await db.query(sql1).catch(e => {
      console.warn(e.toString())
    })
    const sql2 = `delete from USER_BOOKMARKS_DETAIL where userid = '${userid}' and timestamp >= '${date} 00:00:00'`
    dg(sql2)
    await db.query(sql2).catch(e => {
      console.warn(e.toString())
    })
    await db.close()
  }

  static async insertUserBookmark(obj) {
    const { userid, eid, url, date } = obj
    await db.connect(config)
    // TODO: Injection
    const sql = `insert into USER_BOOKMARKS values ('${userid}','${eid}','${url}','${date}')`
    dg(sql)
    await db.query(sql).catch(e => {
      console.warn(e.toString())
    })
    await db.close()
  }

  static async insertUserBookmarkDetail(obj) {
    const { userid, eid, timestamp, comment, tags, starlen } = obj
    await db.connect(config)
    // TODO: Injection
    const sql = `insert into USER_BOOKMARKS_DETAIL values ('${userid}','${eid}','${timestamp}','${comment}','${tags}','${starlen}')`
    dg(sql)
    await db.query(sql).catch(e => {
      console.warn(e.toString())
    })
    await db.close()
  }
}
