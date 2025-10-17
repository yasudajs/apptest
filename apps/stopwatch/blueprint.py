from flask import Blueprint, render_template, send_from_directory, abort
import os

# Stopwatch Blueprint
stopwatch_bp = Blueprint(
    'stopwatch',
    __name__,
    template_folder='templates',
    static_folder='static',
    static_url_path='/stopwatch/static'
)

@stopwatch_bp.route('/')
@stopwatch_bp.route('')
def index():
    """ストップウォッチアプリのメインページ"""
    return render_template('stopwatch.html')
