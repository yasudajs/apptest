from flask import Blueprint, render_template, request, send_from_directory, abort, send_file, url_for
import io
import base64
import qrcode
import os
from datetime import datetime

# QRCode Blueprint
qrcode_bp = Blueprint('qrcode', __name__,
                      template_folder='templates',
                      static_folder='static',
                      static_url_path='/qrcode/static')

def generate_qr_bytes(text: str) -> bytes:
    """QRコードPNGのバイナリを生成して返す"""
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4
    )
    qr.add_data(text)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    img_io = io.BytesIO()
    img.save(img_io, 'PNG')
    img_io.seek(0)
    return img_io.getvalue()

def generate_qr_image(text: str) -> str:
    """QRコード画像を生成してBase64エンコード文字列を返す"""
    return base64.b64encode(generate_qr_bytes(text)).decode()

@qrcode_bp.route('/', methods=['GET', 'POST'])
@qrcode_bp.route('', methods=['GET', 'POST'])
def index():
    """QRコードアプリのメインページ"""
    qr_image_data = None
    text_input = ""
    error_message = None
    
    if request.method == 'POST':
        text_input = request.form.get('text', '').strip()
        if text_input:
            qr_image_data = generate_qr_image(text_input)
        else:
            error_message = "QRコードにしたいテキストやURLを入力してください。"
    
    qr_result = ''
    if qr_image_data:
        qr_result = f'<img src="data:image/png;base64,{qr_image_data}" alt="QRコード" class="qr-image">'
    
    return render_template('qrcode.html', qr_result=qr_result, text_input=text_input, error_message=error_message)

@qrcode_bp.route('/download', methods=['GET'])
def download_qr():
    """クエリの text からQRコードPNGを生成し、ダウンロードさせる"""
    text = request.args.get('text', '').strip()
    if not text:
        # 入力がない場合は400 Bad Request
        return ("text query parameter is required", 400)
    png_bytes = generate_qr_bytes(text)
    # 日時付きファイル名: QR_YYYYMMDD_HHMMSS.png
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    filename = f"QR_{timestamp}.png"
    return send_file(
        io.BytesIO(png_bytes),
        mimetype='image/png',
        as_attachment=True,
        download_name=filename
    )
