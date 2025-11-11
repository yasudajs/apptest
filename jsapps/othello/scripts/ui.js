// ui.js - UI更新機能
class UIManager {
    static updateDisplay(game) {
        this.updateBoard(game);
        this.updateScores(game);
        this.updateCurrentPlayer(game);
    }

    static updateBoard(game) {
        const cells = document.querySelectorAll('.cell');
        cells.forEach((cell, index) => {
            const row = Math.floor(index / 8);
            const col = index % 8;
            const stone = game.board[row][col];

            cell.innerHTML = '';
            cell.className = 'cell';

            if (stone) {
                const stoneElement = document.createElement('div');
                stoneElement.className = `stone ${stone}`;
                cell.appendChild(stoneElement);
            } else if (game.canPlaceStone(row, col)) {
                // 1人プレイの場合、CPUのターン時はハイライトしない
                if (game.mode === 'single' && game.currentPlayer !== game.playerColor) {
                    // CPUのターン: ハイライトなし
                } else {
                    cell.classList.add('available');
                }
            }
        });
    }

    static updateScores(game) {
        document.getElementById('black-score').textContent = game.scores.black;
        document.getElementById('white-score').textContent = game.scores.white;
    }

    static updateCurrentPlayer(game) {
        const currentPlayerDiv = document.getElementById('current-player');
        const currentPlayerPiece = document.getElementById('current-player-piece');

        if (game.mode === 'single') {
            if (game.currentPlayer === game.playerColor) {
                currentPlayerDiv.innerHTML = '現在のターン: <span class="current-player-piece ' + game.currentPlayer + '" id="current-player-piece"></span> (あなた)';
            } else {
                currentPlayerDiv.innerHTML = '現在のターン: <span class="current-player-piece ' + game.currentPlayer + '" id="current-player-piece"></span> (CPU)';
            }
        } else {
            // 2人プレイ
            if (game.currentPlayer === 'black') {
                currentPlayerDiv.innerHTML = '現在のプレイヤー: <span class="current-player-piece black" id="current-player-piece"></span>';
            } else {
                currentPlayerDiv.innerHTML = '現在のプレイヤー: <span class="current-player-piece white" id="current-player-piece"></span>';
            }
        }
    }

    static showMessage(message, isGameEnd = false, showOkButton = false, onOkCallback = null) {
        // 空文字列の場合は何もしない
        if (!message || message.trim() === '') {
            return;
        }

        const popup = document.getElementById('popup-message');
        const popupText = document.getElementById('popup-text');
        const okBtn = document.getElementById('popup-ok-btn');

        popupText.textContent = message;

        if (isGameEnd) {
            // ゲーム終了メッセージは特別に処理
            popup.classList.add('show', 'game-end');
            okBtn.classList.add('hidden');
            // 10秒後に自動消去するか、ユーザーがクリックするまで表示
            const autoHide = setTimeout(() => {
                if (popup.classList.contains('show')) {
                    popup.classList.remove('show', 'game-end');
                }
            }, 10000);

            // ポップアップをクリックしたらすぐに消す
            const clickHandler = () => {
                clearTimeout(autoHide);
                popup.classList.remove('show', 'game-end');
                popup.removeEventListener('click', clickHandler);
            };
            popup.addEventListener('click', clickHandler);

        } else if (showOkButton) {
            // OKボタン付きメッセージ
            popup.classList.add('show');
            okBtn.classList.remove('hidden');

            // OKボタンのクリックイベント
            const okHandler = () => {
                popup.classList.remove('show');
                okBtn.classList.add('hidden');
                okBtn.removeEventListener('click', okHandler);
                if (onOkCallback) {
                    onOkCallback();
                }
            };
            okBtn.addEventListener('click', okHandler);

        } else {
            // 通常メッセージは2秒で消す
            popup.classList.add('show');
            okBtn.classList.add('hidden');
            setTimeout(() => {
                popup.classList.remove('show');
            }, 2000);
        }
    }

    static createBoard() {
        const board = document.querySelector('.board');
        // 既存のセルをすべて削除
        board.innerHTML = '';
        for (let i = 0; i < 64; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            board.appendChild(cell);
        }
    }
}
