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
                cell.classList.add('available');
            }
        });
    }

    static updateScores(game) {
        document.getElementById('black-score').textContent = game.scores.black;
        document.getElementById('white-score').textContent = game.scores.white;
    }

    static updateCurrentPlayer(game) {
        const currentPlayerPiece = document.getElementById('current-player-piece');
        if (game.currentPlayer === 'black') {
            currentPlayerPiece.className = 'current-player-piece black';
        } else {
            currentPlayerPiece.className = 'current-player-piece white';
        }
    }

    static showMessage(message, isGameEnd = false) {
        // 空文字列の場合は何もしない
        if (!message || message.trim() === '') {
            return;
        }

        const popup = document.getElementById('popup-message');
        const popupText = document.getElementById('popup-text');

        popupText.textContent = message;

        if (isGameEnd) {
            // ゲーム終了メッセージは特別に処理
            popup.classList.add('show', 'game-end');
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

        } else {
            // 通常メッセージは2秒で消す
            popup.classList.add('show');
            setTimeout(() => {
                popup.classList.remove('show');
            }, 2000);
        }
    }

    static createBoard() {
        const board = document.querySelector('.board');
        for (let i = 0; i < 64; i++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            board.appendChild(cell);
        }
    }
}
