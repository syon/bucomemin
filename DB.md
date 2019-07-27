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

|name     |type         |             length|
|---------|-------------|------------------:|
|userid   |varchar      |                 20|
|eid      |varchar      |                 20|
|timestamp|smalldatetime|YYYY-MM-DD hh:mm:ss|
|comment  |nvarchar     |                200|
|tags     |nvarchar     |                200|
|starlen  |smallint     |                  -|

```sql
create table USER_BOOKMARKS (
  userid varchar(20),
  eid varchar(20),
  timestamp smalldatetime,
  comment nvarchar(200),
  tags nvarchar(200),
  starlen smallint,
  PRIMARY KEY (userid, eid)
)
```