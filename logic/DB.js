require('dotenv').config()
const db = require('mssql')
const dg = require('debug')('app:DB')

const config = {
  user: process.env.MSSQL_USER,
  password: process.env.MSSQL_PASSWORD,
  server: process.env.MSSQL_SERVER,
  database: process.env.MSSQL_DATABASE,
  options: {
    encrypt: true, // Use this if you're on Windows Azure
  },
}

module.exports = class DB {
  static async openConnection() {
    await db.connect(config)
  }

  static async closeConnection() {
    await db.close()
  }

  static async delinsUserProfile(obj) {
    await DB.deleteUserProfile(obj)
    await DB.insertUserProfile(obj)
  }

  static async deleteUserProfile(obj) {
    const { userid } = obj
    await db.connect(config)
    const req = new db.Request()
    req.input('userid', db.VarChar, userid)
    const sql = `delete from USER_PROFILE where userid = @userid`
    await req.query(sql).catch((e) => {
      dg(sql)
      console.warn(e.toString())
    })
    await db.close()
  }

  static async insertUserProfile(obj) {
    const {
      userid,
      name,
      birthday,
      totalBookmarks,
      totalFollowers,
      totalFollowings,
      totalStarYellow,
      totalStarGreen,
      totalStarRed,
      totalStarBlue,
      totalStarPurple,
      timestamp,
    } = obj
    await db.connect(config)
    const req = new db.Request()
    req.input('userid', db.VarChar, userid)
    req.input('name', db.NVarChar, name)
    req.input('birthday', db.VarChar, birthday)
    req.input('cp', db.Int, null)
    req.input('totalBookmarks', db.Int, totalBookmarks)
    req.input('totalFollowers', db.Int, totalFollowers)
    req.input('totalFollowings', db.Int, totalFollowings)
    req.input('totalStarYellow', db.Int, totalStarYellow)
    req.input('totalStarGreen', db.Int, totalStarGreen)
    req.input('totalStarRed', db.Int, totalStarRed)
    req.input('totalStarBlue', db.Int, totalStarBlue)
    req.input('totalStarPurple', db.Int, totalStarPurple)
    req.input('timestamp', db.SmallDateTime, timestamp)
    const sql = `insert into USER_PROFILE values (@userid, @name, @totalBookmarks, @totalFollowers, @totalFollowings, @totalStarYellow, @totalStarGreen, @totalStarRed, @totalStarBlue, @totalStarPurple, @timestamp, @birthday, @cp)`
    await req.query(sql).catch((e) => {
      dg(sql)
      dg(req.parameters)
      console.warn(e.toString())
    })
    await db.close()
  }

  static async selectRanking() {
    dg('[#selectRanking]')
    await db.connect(config)
    const req = new db.Request()
    const sql = `
select TOP 500 * from USER_RANKING_VIEW
where total_bookmarks is not null
order by cp desc, convert(int, ANNUAL_STARREDSUM) desc
`
    const res = await req.query(sql).catch((e) => {
      dg(sql)
      console.warn(e.toString())
    })
    await db.close()
    return res.recordset
  }

  static async selectTargetsForUpdate() {
    dg('[#selectTargetsForUpdate]')
    await db.connect(config)
    const req = new db.Request()
    const sql = `select userid from USER_PROFILE where last_update < dateadd(hour, -12, getdate()) order by last_update`
    const res = await req.query(sql).catch((e) => {
      dg(sql)
      console.warn(e.toString())
    })
    await db.close()
    return res.recordset
  }

  static async selectAllTargets() {
    dg('[#selectAllTargets]')
    await db.connect(config)
    const req = new db.Request()
    const sql = `select userid from USER_PROFILE order by userid`
    const res = await req.query(sql).catch((e) => {
      dg(sql)
      console.warn(e.toString())
    })
    await db.close()
    return res.recordset
  }

  static async updateUserProfileCP() {
    dg('[#updateUserProfileCP]')
    await db.connect(config)
    const req = new db.Request()
    const sql = `
update USER_PROFILE
set cp = floor(
  (
    (
      convert(int, BOOKMARK_SUM) * 0.5
      * (isNull(convert(int, STARRED_RATE), 0) + 10) / 100
      +
      convert(int, COMMENTED_LEN) * 0.7
      * (isNull(convert(int, STARRED_RATE), 0) + 10) / 100
      * (isNull(convert(int, STARRED_RATE), 0) + 10) / 100
    )
    +
    convert(int, STARRED_SUM) / 3
    +
    (
      convert(int, STARRED_SUM)
      /
      (convert(int, COMMENTED_LEN) + 100)
      *
      convert(int, BUCOME_RATE) / 100
      *
      50
    )
    +
    isNull(convert(int, ANOND_LEN), 0) * 0.2
    +
    (
      isNull(total_star_green, 0) * 0.8 * 0.75
      +
      isNull(total_star_red, 0) * 4.0 * 0.75
      +
      isNull(total_star_blue, 0) * 20.0 * 0.75
      +
      isNull(total_star_purple, 0) * 100.0 * 0.75
    )
    +
    (
      isNull(convert(int, total_followers), 0)
      *
      isNull(convert(int, STARRED_RATE), 0)
      /
      100 * 0.87
    )
  )
  * (isNull(convert(int, STARRED_RATE), 0) + 10) / 100
  * 0.15
)
from USER_PROFILE
inner join USER_ANNUAL_SUMMARY_VIEW
on USER_ANNUAL_SUMMARY_VIEW.userid = USER_PROFILE.userid
`
    await req.query(sql).catch((e) => {
      dg(sql)
      console.warn(e.toString())
    })
    await db.close()
  }

  static async selectUserProfile(userid) {
    dg('[#selectUserProfile]')
    await db.connect(config)
    const req = new db.Request()
    req.input('userid', db.VarChar, userid)
    const sql = `select * from USER_PROFILE where userid = @userid`
    const res = await req.query(sql).catch((e) => {
      dg(sql)
      console.warn(e.toString())
    })
    await db.close()
    return res.recordset[0] || {}
  }

  static async selectAnnualEidsByUser(userid) {
    dg('[#selectAnnualEidsByUser]')
    await db.connect(config)
    const req = new db.Request()
    req.input('userid', db.VarChar, userid)
    let sql = ''
    sql += ` select eid from USER_BOOKMARKS`
    sql += `  where userid = @userid`
    sql += `    and timestamp >= convert(smalldatetime, convert(nvarchar, dateadd(year, -1, getdate()), 111), 111)`
    sql += `    and timestamp <  convert(smalldatetime, convert(nvarchar, getdate(), 111), 111)`
    const res = await req.query(sql).catch((e) => {
      dg(sql)
      console.warn(e.toString())
    })
    await db.close()
    return res.recordset.map((x) => x.eid)
  }

  static async selectAllAnnualSummaly() {
    dg('[#selectAllAnnualSummaly]')
    await db.connect(config)
    const sql = `select * from USER_ANNUAL_SUMMALY order by userid, attr_key`
    dg(sql)
    const res = await db.query(sql)
    await db.close()
    const result = res.recordset
    // //////////////////
    const dataSet = {}
    result.forEach((r) => {
      if (!dataSet[r.userid]) dataSet[r.userid] = {}
      const val = /^\d+$/.test(r.attr_val) ? Number(r.attr_val) : r.attr_val
      dataSet[r.userid][r.attr_key] = val
    })
    return dataSet
  }

  static async selectAnnualBookmarksByUser(user) {
    dg(`[#selectAnnualBookmarksByUser] ${user}`)
    await db.connect(config)
    const req = new db.Request()
    req.input('userid', db.VarChar, user)
    let sql = ''
    sql += ` select date, count(date) as count from (`
    sql += `   select CONVERT(VARCHAR(10), timestamp, 111) as date from USER_BOOKMARKS`
    sql += `   where userid = @userid`
    sql += `     and timestamp >= convert(smalldatetime, convert(nvarchar, dateadd(year, -1, getdate()), 111), 111)`
    sql += `     and timestamp <  convert(smalldatetime, convert(nvarchar, getdate(), 111), 111)`
    sql += ` ) sub`
    sql += ` group by date`
    sql += ` order by date desc`
    const res = await req.query(sql).catch((e) => {
      dg(sql)
      console.warn(e.toString())
    })
    await db.close()
    return res.recordset
  }

  static async selectAnnualCommentsByUser(user) {
    dg(`[#selectAnnualCommentsByUser] ${user}`)
    await db.connect(config)
    const req = new db.Request()
    req.input('userid', db.VarChar, user)
    let sql = ''
    sql += ` select hb.title, ub.url, ub.timestamp, ub.comment, ub.starlen as stars, hb.users`
    sql += ` from USER_BOOKMARKS ub left outer join HATENA_BOOKMARKS hb on(hb.eid = ub.eid)`
    sql += ` where userid = @userid`
    sql += ` and comment <> ''`
    sql += ` and starlen > 0`
    sql += ` and timestamp >= convert(smalldatetime, convert(nvarchar, dateadd(year, -1, getdate()), 111), 111)`
    sql += ` and timestamp <  convert(smalldatetime, convert(nvarchar, getdate(), 111), 111)`
    sql += ` order by timestamp desc`
    const res = await req.query(sql).catch((e) => {
      dg(sql)
      console.warn(e.toString())
    })
    await db.close()
    const result = res.recordset
    return result
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

  static async delinsHatenaBookmark(obj) {
    await DB.deleteHatenaBookmark(obj)
    await DB.insertHatenaBookmark(obj)
  }

  static async deleteHatenaBookmark(obj) {
    const { eid } = obj
    // await db.connect(config)
    // TODO: Injection
    const sql = `delete from HATENA_BOOKMARKS where eid = '${eid}'`
    await db.query(sql).catch((e) => {
      dg(sql)
      console.warn(e.toString())
    })
    // await db.close()
  }

  static async insertHatenaBookmark(obj) {
    const { eid, url, title, eurl, users } = obj
    // await db.connect(config)
    const req = new db.Request()
    req.input('eid', db.VarChar, eid)
    req.input('eurl', db.VarChar, eurl)
    req.input('title', db.NVarChar, title)
    req.input('url', db.VarChar, url)
    req.input('users', db.VarChar, users)
    const sql = `insert into HATENA_BOOKMARKS values (@eid, @eurl, @title, @url, @users)`
    await req.query(sql).catch((e) => {
      // dg(sql)
      console.warn(e.toString())
    })
    // await db.close()
  }

  static async delinsUserBookmark(obj) {
    if (!obj.userid) return
    await DB.deleteUserBookmark(obj)
    await DB.insertUserBookmark(obj)
  }

  static async deleteUserBookmark(obj) {
    const { userid, eid } = obj
    // await db.connect(config)
    // TODO: Injection
    const sql = `delete from USER_BOOKMARKS where userid = '${userid}' and eid = '${eid}'`
    await db.query(sql).catch((e) => {
      dg(sql)
      console.warn(e.toString())
    })
    // await db.close()
  }

  static async insertUserBookmark(obj) {
    const { userid, eid, url, timestamp, comment, tags, starlen } = obj
    // await db.connect(config)
    const req = new db.Request()
    req.input('userid', db.VarChar, userid)
    req.input('eid', db.VarChar, eid)
    req.input('url', db.VarChar, url)
    req.input('timestamp', db.VarChar, timestamp)
    req.input('comment', db.NVarChar, comment)
    req.input('tags', db.NVarChar, tags)
    req.input('starlen', db.VarChar, starlen)
    const sql = `insert into USER_BOOKMARKS values (@userid, @eid, @url, @timestamp, @comment, @tags, @starlen)`
    await req.query(sql).catch((e) => {
      dg(sql)
      dg(req.parameters)
      console.warn(e.toString())
    })
    // await db.close()
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
    await db.query(delSql).catch((e) => {
      dg(delSql)
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
    sql += `     where timestamp >= convert(smalldatetime, convert(nvarchar, dateadd(year, -1, getdate()), 111), 111)`
    sql += `       and timestamp <  convert(smalldatetime, convert(nvarchar, getdate(), 111), 111)`
    sql += ` ) sub`
    sql += ` group by userid, yyyymm`
    await db.query(sql).catch((e) => {
      dg(sql)
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
    await db.query(delSql).catch((e) => {
      console.warn(e.toString())
    })

    dg('insert into USER_ANNUAL_SUMMALY ...')
    let sql = ''
    sql += ` insert into USER_ANNUAL_SUMMALY`
    sql += ` select userid`
    sql += `     , 'BOOKMARK_SUM' as attr_key`
    sql += `     , count(*) as attr_val`
    sql += ` from USER_BOOKMARKS`
    sql += ` where timestamp >= convert(smalldatetime, convert(nvarchar, dateadd(year, -1, getdate()), 111), 111)`
    sql += `   and timestamp <  convert(smalldatetime, convert(nvarchar, getdate(), 111), 111)`
    sql += ` group by userid`
    await db.query(sql).catch((e) => {
      dg(sql)
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
    await db.query(delSql).catch((e) => {
      dg(delSql)
      console.warn(e.toString())
    })

    dg('insert into USER_ANNUAL_SUMMALY ...')
    let sql = ''
    sql += ` insert into USER_ANNUAL_SUMMALY`
    sql += ` select userid`
    sql += `      , 'COMMENTED_LEN' as attr_key`
    sql += `      , count(*) as attr_val`
    sql += `   from USER_BOOKMARKS`
    sql += `  where timestamp >= convert(smalldatetime, convert(nvarchar, dateadd(year, -1, getdate()), 111), 111)`
    sql += `    and timestamp <  convert(smalldatetime, convert(nvarchar, getdate(), 111), 111)`
    sql += `    and len(comment) > 0`
    sql += `  group by userid`
    await db.query(sql).catch((e) => {
      dg(sql)
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
    await db.query(delSql).catch((e) => {
      dg(delSql)
      console.warn(e.toString())
    })

    dg('insert into USER_ANNUAL_SUMMALY ...')
    let sql = ''
    sql += ` insert into USER_ANNUAL_SUMMALY`
    sql += ` select userid`
    sql += `      , 'STARRED_LEN' as attr_key`
    sql += `      , count(*) as attr_val`
    sql += `   from USER_BOOKMARKS`
    sql += `  where timestamp >= convert(smalldatetime, convert(nvarchar, dateadd(year, -1, getdate()), 111), 111)`
    sql += `    and timestamp <  convert(smalldatetime, convert(nvarchar, getdate(), 111), 111)`
    sql += `    and len(comment) > 0`
    sql += `    and starlen > 0`
    sql += `  group by userid`
    await db.query(sql).catch((e) => {
      dg(sql)
      console.warn(e.toString())
    })
    await db.close()
  }

  static async delinsAnnualSummalyStarredSum() {
    dg('<Update STARRED_SUM>')
    await db.connect(config)
    // TODO: Injection
    dg('delete from USER_ANNUAL_SUMMALY ...')
    let delSql = ''
    delSql += ` delete from USER_ANNUAL_SUMMALY`
    delSql += `  where attr_key = 'STARRED_SUM'`
    await db.query(delSql).catch((e) => {
      dg(delSql)
      console.warn(e.toString())
    })

    dg('insert into USER_ANNUAL_SUMMALY ...')
    let sql = ''
    sql += ` insert into USER_ANNUAL_SUMMALY`
    sql += ` select userid`
    sql += `      , 'STARRED_SUM' as attr_key`
    sql += `      , sum(starlen) as attr_val`
    sql += `   from USER_BOOKMARKS`
    sql += `  where timestamp >= convert(smalldatetime, convert(nvarchar, dateadd(year, -1, getdate()), 111), 111)`
    sql += `    and timestamp <  convert(smalldatetime, convert(nvarchar, getdate(), 111), 111)`
    sql += `  group by userid`
    await db.query(sql).catch((e) => {
      dg(sql)
      console.warn(e.toString())
    })
    await db.close()
  }

  static async delinsAnnualSummalyAnondLen() {
    dg('<Update ANOND_LEN>')
    await db.connect(config)
    // TODO: Injection
    dg('delete from USER_ANNUAL_SUMMALY ...')
    let delSql = ''
    delSql += ` delete from USER_ANNUAL_SUMMALY`
    delSql += `  where attr_key = 'ANOND_LEN'`
    await db.query(delSql).catch((e) => {
      dg(delSql)
      console.warn(e.toString())
    })

    dg('insert into USER_ANNUAL_SUMMALY ...')
    let sql = ''
    sql += ` insert into USER_ANNUAL_SUMMALY`
    sql += ` select userid`
    sql += `      , 'ANOND_LEN' as attr_key`
    sql += `      , count(*) as attr_val`
    sql += `   from USER_BOOKMARKS`
    sql += `  where timestamp >= convert(smalldatetime, convert(nvarchar, dateadd(year, -1, getdate()), 111), 111)`
    sql += `    and timestamp <  convert(smalldatetime, convert(nvarchar, getdate(), 111), 111)`
    sql += `    and url like '%://anond%'`
    sql += `  group by userid`
    await db.query(sql).catch((e) => {
      dg(sql)
      console.warn(e.toString())
    })
    await db.close()
  }

  static async deleteUser(userid) {
    await db.connect(config)
    const req = new db.Request()
    req.input('userid', db.VarChar, userid)
    const sql = `
delete from USER_PROFILE where userid = @userid;
delete from USER_ANNUAL_SUMMALY where userid = @userid;
delete from USER_BOOKMARKS where userid = @userid;
delete from USER_MONTHLY_TOTAL where userid = @userid;
`
    await req.query(sql).catch((e) => {
      dg(sql)
      dg(req.parameters)
      console.warn(e.toString())
    })
    await db.close()
  }

  static async insertDailyHotentry(arg) {
    // dg('<Insert DAILY_HOTENTRY>')
    await db.connect(config)
    const { date, category, ranking, eid, title, url, popDate } = arg
    const req = new db.Request()
    req.input('date', db.VarChar, date)
    req.input('category', db.VarChar, category)
    req.input('ranking', db.Int, ranking)
    req.input('eid', db.VarChar, eid)
    req.input('title', db.NVarChar, title)
    req.input('url', db.VarChar, url)
    req.input('popDate', db.VarChar, popDate)
    let sql = ''
    sql += ` insert into DAILY_HOTENTRY`
    sql += ` values (@date, @category, @ranking, @eid, @title, @url, @popDate)`
    await req.query(sql).catch((e) => {
      console.warn(e.toString())
      dg(sql)
      dg(req.parameters)
    })
    await DB.deleteHatenaBookmark(arg)
    await DB.insertHatenaBookmark(arg)
    await db.close()
  }

  static async selectHatenaBookmarksEids() {
    await db.connect(config)
    const req = new db.Request()
    let sql = ''
    sql += ` select TOP (100000) eid, url from HATENA_BOOKMARKS a`
    sql += ` where not exists (select 1 from HATENA_ENTRY_EXTD b where a.eid = b.eid)`
    const res = await req.query(sql).catch((e) => {
      console.warn(e.toString())
      dg(sql)
      dg(req.parameters)
    })
    await db.close()
    return res.recordset
  }

  static async insertHatenaEntryExtd(arg) {
    const req = new db.Request()
    const { eid, domain } = arg
    req.input('eid', db.VarChar, eid)
    req.input('domain', db.VarChar, domain)
    let sql = ''
    sql += ` insert into HATENA_ENTRY_EXTD`
    sql += ` values (@eid, @domain)`
    await req.query(sql).catch((e) => {
      console.warn(e.toString())
      dg(sql)
      dg(req.parameters)
    })
  }
}
