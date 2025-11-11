# Boardアプリ DBテーブル定義

## postsテーブル
Boardアプリの全投稿データを管理するテーブル。JSONファイル（posts.json, log/フォルダ）の代わりに使用。post_idはプログラム側でlog_idとlocal_idから生成。

### 構造
| カラム名     | 型          | 制約                  | 説明                          |
|--------------|-------------|-----------------------|-------------------------------|
| id          | INTEGER    | PRIMARY KEY AUTOINCREMENT | 自動生成の主キー              |
| log_id      | INTEGER    | NOT NULL              | ログ番号（世代、例: 1, 2...） |
| local_id    | INTEGER    | NOT NULL              | ローカル番号（世代内連番、例: 1, 2...） |
| username    | TEXT       | NOT NULL              | 投稿者名                      |
| content     | TEXT       | NOT NULL              | 投稿内容                      |
| created_at  | TEXT       | NOT NULL              | 投稿日時（datetime("now")）   |
| updated_at  | TEXT       | NULL                  | 修正日時（NULLで未修正）      |
| deleted_at  | TEXT       | NULL                  | 削除日時（NULLで未削除、ソフトデリート用） |
| session_id  | TEXT       | NULL                  | セッションID（削除権確認用）   |

### ユニーク制約
- (log_id, local_id): ログ番号とローカル番号の組み合わせで重複防止。

### インデックス
- 主キー: id
- 推奨インデックス: log_id, local_id, created_at（ソート・フィルタ用）

### 使用例
- 最新投稿取得: `SELECT *, (log_id || '_' || local_id) AS post_id FROM posts ORDER BY id DESC LIMIT 100`
- 投稿追加: `INSERT INTO posts (log_id, local_id, username, content, created_at, session_id) VALUES (?, ?, ?, ?, datetime("now"), ?)`
- 世代別取得: `SELECT * FROM posts WHERE log_id = ? ORDER BY local_id`
- ログ一覧取得（100件ちょうど）: `SELECT log_id, COUNT(*) as count, (SELECT created_at FROM posts WHERE log_id = p.log_id AND local_id = 100) as last_created_at FROM posts p GROUP BY log_id HAVING COUNT(*) = 100 ORDER BY log_id`

### 注意点
- 全投稿データを保持するため、データ量増加に注意。
- 同時アクセス時はトランザクションを使用。
- post_idはプログラム側で生成（表示用）。
- **ソフトデリート仕様**: 投稿削除時は行を物理削除せず、deleted_atに削除日時をセット。投稿内容は保持。
- **表示仕様**: 表示側でdeleted_atがNULL以外の場合、内容を「（削除されました。）」と表示。