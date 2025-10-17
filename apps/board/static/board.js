/**
 * 掲示板スクリプト
 * 投稿一覧の表示件数制御
 */

document.addEventListener('DOMContentLoaded', function() {
    // 表示件数ドロップダウンの処理
    const postLimitSelect = document.getElementById('post-limit');
    
    if (postLimitSelect) {
        // ドロップダウン変更時
        postLimitSelect.addEventListener('change', function() {
            const limit = parseInt(this.value);
            updatePostDisplay(limit);
            // 選択状態をローカルストレージに保存
            localStorage.setItem('postLimit', limit.toString());
        });
        
        // 前回の選択を復得
        const savedLimit = localStorage.getItem('postLimit');
        let initialLimit = 10; // デフォルト
        
        if (savedLimit) {
            initialLimit = parseInt(savedLimit);
            postLimitSelect.value = initialLimit.toString();
        }
        
        // 初期表示
        updatePostDisplay(initialLimit);
    }
    
    function updatePostDisplay(limit) {
        const posts = document.querySelectorAll('.posts-list .post');
        let visibleCount = 0;
        
        posts.forEach((post, index) => {
            const shouldShow = index < limit;
            if (shouldShow) {
                post.classList.remove('hidden');
                post.style.display = '';
                visibleCount++;
            } else {
                post.classList.add('hidden');
                post.style.display = 'none !important';
            }
        });
    }
    
    // フォームの初期化
    const form = document.querySelector('.post-form form');
    if (form) {
        form.addEventListener('submit', function() {
            // 投稿前の検証などをここに追加可能
        });
    }
});
