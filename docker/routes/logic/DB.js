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

  static async selectAllAnnualSummaly() {
    await db.connect(config)
    const sql = `select * from USER_ANNUAL_SUMMALY order by userid, attr_key`
    dg(sql)
    const res = await db.query(sql)
    await db.close()
    const result = res.recordset
    ////////////////////
    const dataSet = {}
    result.forEach(r => {
      //
      if (!dataSet[r.userid]) dataSet[r.userid] = {}
      const { userid } = r
      const val = /^\d+$/.test(r.attr_val) ? Number(r.attr_val) : r.attr_val
      dataSet[r.userid][r.attr_key] = val
    })
    // これを返した先で Firebase に事前計算結果を格納すればよい
  }

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

  static async delinsUserBookmark(obj) {
    await DB.deleteUserBookmark(obj)
    await DB.insertUserBookmark(obj)
  }

  static async deleteUserBookmark(obj) {
    const { userid, eid } = obj
    await db.connect(config)
    // TODO: Injection
    const sql = `delete from USER_BOOKMARKS where userid = '${userid}' and eid = '${eid}'`
    dg(sql)
    await db.query(sql).catch(e => {
      console.warn(e.toString())
    })
    await db.close()
  }

  static async insertUserBookmark(obj) {
    const { userid, eid, url, timestamp, comment, tags, starlen } = obj
    await db.connect(config)
    // TODO: Injection
    const sql = `insert into USER_BOOKMARKS values ('${userid}','${eid}','${url}','${timestamp}','${comment}','${tags}','${starlen}')`
    dg(sql)
    await db.query(sql).catch(e => {
      console.warn(e.toString())
    })
    await db.close()
  }

  static async delinsMonthlyTotalStarlenSum() {
    dg('<Update STARLEN_SUM>')
    await db.connect(config)
    // TODO: Injection
    dg('delete from USER_MONTHLY_TOTAL ...')
    let delSql = ''
    delSql += ` delete from USER_MONTHLY_TOTAL`
    delSql += `  where attr_key = 'STARLEN_SUM'`
    delSql += `    and yyyymm >= substring(convert(NVARCHAR, dateadd(year, -1, getdate()), 112), 1, 6)`
    delSql += `    and yyyymm <= substring(convert(NVARCHAR, dateadd(day,   1, getdate()), 112), 1, 6)`
    await db.query(delSql).catch(e => {
      console.warn(e.toString())
    })

    dg('insert into USER_MONTHLY_TOTAL ...')
    let sql = ''
    sql += ` insert into USER_MONTHLY_TOTAL`
    sql += ` select userid, yyyymm, 'STARLEN_SUM' as attr_key, sum(starlen) as attr_val from (`
    sql += `     select userid`
    sql += `         , substring(convert(NVARCHAR, timestamp, 112), 1, 6) as yyyymm`
    sql += `         , starlen`
    sql += `     from USER_BOOKMARKS`
    sql += `     where timestamp >= dateadd(year, -1, getdate())`
    sql += `       and timestamp <  dateadd(day,   1, getdate())`
    sql += ` ) sub`
    sql += ` group by userid, yyyymm`
    await db.query(sql).catch(e => {
      console.warn(e.toString())
    })
    await db.close()
  }

  static async delinsAnnualSummalyBookmarkSum() {
    dg('<Update BOOKMARK_SUM>')
    await db.connect(config)
    // TODO: Injection
    dg('delete from USER_ANNUAL_SUMMALY ...')
    let delSql = ''
    delSql += ` delete from USER_ANNUAL_SUMMALY`
    delSql += `  where attr_key = 'BOOKMARK_SUM'`
    await db.query(delSql).catch(e => {
      console.warn(e.toString())
    })

    dg('insert into USER_ANNUAL_SUMMALY ...')
    let sql = ''
    sql += ` insert into USER_ANNUAL_SUMMALY`
    sql += ` select userid`
    sql += `     , 'BOOKMARK_SUM' as attr_key`
    sql += `     , count(*) as attr_val`
    sql += ` from USER_BOOKMARKS`
    sql += ` where timestamp >= dateadd(year, -1, getdate())`
    sql += ` and timestamp < dateadd(day, 1, getdate())`
    sql += ` group by userid`
    await db.query(sql).catch(e => {
      console.warn(e.toString())
    })
    await db.close()
  }

  static async delinsAnnualSummalyCommentedLen() {
    dg('<Update COMMENTED_LEN>')
    await db.connect(config)
    // TODO: Injection
    dg('delete from USER_ANNUAL_SUMMALY ...')
    let delSql = ''
    delSql += ` delete from USER_ANNUAL_SUMMALY`
    delSql += `  where attr_key = 'COMMENTED_LEN'`
    await db.query(delSql).catch(e => {
      console.warn(e.toString())
    })

    dg('insert into USER_ANNUAL_SUMMALY ...')
    let sql = ''
    sql += ` insert into USER_ANNUAL_SUMMALY`
    sql += ` select userid`
    sql += `     , 'COMMENTED_LEN' as attr_key`
    sql += `     , count(*) as attr_val`
    sql += ` from USER_BOOKMARKS`
    sql += ` where timestamp >= dateadd(year, -1, getdate())`
    sql += ` and timestamp < dateadd(day, 1, getdate())`
    sql += ` and len(comment) > 0`
    sql += ` group by userid`
    await db.query(sql).catch(e => {
      console.warn(e.toString())
    })
    await db.close()
  }

  static async delinsAnnualSummalyStarredLen() {
    dg('<Update STARRED_LEN>')
    await db.connect(config)
    // TODO: Injection
    dg('delete from USER_ANNUAL_SUMMALY ...')
    let delSql = ''
    delSql += ` delete from USER_ANNUAL_SUMMALY`
    delSql += `  where attr_key = 'STARRED_LEN'`
    await db.query(delSql).catch(e => {
      console.warn(e.toString())
    })

    dg('insert into USER_ANNUAL_SUMMALY ...')
    let sql = ''
    sql += ` insert into USER_ANNUAL_SUMMALY`
    sql += ` select userid`
    sql += `     , 'STARRED_LEN' as attr_key`
    sql += `     , count(*) as attr_val`
    sql += ` from USER_BOOKMARKS`
    sql += ` where timestamp >= dateadd(year, -1, getdate())`
    sql += ` and timestamp < dateadd(day, 1, getdate())`
    sql += ` and len(comment) > 0`
    sql += ` and starlen > 0`
    sql += ` group by userid`
    await db.query(sql).catch(e => {
      console.warn(e.toString())
    })
    await db.close()
  }

  static async delinsAnnualSummalyStarredLen() {
    dg('<Update ANOND_LEN>')
    await db.connect(config)
    // TODO: Injection
    dg('delete from USER_ANNUAL_SUMMALY ...')
    let delSql = ''
    delSql += ` delete from USER_ANNUAL_SUMMALY`
    delSql += `  where attr_key = 'ANOND_LEN'`
    await db.query(delSql).catch(e => {
      console.warn(e.toString())
    })

    dg('insert into USER_ANNUAL_SUMMALY ...')
    let sql = ''
    sql += ` insert into USER_ANNUAL_SUMMALY`
    sql += ` select userid`
    sql += `     , 'ANOND_LEN' as attr_key`
    sql += `     , count(*) as attr_val`
    sql += ` from USER_BOOKMARKS`
    sql += ` where timestamp >= dateadd(year, -1, getdate())`
    sql += ` and timestamp < dateadd(day, 1, getdate())`
    sql += ` and url like '%://anond%'`
    sql += ` group by userid`
    await db.query(sql).catch(e => {
      console.warn(e.toString())
    })
    await db.close()
  }
}
