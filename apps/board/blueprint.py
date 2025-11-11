from flask import Blueprint, render_template, request, redirect, url_for, jsonify, send_from_directory, abort, make_response
import sqlite3
import os
from datetime import datetime, timedelta
import uuid

board_bp = Blueprint('board', __name__, template_folder='templates', static_folder='static', static_url_path='/board/static')

# DBパスをboardフォルダ内に設定（アプリごと分離）
DATABASE = os.path.join(os.path.dirname(__file__), 'board.db')

def get_db():
    db = sqlite3.connect(DATABASE)
    db.row_factory = sqlite3.Row
    return db

def init_db():
    with get_db() as db:
        db.execute('''
            CREATE TABLE IF NOT EXISTS posts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                log_id INTEGER NOT NULL,
                local_id INTEGER NOT NULL,
                username TEXT NOT NULL,
                content TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NULL,
                deleted_at TEXT NULL,
                session_id TEXT,
                UNIQUE(log_id, local_id)
            )
        ''')
        db.commit()

# 初期化
init_db()

def get_next_log_local_ids():
    with get_db() as db:
        last_post = db.execute('SELECT log_id, local_id FROM posts ORDER BY id DESC LIMIT 1').fetchone()
        if last_post:
            log_id, local_id = last_post['log_id'], last_post['local_id']
            if local_id < 100:
                return log_id, local_id + 1
            else:
                return log_id + 1, 1
        else:
            return 1, 1

def get_or_create_session_id():
    user_id = request.cookies.get('user_session_id')
    if not user_id:
        user_id = str(uuid.uuid4())
    return user_id

def get_poster_name():
    return request.cookies.get('poster_name', '')

def format_datetime_for_display(dt_str):
    try:
        dt = datetime.strptime(dt_str, '%Y-%m-%d %H:%M:%S')
        weekdays = ['月', '火', '水', '木', '金', '土', '日']
        weekday = weekdays[dt.weekday()]
        return dt.strftime(f'%Y/%m/%d({weekday}) %H:%M:%S.01')
    except:
        return dt_str

def check_can_delete(post):
    # sqlite3.Rowを辞書に変換
    post_dict = dict(post)
    if post_dict.get('deleted_at'):
        return False
    current_session_id = request.cookies.get('user_session_id')
    post_session_id = post_dict.get('session_id')
    if not current_session_id or post_session_id != current_session_id:
        return False
    try:
        created_at = datetime.strptime(post_dict['created_at'], '%Y-%m-%d %H:%M:%S')
        time_diff = datetime.now() - created_at
        if time_diff > timedelta(days=7):
            return False
    except Exception as e:
        return False
    return True

@board_bp.route('/')
@board_bp.route('')
def index():
    session_id = get_or_create_session_id()
    poster_name = get_poster_name()

    # 表示件数を取得（デフォルト10件）
    limit = request.args.get('limit', 10, type=int)
    if limit not in [10, 20, 30, 50, 100]:
        limit = 10

    with get_db() as db:
        posts = db.execute('SELECT *, (log_id || "_" || local_id) AS post_id FROM posts ORDER BY id DESC LIMIT ?', (limit,)).fetchall()
    posts_display = []
    for post in posts:
        post_display = dict(post)
        post_display['display_id'] = post['post_id']
        post_display['formatted_time'] = format_datetime_for_display(post['created_at'])
        if post['deleted_at']:
            post_display['content'] = '（削除されました。）'
        post_display['can_delete'] = check_can_delete(post)
        posts_display.append(post_display)
    # 逆順にして古いものが上になるようにする
    posts_display.reverse()
    response = make_response(render_template('board.html', posts=posts_display, saved_name=poster_name, current_limit=limit))
    response.set_cookie('user_session_id', session_id, max_age=86400*7)
    return response

@board_bp.route('/add', methods=['POST'])
def add_post():
    name = request.form.get('name', '').strip()
    content = request.form.get('content', '').strip()
    if not name:
        name = '名無しさん'
    if content:
        log_id, local_id = get_next_log_local_ids()
        session_id = get_or_create_session_id()
        with get_db() as db:
            db.execute('INSERT INTO posts (log_id, local_id, username, content, created_at, session_id) VALUES (?, ?, ?, ?, datetime("now"), ?)',
                       (log_id, local_id, name, content, session_id))
            db.commit()
    response = make_response(redirect('/board/'))
    session_id = get_or_create_session_id()
    response.set_cookie('user_session_id', session_id, max_age=86400*7)
    if name != '名無しさん':
        response.set_cookie('poster_name', name, max_age=86400*7)
    return response

