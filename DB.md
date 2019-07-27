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


## USER_MONTHLY_TOTAL

月次集計サマリ。

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
