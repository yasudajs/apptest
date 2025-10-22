// game.js - ゲームロジック
class OthelloGame {
    constructor() {
        this.board = Array(8).fill().map(() => Array(8).fill(null));
        this.currentPlayer = 'black';
        this.scores = { black: 2, white: 2 };

        this.initializeBoard();
        this.setupEventListeners();

        // updateDisplayとshowMessageはscript.jsで割り当てられた後に呼び出す
        setTimeout(() => {
            this.updateDisplay();
        }, 0);
    }

    initializeBoard() {
        this.board[3][3] = 'white';
        this.board[3][4] = 'black';
        this.board[4][3] = 'black';
        this.board[4][4] = 'white';
    }

    setupEventListeners() {
        document.querySelectorAll('.cell').forEach((cell, index) => {
            cell.addEventListener('click', () => {
                const row = Math.floor(index / 8);
                const col = index % 8;
                this.handleCellClick(row, col);
            });
        });

        document.getElementById('reset-btn').addEventListener('click', () => {
            this.resetGame();
        });

        document.getElementById('pass-btn').addEventListener('click', () => {
            this.passTurn();
        });
    }

    handleCellClick(row, col) {
        if (this.board[row][col] !== null) {
            setTimeout(() => this.showMessage('そこは既に石があります。'), 0);
            return;
        }

        if (this.canPlaceStone(row, col)) {
            this.placeStone(row, col);
            this.flipStones(row, col);
            this.switchPlayer();
            this.updateDisplay();

            if (this.isGameOver()) {
                this.showGameResult();
            } else if (!this.hasValidMoves()) {
                setTimeout(() => this.showMessage('パスします。相手のターンです。'), 0);
                setTimeout(() => {
                    this.switchPlayer();
                    this.updateDisplay();
                }, 1000);
            }
        } else {
            setTimeout(() => this.showMessage('そこは置けません。'), 0);
        }
    }

    canPlaceStone(row, col) {
        if (this.board[row][col] !== null) return false;

        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];

        for (const [dRow, dCol] of directions) {
            if (this.wouldFlipStones(row, col, dRow, dCol)) {
                return true;
            }
        }
        return false;
    }

    wouldFlipStones(row, col, dRow, dCol) {
        let r = row + dRow;
        let c = col + dCol;
        let foundOpponent = false;

        while (r >= 0 && r < 8 && c >= 0 && c < 8) {
            if (this.board[r][c] === null) return false;
            if (this.board[r][c] === this.currentPlayer) {
                return foundOpponent;
            }
            foundOpponent = true;
            r += dRow;
            c += dCol;
        }
        return false;
    }

    placeStone(row, col) {
        this.board[row][col] = this.currentPlayer;
        this.scores[this.currentPlayer]++;
    }

    flipStones(row, col) {
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];

        for (const [dRow, dCol] of directions) {
            const stonesToFlip = this.getStonesToFlip(row, col, dRow, dCol);
            stonesToFlip.forEach(([r, c]) => {
                this.board[r][c] = this.currentPlayer;
                this.scores[this.currentPlayer]++;
                this.scores[this.currentPlayer === 'black' ? 'white' : 'black']--;
            });
        }
    }

    getStonesToFlip(row, col, dRow, dCol) {
        const stonesToFlip = [];
        let r = row + dRow;
        let c = col + dCol;

        while (r >= 0 && r < 8 && c >= 0 && c < 8) {
            if (this.board[r][c] === null) return [];
            if (this.board[r][c] === this.currentPlayer) {
                return stonesToFlip;
            }
            stonesToFlip.push([r, c]);
            r += dRow;
            c += dCol;
        }
        return [];
    }

    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 'black' ? 'white' : 'black';
    }

    hasValidMoves() {
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (this.canPlaceStone(row, col)) {
                    return true;
                }
            }
        }
        return false;
    }

    isGameOver() {
        return !this.hasValidMoves() && !this.hasOpponentValidMoves();
    }

    hasOpponentValidMoves() {
        const originalPlayer = this.currentPlayer;
        this.currentPlayer = this.currentPlayer === 'black' ? 'white' : 'black';
        const hasMoves = this.hasValidMoves();
        this.currentPlayer = originalPlayer;
        return hasMoves;
    }

    showGameResult() {
        let message;
        if (this.scores.black > this.scores.white) {
            message = `🎉 ゲーム終了！ 黒の勝利！\n\n黒: ${this.scores.black} - 白: ${this.scores.white}`;
        } else if (this.scores.white > this.scores.black) {
            message = `🎉 ゲーム終了！ 白の勝利！\n\n黒: ${this.scores.black} - 白: ${this.scores.white}`;
        } else {
            message = `🤝 ゲーム終了！ 引き分け！\n\n黒: ${this.scores.black} - 白: ${this.scores.white}`;
        }
        setTimeout(() => this.showMessage(message, true), 0);
    }

    passTurn() {
        if (this.hasValidMoves()) {
            setTimeout(() => this.showMessage('パスできません。石を置いてください。'), 0);
            return;
        }

        this.switchPlayer();
        this.updateDisplay();

        if (this.isGameOver()) {
            this.showGameResult();
        }
    }

    resetGame() {
        this.board = Array(8).fill().map(() => Array(8).fill(null));
        this.currentPlayer = 'black';
        this.scores = { black: 2, white: 2 };
        this.initializeBoard();

        setTimeout(() => {
            this.updateDisplay();
            // リセット時はメッセージを表示しない
        }, 0);
    }

    // UI更新メソッド（script.jsでUIManagerに置き換えられる）
    updateDisplay() {
        // デフォルト実装（script.jsで上書きされる）
        console.log('updateDisplay called');
    }

    // メッセージ表示メソッド（script.jsでUIManagerに置き換えられる）
    showMessage(message) {
        // デフォルト実装（script.jsで上書きされる）
        console.log('Message:', message);
    }
}
