// game.js - ゲームロジック
class OthelloGame {
    constructor(mode = 'two', playerColor = null) {
        this.mode = mode; // 'single' or 'two'
        this.playerColor = playerColor; // 'black' or 'white' (1人プレイ時のみ)
        this.board = Array(8).fill().map(() => Array(8).fill(null));
        this.currentPlayer = 'black';
        this.scores = { black: 2, white: 2 };

        this.initializeBoard();
        this.setupEventListeners();

        // 1人プレイでプレイヤーが後攻の場合、CPUが先攻
        if (this.mode === 'single' && this.playerColor === 'white') {
            this.currentPlayer = 'black'; // CPU(黒)が先攻
        }

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
            // 共通の石配置処理を使用
            this.processMove(row, col);
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
        } else {
            // パス後のターン処理
            if (this.mode === 'single') {
                this.handleSinglePlayerTurn();
            } else {
                this.handleDoublePlayerTurn();
            }
        }
    }

    resetGame() {
        this.board = Array(8).fill().map(() => Array(8).fill(null));
        this.currentPlayer = 'black';
        this.scores = { black: 2, white: 2 };
        this.initializeBoard();

        // 1人プレイでプレイヤーが後攻の場合、CPUが先攻
        if (this.mode === 'single' && this.playerColor === 'white') {
            this.currentPlayer = 'black'; // CPU(黒)が先攻
        }

        setTimeout(() => {
            this.updateDisplay();
            // リセット後のターン処理
            if (this.mode === 'single') {
                this.handleSinglePlayerTurn();
            } else {
                this.handleDoublePlayerTurn();
            }
        }, 0);
    }

    // CPUの手を打つ
    makeCPUMove() {
        // CPUのターンかどうかをチェック（プレイヤーの色と異なる色がCPU）
        const isCpuTurn = this.mode === 'single' && this.currentPlayer !== this.playerColor;
        
        if (!isCpuTurn) {
            return;
        }

        const validMoves = this.getValidMoves();
        if (validMoves.length === 0) {
            // CPUもパス
            setTimeout(() => this.showMessage('CPUがパスします。'), 0);
            setTimeout(() => {
                this.switchPlayer();
                this.updateDisplay();
                this.handleSinglePlayerTurn();
            }, 1000);
            return;
        }

        // 最も多くの石をひっくり返す手を選択（シンプルな戦略）
        let bestMove = null;
        let maxFlips = 0;

        for (const [row, col] of validMoves) {
            const flips = this.calculateFlips(row, col);
            if (flips > maxFlips) {
                maxFlips = flips;
                bestMove = [row, col];
            }
        }

        // ベストムーブがない場合はランダム
        if (!bestMove) {
            bestMove = validMoves[Math.floor(Math.random() * validMoves.length)];
        }

        const [row, col] = bestMove;
        setTimeout(() => {
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
                    this.handleSinglePlayerTurn();
                }, 1000);
            } else {
                this.handleSinglePlayerTurn();
            }
        }, 500);
    }

    // 有効な手のリストを取得
    getValidMoves() {
        const moves = [];
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (this.canPlaceStone(row, col)) {
                    moves.push([row, col]);
                }
            }
        }
        return moves;
    }

    // 石を置く共通処理
    processMove(row, col) {
        this.placeStone(row, col);
        this.flipStones(row, col);
        this.switchPlayer();
        this.updateDisplay();

        if (this.isGameOver()) {
            this.showGameResult();
        } else if (!this.hasValidMoves()) {
            // モードに応じた自動パス処理
            if (this.mode === 'two') {
                setTimeout(() => {
                    this.showMessage('置く場所が無いためパスします', false, true, () => {
                        this.switchPlayer();
                        this.updateDisplay();
                        this.handleDoublePlayerTurn();
                    });
                }, 500);
            } else {
                // 1人プレイの場合、自動でパス
                setTimeout(() => this.showMessage('パスします。相手のターンです。'), 0);
                setTimeout(() => {
                    this.switchPlayer();
                    this.updateDisplay();
                    this.handleSinglePlayerTurn();
                }, 1000);
            }
        } else {
            // 次のターン処理
            if (this.mode === 'single') {
                this.handleSinglePlayerTurn();
            } else {
                this.handleDoublePlayerTurn();
            }
        }
    }

    // 指定位置に置いた場合のひっくり返す石の数を計算
    calculateFlips(row, col) {
        let totalFlips = 0;
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1,  1]
        ];

        for (const [dRow, dCol] of directions) {
            totalFlips += this.getStonesToFlip(row, col, dRow, dCol).length;
        }
        return totalFlips;
    }

    // 1人プレイのターン処理
    handleSinglePlayerTurn() {
        if (this.isPlayerTurn()) {
            // 人間のターン: クリック有効
            this.enableBoardClicks();
        } else {
            // CPUのターン: 自動手番
            this.disableBoardClicks();
            setTimeout(() => this.makeCPUMove(), 1000);
        }
    }

    // 2人プレイのターン処理
    handleDoublePlayerTurn() {
        // 常に人間のターン: クリック有効
        this.enableBoardClicks();
    }

    // プレイヤーのターンかどうかを判定
    isPlayerTurn() {
        return this.currentPlayer === this.playerColor;
    }

    // CPUのターンかどうかを判定
    isCpuTurn() {
        return this.mode === 'single' && !this.isPlayerTurn();
    }

    // ボードクリックを有効化
    enableBoardClicks() {
        document.querySelectorAll('.cell').forEach(cell => {
            cell.style.pointerEvents = 'auto';
        });
    }

    // ボードクリックを無効化
    disableBoardClicks() {
        document.querySelectorAll('.cell').forEach(cell => {
            cell.style.pointerEvents = 'none';
        });
    }
}
