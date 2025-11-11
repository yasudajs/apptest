// script.js - メイン初期化スクリプト
let game = null;
let gameMode = null;
let playerColor = null;

document.addEventListener('DOMContentLoaded', () => {
    setupModeSelection();
    setupTurnSelection();
});

function setupModeSelection() {
    const singlePlayerBtn = document.getElementById('single-player-btn');
    const twoPlayerBtn = document.getElementById('two-player-btn');
    const backToMenuBtn = document.getElementById('back-to-menu-btn');

    singlePlayerBtn.addEventListener('click', () => showTurnSelection());
    twoPlayerBtn.addEventListener('click', () => startGame('two'));
    backToMenuBtn.addEventListener('click', () => backToMenu());
}

function setupTurnSelection() {
    const firstTurnBtn = document.getElementById('first-turn-btn');
    const secondTurnBtn = document.getElementById('second-turn-btn');
    const backToModeBtn = document.getElementById('back-to-mode-btn');

    firstTurnBtn.addEventListener('click', () => startGame('single', 'black'));
    secondTurnBtn.addEventListener('click', () => startGame('single', 'white'));
    backToModeBtn.addEventListener('click', () => backToModeSelection());
}

function showTurnSelection() {
    document.getElementById('mode-selection').classList.add('hidden');
    document.getElementById('turn-selection').classList.remove('hidden');
}

function backToModeSelection() {
    document.getElementById('turn-selection').classList.add('hidden');
    document.getElementById('mode-selection').classList.remove('hidden');
}

function startGame(mode, playerColor = null) {
    gameMode = mode;
    this.playerColor = playerColor;

    // 画面を隠す
    document.getElementById('mode-selection').classList.add('hidden');
    document.getElementById('turn-selection').classList.add('hidden');
    // ゲーム画面を表示
    document.getElementById('game-container').classList.remove('hidden');

    // モードに応じてコントロールを表示/非表示
    const passBtn = document.getElementById('pass-btn');
    passBtn.style.display = 'none'; // 自動パス機能があるので常に非表示

    // ボード作成
    UIManager.createBoard();

    // ゲーム初期化
    game = new OthelloGame(mode, playerColor);

    // ゲームクラスのメソッドをUIマネージャーに接続
    game.updateDisplay = () => UIManager.updateDisplay(game);
    game.showMessage = UIManager.showMessage;

    // 初期表示更新はコンストラクタで行う

    // 初期ターン処理
    if (mode === 'single') {
        game.handleSinglePlayerTurn();
    } else {
        game.handleDoublePlayerTurn();
    }
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
        playerColor = null;
    }
}