@board_bp.route('/delete', methods=['POST'])
def delete_post():
    post_id = request.form.get('post_id')
    error_msg = None
    if post_id:
        try:
            log_id, local_id = map(int, post_id.split('_'))
            with get_db() as db:
                post = db.execute('SELECT * FROM posts WHERE log_id = ? AND local_id = ?', (log_id, local_id)).fetchone()
                if post and check_can_delete(post):
                    db.execute('UPDATE posts SET deleted_at = datetime("now") WHERE log_id = ? AND local_id = ?', (log_id, local_id))
                    db.commit()
                else:
                    error_msg = 'この投稿は削除できません。投稿から7日以内で、かつ同じセッションから投稿した場合のみ削除可能です。'
        except:
            error_msg = '投稿IDが無効です。'
    if error_msg:
        with get_db() as db:
            posts = db.execute('SELECT *, (log_id || "_" || local_id) AS post_id FROM posts ORDER BY id DESC LIMIT 100').fetchall()
        posts_display = []
        for p in posts:
            p_display = dict(p)
            p_display['display_id'] = p['post_id']
            p_display['formatted_time'] = format_datetime_for_display(p['created_at'])
            if p['deleted_at']:
                p_display['content'] = '（削除されました。）'
            p_display['can_delete'] = check_can_delete(p)
            posts_display.append(p_display)
        # 逆順にして古いものが上になるようにする
        posts_display.reverse()
        response = make_response(render_template('board.html', posts=posts_display, error=error_msg, saved_name=get_poster_name()))
        session_id = get_or_create_session_id()
        response.set_cookie('user_session_id', session_id, max_age=86400*7)
        poster_name = get_poster_name()
        if poster_name:
            response.set_cookie('poster_name', poster_name, max_age=86400*7)
        return response
    response = make_response(redirect('/board/'))
    session_id = get_or_create_session_id()
    response.set_cookie('user_session_id', session_id, max_age=86400*7)
    poster_name = get_poster_name()
    if poster_name:
        response.set_cookie('poster_name', poster_name, max_age=86400*7)
    return response

@board_bp.route('/api/list')
def api_list():
    with get_db() as db:
        posts = db.execute('SELECT *, (log_id || "_" || local_id) AS post_id FROM posts ORDER BY id DESC LIMIT 100').fetchall()
    posts_display = []
    for post in posts:
        post_display = dict(post)
        post_display['display_id'] = post['post_id']
        post_display['formatted_time'] = format_datetime_for_display(post['created_at'])
        if post['deleted_at']:
            post_display['content'] = '（削除されました。）'
        posts_display.append(post_display)
    # 逆順にして古いものが上になるようにする
    posts_display.reverse()
    return jsonify(posts_display)

@board_bp.route('/logs')
def view_logs():
    with get_db() as db:
        logs = db.execute('SELECT log_id, COUNT(*) as count FROM posts GROUP BY log_id ORDER BY log_id').fetchall()
    logs_display = [{'num': log['log_id'], 'count': log['count']} for log in logs]
    return render_template('log_index.html', logs=logs_display)

@board_bp.route('/log/<int:log_num>')
def view_log(log_num):
    with get_db() as db:
        posts = db.execute('SELECT *, (log_id || "_" || local_id) AS post_id FROM posts WHERE log_id = ? ORDER BY local_id', (log_num,)).fetchall()
    if not posts:
        abort(404)
    posts_display = []
    for post in posts:
        post_display = dict(post)
        post_display['display_id'] = post['post_id']
        post_display['formatted_time'] = format_datetime_for_display(post['created_at'])
        if post['deleted_at']:
            post_display['content'] = '（削除されました。）'
        posts_display.append(post_display)
    return render_template('log_view.html', log_num=log_num, posts=posts_display)

@board_bp.route('/<path:filename>')
def static_files(filename):
    if filename.lower().endswith('.html'):
        abort(404)
    return send_from_directory(os.path.dirname(__file__), filename)
