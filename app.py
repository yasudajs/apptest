from flask import Flask, send_from_directory, send_file
import os

# CGI環境での SCRIPT_NAME をリセット（url_for の重複パス問題を解決）
if 'SCRIPT_NAME' in os.environ:
    os.environ['SCRIPT_NAME'] = ''

# Flask統合アプリケーション - Blueprint構成
app = Flask(__name__, static_folder=None)
app.secret_key = 'apptest-secret-key-stable'

# CGI環境でのパス問題を解決するため APPLICATION_ROOT を設定
app.config['APPLICATION_ROOT'] = '/'

# 各アプリのBlueprintをインポート
from apps.stopwatch.blueprint import stopwatch_bp
from apps.board.blueprint import board_bp
from apps.qrcode.blueprint import qrcode_bp

# Blueprintを登録
app.register_blueprint(stopwatch_bp, url_prefix='/stopwatch')
app.register_blueprint(board_bp, url_prefix='/board')
app.register_blueprint(qrcode_bp, url_prefix='/qrcode')

# 静的ファイルの提供
@app.route('/css/<path:filename>')
def serve_css(filename):
    return send_from_directory('css', filename)

@app.route('/pic/<path:filename>')
def serve_pic(filename):
    return send_from_directory('pic', filename)

@app.route('/jsapps/<path:path>')
def serve_jsapps(path):
    # ディレクトリアクセス時は index.html を提供
    full_path = os.path.join('jsapps', path)
    if os.path.isdir(full_path):
        index_path = os.path.join(full_path, 'index.html')
        if os.path.isfile(index_path):
            return send_file(index_path)
    return send_from_directory('jsapps', path)

# メインページ
@app.route('/')
def index():
    """メインポータルページを提供"""
    try:
        return send_file('index.html')
    except Exception as e:
        return f"<h1>エラー: index.htmlが見つかりません</h1><p>エラー詳細: {e}</p>"

if __name__ == "__main__":
    print("=" * 60)
    print("🚀 AppTest - Flask Blueprint Server")
    print("=" * 60)
    print("📋 Features:")
    print("  ✅ Flask Framework with Blueprints")
    print("  ✅ Independent App Modules")
    print("  ✅ Lightweight & Fast")
    print("  ✅ Server Compatible")
    print("")
    print("🌐 Access URLs:")
    print("  📱 Local Access:")
    print("    Main Portal: http://localhost:8080")
    print("    Stopwatch:   http://localhost:8080/stopwatch")
    print("    Board:       http://localhost:8080/board")
    print("    QRCode:      http://localhost:8080/qrcode")
    print("    Calculator:  http://localhost:8080/jsapps/calculator")
    print("")
    print("  🌍 Network Access (if firewall allows):")
    print("    Main Portal: http://192.168.11.3:8080")
    print("    Note: If external access fails, check Windows Firewall settings.")
    print("")
    print("🎯 Starting server...")
    print("⚡ Multi-threaded server enabled for concurrent connections")
    print("=" * 60)
    
    try:
        # Windows推奨: Waitress (マルチスレッド対応)
        from waitress import serve
        print("🚀 Using Waitress server (recommended for Windows)")
        serve(app, host='0.0.0.0', port=8080, threads=6)
    except ImportError:
        # フォールバック: Flask標準サーバー
        print("⚠️ Warning: Using Flask development server")
        print("   For better concurrent access, install: pip install waitress")
        app.run(host='0.0.0.0', port=8080, debug=True, threaded=True)