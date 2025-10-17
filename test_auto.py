import json
import requests
import time

def check_posts_count():
    with open('apps/board/posts.json', 'r', encoding='utf-8') as f:
        posts = json.load(f)
    return len(posts), posts[0]['post_id'] if posts else None, posts[-1]['post_id'] if posts else None

def check_manifest():
    with open('apps/board/log/log_manifest.json', 'r', encoding='utf-8') as f:
        manifest = json.load(f)
    return manifest

def post_message(content):
    url = 'http://localhost:5000/board/add_post'
    data = {
        'name': 'Test User',
        'content': content
    }
    try:
        response = requests.post(url, data=data)
        return response.status_code == 200
    except Exception as e:
        print(f'Error: {e}')
        return False

print('=== テスト開始 ===\n')

# 現在の状態確認
count, first, last = check_posts_count()
manifest = check_manifest()
print(f'[初期状態] posts.json: {count}件 ({first} ~ {last})')
print(f'[初期状態] manifest: current_log={manifest["current_log"]}, logs={len(manifest["logs"])}個')
print()

# 2_100 を投稿
print('>> 2_100 を投稿...')
if post_message('2_100投稿テスト'):
    time.sleep(0.5)
    count, first, last = check_posts_count()
    manifest = check_manifest()
    print(f'[2_100後] posts.json: {count}件 ({first} ~ {last})')
    print(f'[2_100後] manifest: current_log={manifest["current_log"]}, logs数={len(manifest["logs"])}')
    for log in manifest['logs']:
        print(f'  - log{log["num"]}: {log["count"]}件')
    print()
else:
    print('投稿失敗')

# 3_1 を投稿
print('>> 3_1 を投稿...')
if post_message('3_1投稿テスト'):
    time.sleep(0.5)
    count, first, last = check_posts_count()
    manifest = check_manifest()
    print(f'[3_1後] posts.json: {count}件 ({first} ~ {last})')
    print(f'[3_1後] manifest: current_log={manifest["current_log"]}, logs数={len(manifest["logs"])}')
    for log in manifest['logs']:
        print(f'  - log{log["num"]}: {log["count"]}件')
    print()
else:
    print('投稿失敗')

# 4_1 を投稿
print('>> 4_1 を投稿...')
if post_message('4_1投稿テスト'):
    time.sleep(0.5)
    count, first, last = check_posts_count()
    manifest = check_manifest()
    print(f'[4_1後] posts.json: {count}件 ({first} ~ {last})')
    print(f'[4_1後] manifest: current_log={manifest["current_log"]}, logs数={len(manifest["logs"])}')
    for log in manifest['logs']:
        print(f'  - log{log["num"]}: {log["count"]}件')
    print()
else:
    print('投稿失敗')

# 5_1 を投稿
print('>> 5_1 を投稿...')
if post_message('5_1投稿テスト'):
    time.sleep(0.5)
    count, first, last = check_posts_count()
    manifest = check_manifest()
    print(f'[5_1後] posts.json: {count}件 ({first} ~ {last})')
    print(f'[5_1後] manifest: current_log={manifest["current_log"]}, logs数={len(manifest["logs"])}')
    for log in manifest['logs']:
        print(f'  - log{log["num"]}: {log["count"]}件')
    print()
else:
    print('投稿失敗')

print('=== テスト完了 ===')
