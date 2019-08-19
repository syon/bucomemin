# DB

Azure SQL Database


## HATENA_BOOKMARKS

|name |type    |length|
|-----|--------|-----:|
|eid  |varchar |    20|
|eurl |varchar |  2000|
|title|nvarchar|   200|
|url  |varchar |  2000|
|users|smallint|     -|

```sql
create table HATENA_BOOKMARKS (
  eid varchar(20),
  eurl varchar(2000),
  title nvarchar(200),
  url varchar(2000),
  users smallint,
  PRIMARY KEY (eid)
)
```


## USER_PROFILE

b.hatena.ne.jp/userid/ ページに記載のプロフィールのスクレイピングデータ。

|name             |type         |             length|
|-----------------|-------------|------------------:|
|userid           |varchar      |                 20|
|name             |nvarchar     |                100|
|total_bookmarks  |int          |                  -|
|total_followers  |int          |                  -|
|total_followings |int          |                  -|
|total_star_yellow|int          |                  -|
|total_star_green |int          |                  -|
|total_star_red   |int          |                  -|
|total_star_blue  |int          |                  -|
|total_star_purple|int          |                  -|
|timestamp        |smalldatetime|YYYY-MM-DD hh:mm:ss|

```sql
create table USER_PROFILE (
  userid varchar(20),
  name nvarchar(100),
  total_bookmarks int,
  total_followers int,
  total_followings int,
  total_star_yellow int,
  total_star_green int,
  total_star_red int,
  total_star_blue int,
  total_star_purple int,
  last_update smalldatetime,
  birthday date,
  cp int,
  PRIMARY KEY (userid)
)
```


## USER_BOOKMARKS

b.hatena.ne.jp からスクレイピングしたデータ。
そのユーザーが何をブックマークしてどんなコメントを投稿し、どれだけ★を得たかを記録する。

- 継続更新対象: ブックマークしてから５日以内

|name     |type         |             length|
|---------|-------------|------------------:|
|userid   |varchar      |                 20|
|eid      |varchar      |                 20|
|url      |varchar      |               2000|
|timestamp|smalldatetime|YYYY-MM-DD hh:mm:ss|
|comment  |nvarchar     |                200|
|tags     |nvarchar     |                200|
|starlen  |smallint     |                  -|

```sql
create table USER_BOOKMARKS (
  userid varchar(20),
  eid varchar(20),
  url varchar(2000),
  timestamp smalldatetime,
  comment nvarchar(200),
  tags nvarchar(200),
  starlen smallint,
  PRIMARY KEY (userid, eid)
)
```


## USER_ANNUAL_SUMMALY

（先月までの）年間サマリ。最新のみ保管。

|name      |type     |  length|
|----------|---------|-------:|
|userid    |varchar  |      20|
|attr_key  |varchar  |      20|
|attr_val  |varchar  |      20|

```sql
create table USER_ANNUAL_SUMMALY (
  userid varchar(20),
  attr_key varchar(20),
  attr_val varchar(20),
  PRIMARY KEY (userid, attr_key)
)
```


## USER_MONTHLY_TOTAL

月次集計結果。

|name      |type     |  length|
|----------|---------|-------:|
|userid    |varchar  |      20|
|yyyymm    |varchar  |      10|
|attr_key  |varchar  |      20|
|attr_val  |varchar  |      20|

```sql
create table USER_MONTHLY_TOTAL (
  userid varchar(20),
  yyyymm varchar(10),
  attr_key varchar(20),
  attr_val varchar(20),
  PRIMARY KEY (userid, yyyymm, attr_key)
)
```


## USER_ANNUAL_SUMMARY_VIEW

```sql
create view USER_ANNUAL_SUMMARY_VIEW
as
select
  up.userid,
  as1.attr_val as BOOKMARK_SUM,
  as2.attr_val as COMMENTED_LEN,
  as3.attr_val as STARRED_LEN,
  as4.attr_val as ANOND_LEN,
  floor(convert(float, as2.attr_val) / convert(float, as1.attr_val) * 100) as BUCOME_RATE,
  floor(convert(float, as3.attr_val) / convert(float, as2.attr_val) * 100) as STARRED_RATE,
  floor(convert(float, as4.attr_val) / convert(float, as1.attr_val) * 100) as ANOND_RATE
from USER_PROFILE up
  left outer join USER_ANNUAL_SUMMALY as1
    on (as1.userid = up.userid and as1.attr_key = 'BOOKMARK_SUM')
  left outer join USER_ANNUAL_SUMMALY as2
    on (as2.userid = up.userid and as2.attr_key = 'COMMENTED_LEN')
  left outer join USER_ANNUAL_SUMMALY as3
    on (as3.userid = up.userid and as3.attr_key = 'STARRED_LEN')
  left outer join USER_ANNUAL_SUMMALY as4
    on (as4.userid = up.userid and as4.attr_key = 'ANOND_LEN')
```


## USER_RANKING_VIEW

```sql
create view USER_RANKING_VIEW
as
select
  up.userid,
  up.name,
  up.cp,
  up.birthday,
  up.total_bookmarks,
  up.total_followers,
  up.total_followings,
  up.total_star_yellow,
  up.total_star_green,
  up.total_star_red,
  up.total_star_blue,
  up.total_star_purple,
  up.last_update,
  convert(int, v.BOOKMARK_SUM) as ANNUAL_BOOKMARKS,
  convert(int, v.COMMENTED_LEN) as ANNUAL_COMMENTS,
  convert(int, v.STARRED_LEN) as ANNUAL_STARRED,
  convert(int, v.ANOND_LEN) as ANNUAL_ANONDS,
  v.BUCOME_RATE as ANNUAL_BUCOME_RATE,
  v.STARRED_RATE as ANNUAL_STARRED_RATE,
  v.ANOND_RATE as ANNUAL_ANOND_RATE
from USER_PROFILE up
  left outer join USER_ANNUAL_SUMMARY_VIEW v
    on (v.userid = up.userid)
```


## CP Calcurate

```sql
update USER_PROFILE
set cp = floor(
  (
    convert(int, BOOKMARK_SUM) * 0.5
     + convert(int, COMMENTED_LEN) * 0.7
     + convert(int, STARRED_LEN)
     + convert(int, ANOND_LEN)
     + total_followers
     + isnull(total_star_green, 0) * 2
     + isnull(total_star_red, 0) * 3
     + isnull(total_star_blue, 0) * 5
     + isnull(total_star_purple, 0) * 8
  )
  * STARRED_RATE * STARRED_RATE / 10000
)
from USER_PROFILE
inner join USER_ANNUAL_SUMMARY_VIEW
on USER_ANNUAL_SUMMARY_VIEW.userid = USER_PROFILE.userid
```
