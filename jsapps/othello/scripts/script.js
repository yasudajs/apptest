// script.js - メイン初期化スクリプト
let game = null;
let gameMode = null;

document.addEventListener('DOMContentLoaded', () => {
    setupModeSelection();
});

function setupModeSelection() {
    const singlePlayerBtn = document.getElementById('single-player-btn');
    const twoPlayerBtn = document.getElementById('two-player-btn');
    const backToMenuBtn = document.getElementById('back-to-menu-btn');

    singlePlayerBtn.addEventListener('click', () => startGame('single'));
    twoPlayerBtn.addEventListener('click', () => startGame('two'));
    backToMenuBtn.addEventListener('click', () => backToMenu());
}

function startGame(mode) {
    gameMode = mode;

    // モード選択画面を隠す
    document.getElementById('mode-selection').classList.add('hidden');
    // ゲーム画面を表示
    document.getElementById('game-container').classList.remove('hidden');

    // ボード作成
    UIManager.createBoard();

    // ゲーム初期化
    game = new OthelloGame(mode);

    // ゲームクラスのメソッドをUIマネージャーに接続
    game.updateDisplay = () => UIManager.updateDisplay(game);
    game.showMessage = UIManager.showMessage;

    // 初期表示更新
    game.updateDisplay();
}

function backToMenu() {
    // ゲーム画面を隠す
    document.getElementById('game-container').classList.add('hidden');
    // モード選択画面を表示
    document.getElementById('mode-selection').classList.remove('hidden');

    // ゲームをリセット
    if (game) {
        game = null;
        gameMode = null;
    }
}
