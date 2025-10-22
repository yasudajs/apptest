// script.js - メイン初期化スクリプト
document.addEventListener('DOMContentLoaded', () => {
    // ボード作成
    UIManager.createBoard();

    // ゲーム初期化
    const game = new OthelloGame();

    // ゲームクラスのメソッドをUIマネージャーに接続
    game.updateDisplay = () => UIManager.updateDisplay(game);
    game.showMessage = UIManager.showMessage;

    // 初期表示更新
    game.updateDisplay();
});
