import json
from datetime import datetime, timedelta

# テスト用ダミーデータ (1_1 ~ 1_99)
posts = []
base_time = datetime.now()

for i in range(1, 100):
    post = {
        'post_id': f'1_{i}',
        'name': f'user{i % 3 + 1}',
        'content': f'Test message {i}',
        'created_at': (base_time - timedelta(minutes=100-i)).strftime('%Y-%m-%d %H:%M:%S'),
        'is_deleted': False,
        'session_id': 'test-session'
    }
    posts.append(post)

# posts.json に保存
with open('apps/board/posts.json', 'w', encoding='utf-8') as f:
    json.dump(posts, f, ensure_ascii=False, indent=2)

print('ダミーデータを作成しました')
print(f'投稿数: {len(posts)}')
print(f'ID範囲: {posts[0]["post_id"]} - {posts[-1]["post_id"]}')
