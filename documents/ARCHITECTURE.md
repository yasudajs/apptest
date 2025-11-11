# AppTest Bottle Single Server - 最終版 🏆

## 採用理由
- ✅ 軽量（依存関係最小）
- ✅ シンプル（学習コスト低）
- ✅ 高速（起動・実行速度）
- ✅ 効率的（メモリ使用量少）

## 実行方法
```bash
# 最もシンプル
python single_server.py

# または管理スクリプト
.\simple.bat start
```

## ファイル構成
- single_server.py    # メインサーバー（Bottle）
- flask_server.py     # 比較用（参考実装）
- simple.bat         # 起動スクリプト

## 特徴
1. 内部ポート不要（プロセス1つのみ）
2. 全アプリ統合（stopwatch, memo, qrcode, 静的ファイル）
3. 軽量フレームワーク（Bottle）
4. サーバー対応（requirements.txtと互換）

## アクセスURL
- Main Portal: http://localhost:8080
- Stopwatch:   http://localhost:8080/apps/stopwatch
- Memo:        http://localhost:8080/apps/memo
- QRCode:      http://localhost:8080/apps/qrcode
- Calculator:  http://localhost:8080/jsapps/calculator