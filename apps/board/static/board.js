document.addEventListener('DOMContentLoaded', function() {
    // 表示件数ドロップダウンの処理
    const postLimitSelect = document.getElementById('post-limit');
    
    if (postLimitSelect) {
        // URLパラメータから現在のlimitを取得
        const urlParams = new URLSearchParams(window.location.search);
        const currentLimit = urlParams.get('limit') || '10';
        postLimitSelect.value = currentLimit;
        
        // ドロップダウン変更時
        postLimitSelect.addEventListener('change', function() {
            const limit = this.value;
            // URLパラメータを変更してページ遷移
            const newUrl = new URL(window.location);
            newUrl.searchParams.set('limit', limit);
            window.location.href = newUrl.toString();
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
