# AppTest - Webアプリケーション集

このプロジェクトは複数のWebアプリケーション（ストップウォッチ・メモ・QRコード・電卓）を1つのFlaskサーバーでBlueprint構成により統合管理するポータルサイトです。

## プロジェクト構造

```
apptest/
├── apps/                   # Pythonアプリケーション（Blueprint構成）
│   ├── stopwatch/         # ストップウォッチ（Flask Blueprint）
│   │   ├── blueprint.py   # Blueprint定義
│   │   ├── stopwatch.html # テンプレート
│   │   ├── stopwatch.css  # スタイル
│   │   └── stopwatch.js   # スクリプト
│   ├── board/             # 掲示板アプリ（Flask Blueprint）
│   │   ├── blueprint.py   # Blueprint定義
│   │   ├── board.html     # テンプレート
│   │   ├── board.css      # スタイル
│   │   └── board.js       # スクリプト
│   └── qrcode/            # QRコード生成（Flask Blueprint）
│       ├── blueprint.py   # Blueprint定義
│       ├── qrcode.html    # テンプレート
│       ├── qrcode.css     # スタイル
│       └── qrcode.js      # スクリプト
├── jsapps/                # JavaScript/HTMLアプリケーション
├── css/                   # CSSファイル
├── pic/                   # 画像ファイル
├── index.html             # メインポータルページ
├── app.py                 # Flask統合サーバー（Blueprint登録）
├── index.cgi              # CGIエントリポイント（レンタルサーバー用）
├── .htaccess              # CGI転送設定
├── requirements.txt       # 依存ライブラリ（Flask + 拡張）
└── run.bat                # Windows用起動スクリプト
```

## セットアップ手順

### 1. Python環境の準備
```bash
python --version  # Python 3.8以上が必要
```

### 2. 依存関係をインストール（プロジェクトルートで一括管理）
```bash
pip install -r requirements.txt
```

## サーバーの起動

```bash
python app.py
# http://localhost:8080 で全アプリにアクセス可能
```

または Windows用スクリプトを使用：

```bash
run.bat start
```

## アプリケーション詳細

### ストップウォッチ（Flask Blueprint）
- シンプルなストップウォッチ機能
- スタート、ストップ、リセット
- ミリ秒単位での時間計測
- 独立したBlueprintモジュール

### 掲示板アプリ（Flask Blueprint）
- ユーザー投稿の作成・閲覧・削除
- 投稿内容の永続化
- 過去ログのアーカイブ機能
- セッション管理と削除権制限
- 独立したBlueprintモジュール

### QRコードアプリ（Flask Blueprint）
- テキストやURLからQRコードを生成
- PNG形式での画像出力
- 画像の保存が可能
- 独立したBlueprintモジュール

## 開発・カスタマイズ

各アプリケーションは`apps/`以下の独立したBlueprintモジュールとして分離されています。
新しいアプリを追加する場合は、`apps/`フォルダに新しいディレクトリを作成し、
`blueprint.py`でBlueprintを定義して、`app.py`に登録してください。

## 特徴（Flask Blueprint統合）
- ✅ **Flask Blueprint**: 各アプリが独立したBlueprintモジュール
- ✅ **モジュール独立性**: アプリ間の依存関係なし
- ✅ **軽量**: 依存関係最小（Flask + qrcode + pillow + waitress のみ）
- ✅ **シンプル**: 1プロセス、複数ポート不要
- ✅ **高速**: 起動・実行が速い
- ✅ **効率的**: メモリ使用量が少ない
- ✅ **自動検出**: 仮想環境を自動検出
- ✅ **マルチスレッド**: Waitress による複数接続対応

## 本番環境へのデプロイ

### CGI環境での実行（レンタルサーバー等）

プロジェクトルートの `.htaccess` ファイルに以下の設定を行います：

```
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^(.*)$ /index.cgi/$1 [QSA,L]
Options -Indexes
```

`index.cgi` は Flask アプリケーションを CGI 経由で実行するエントリポイントです。

### Waitress サーバーでの本番実行

より高速で安定した運用には、Waitress サーバーの使用を推奨します：

```bash
pip install waitress
waitress-serve --port=8080 --threads=6 app:app
```

## トラブルシューティング

### よくある問題

| 問題 | 原因 | 解決方法 |
|------|------|--------|
| サーバーが起動しない | 依存ライブラリが不足している | `pip install -r requirements.txt` を実行 |
| ポート8080が使用中 | 別のプロセスが使用中 | `netstat -an \| findstr ":8080"` で確認し、別ポート指定 |
| CSS/JSが読み込まれない | ブラウザキャッシュ問題 | Ctrl+F5 でキャッシュクリア |
| 投稿が保存されない | ディレクトリの書き込み権限不足 | `apps/board/` ディレクトリの権限確認 |
| CORS エラーが出る | ブラウザのセキュリティポリシー | 開発環境ではブラウザの設定確認 |

## 注意事項

- 本番環境では適切なファイアウォール設定を行ってください
- セキュリティを考慮した設定を行ってください
- ログの定期的な監視とローテーション設定を推奨します
- データベースを使用する場合は、適切なデータベース設定を行ってください