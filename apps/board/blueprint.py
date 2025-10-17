from flask import Blueprint, render_template, request, redirect, url_for, jsonify, send_from_directory, abort, make_response
import json
import os
from datetime import datetime, timedelta
import uuid

board_bp = Blueprint('board', __name__, template_folder='templates', static_folder='static', static_url_path='/board/static')

# ファイルパスの基準ディレクトリを動的に決定
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
POSTS_FILE = os.path.join(BASE_DIR, 'board', 'posts.json')
LOG_DIR = os.path.join(BASE_DIR, 'board', 'log')
LOG_MANIFEST_FILE = os.path.join(LOG_DIR, 'log_manifest.json')
MAX_POSTS = 200
BATCH_SIZE = 100

def load_posts():
    if os.path.exists(POSTS_FILE):
        try:
            with open(POSTS_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except:
            return []
    return []

def save_posts(posts):
    os.makedirs(os.path.dirname(POSTS_FILE), exist_ok=True)
    with open(POSTS_FILE, 'w', encoding='utf-8') as f:
        json.dump(posts, f, ensure_ascii=False, indent=2)

def load_log_manifest():
    if os.path.exists(LOG_MANIFEST_FILE):
        try:
            with open(LOG_MANIFEST_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except:
            return {"current_log": 1, "logs": []}
    return {"current_log": 1, "logs": []}

def save_log_manifest(manifest):
    os.makedirs(LOG_DIR, exist_ok=True)
    with open(LOG_MANIFEST_FILE, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)

def create_log_file(log_num, posts_to_archive):
    os.makedirs(LOG_DIR, exist_ok=True)
    log_file = os.path.join(LOG_DIR, f'log{log_num}.json')
    with open(log_file, 'w', encoding='utf-8') as f:
        json.dump(posts_to_archive, f, ensure_ascii=False, indent=2)

def get_next_post_id():
    posts = load_posts()
    if not posts:
        return "1_1"
    try:
        last_id = posts[-1]['post_id']
        if '_' in str(last_id):
            log_num, local_num = str(last_id).split('_')
            log_num, local_num = int(log_num), int(local_num)
        else:
            old_id = int(last_id)
            log_num = (old_id - 1) // BATCH_SIZE + 1
            local_num = ((old_id - 1) % BATCH_SIZE) + 1
        if local_num < BATCH_SIZE:
            local_num += 1
            return f"{log_num}_{local_num}"
        else:
            next_log_num = log_num + 1
            return f"{next_log_num}_1"
    except (ValueError, KeyError, AttributeError):
        return "1_1"

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
    if post.get('is_deleted', False):
        return False
    current_session_id = request.cookies.get('user_session_id')
    post_session_id = post.get('session_id')
    if not current_session_id or post_session_id != current_session_id:
        return False
    try:
        created_at = datetime.strptime(post['created_at'], '%Y-%m-%d %H:%M:%S')
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
    posts = load_posts()
    posts_display = []
    for post in reversed(posts):
        post_display = post.copy()
        post_display['display_id'] = post['post_id']
        post_display['formatted_time'] = format_datetime_for_display(post['created_at'])
        post_display['can_delete'] = check_can_delete(post)
        posts_display.append(post_display)
    response = make_response(render_template('board.html', posts=posts_display, saved_name=poster_name))
    response.set_cookie('user_session_id', session_id, max_age=86400*7)
    return response

@board_bp.route('/add', methods=['POST'])
def add_post():
    name = request.form.get('name', '').strip()
    content = request.form.get('content', '').strip()
    if not name:
        name = '名無しさん'
    if content:
        posts = load_posts()
        manifest = load_log_manifest()
        next_id = get_next_post_id()
        log_num, local_num = next_id.split('_')
        log_num, local_num = int(log_num), int(local_num)
        session_id = get_or_create_session_id()
        
        new_post = {'post_id': next_id, 'name': name, 'content': content, 'created_at': datetime.now().strftime('%Y-%m-%d %H:%M:%S'), 'is_deleted': False, 'session_id': session_id}
        posts.append(new_post)
        
        # local_num == 1 かつ、前のログがある場合、前のログをアーカイブ
        if local_num == 1 and log_num > 1:
            prev_log_num = log_num - 1
            posts_to_log = [p for p in posts if str(p['post_id']).startswith(f"{prev_log_num}_")]
            if posts_to_log and len(posts_to_log) == BATCH_SIZE:
                create_log_file(prev_log_num, posts_to_log)
                manifest['current_log'] = log_num
                log_entry = {"num": prev_log_num, "count": BATCH_SIZE, "created": datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
                is_already_archived = any(log['num'] == prev_log_num for log in manifest['logs'])
                if not is_already_archived:
                    manifest['logs'].append(log_entry)
                save_log_manifest(manifest)
        
        # 常に2世代分を posts に保持（3世代以上前を削除）
        if posts:
            current_log_num = int(str(posts[-1]['post_id']).split('_')[0])
            archive_threshold = current_log_num - 1
            posts = [p for p in posts if int(str(p['post_id']).split('_')[0]) >= archive_threshold]
        
        save_posts(posts)
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
        posts = load_posts()
        for post in posts:
            if post['post_id'] == post_id:
                if not check_can_delete(post):
                    error_msg = 'この投稿は削除できません。投稿から7日以内で、かつ同じセッションから投稿した場合のみ削除可能です。'
                else:
                    post['deleted_content'] = post['content']
                    post['is_deleted'] = True
                    post['deleted_at'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                    post['content'] = '削除されました'
                    save_posts(posts)
                break
        if error_msg:
            posts_display = []
            for p in reversed(posts):
                p_display = p.copy()
                p_display['display_id'] = p['post_id']
                p_display['formatted_time'] = format_datetime_for_display(p['created_at'])
                p_display['can_delete'] = check_can_delete(p)
                posts_display.append(p_display)
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
    posts = load_posts()
    posts_display = []
    for post in reversed(posts):
        post_display = post.copy()
        post_display['display_id'] = post['post_id']
        post_display['formatted_time'] = format_datetime_for_display(post['created_at'])
        posts_display.append(post_display)
    return jsonify(posts_display)

@board_bp.route('/logs')
def view_logs():
    manifest = load_log_manifest()
    logs = manifest.get('logs', [])
    return render_template('log_index.html', logs=logs)

@board_bp.route('/log/<int:log_num>')
def view_log(log_num):
    log_file = os.path.join(LOG_DIR, f'log{log_num}.json')
    if not os.path.exists(log_file):
        abort(404)
    try:
        with open(log_file, 'r', encoding='utf-8') as f:
            posts = json.load(f)
    except:
        abort(500)
    posts_display = []
    for post in reversed(posts):
        post_display = post.copy()
        post_display['display_id'] = post['post_id']
        post_display['formatted_time'] = format_datetime_for_display(post['created_at'])
        posts_display.append(post_display)
    return render_template('log_view.html', log_num=log_num, posts=posts_display)

@board_bp.route('/<path:filename>')
def static_files(filename):
    if filename.lower().endswith('.html'):
        abort(404)
    return send_from_directory(os.path.dirname(__file__), filename)
