// init.js
import { state } from './state.js';
import { updateMemoryIndicator } from './memory.js';
import { setupKeyboard } from './keyboard.js';
import { appendToDisplay, clearDisplay, deleteLast } from './display.js';
import { calculate } from './calculator.js';
import { memoryStore, memoryRecall, memoryAdd, memorySubtract, memoryClear } from './memory.js';

// DOM要素のセット
window.addEventListener('DOMContentLoaded', () => {
    state.display = document.getElementById('display');
    state.memoryIndicator = document.getElementById('memoryIndicator');
    updateMemoryIndicator();
    setupKeyboard();

    // メモリボタン
    const memoryButtons = document.querySelectorAll('.memory-buttons .memory');
    if (memoryButtons.length === 5) {
        memoryButtons[0].addEventListener('click', memoryStore);   // MS
        memoryButtons[1].addEventListener('click', memoryRecall);  // MR
        memoryButtons[2].addEventListener('click', memoryAdd);     // M+
        memoryButtons[3].addEventListener('click', memorySubtract);// M-
        memoryButtons[4].addEventListener('click', memoryClear);   // MC
    }

    // 数字・演算子・その他ボタン
    const buttonMap = [
        // 1行目
        { selector: '.clear', index: 0, handler: clearDisplay },
        { selector: '.parenthesis', index: 0, handler: () => appendToDisplay('(') },
        { selector: '.parenthesis', index: 1, handler: () => appendToDisplay(')') },
        { selector: '.clear', index: 1, handler: deleteLast },
        // 2行目
        { selector: '.number', index: 0, handler: () => appendToDisplay('7') },
        { selector: '.number', index: 1, handler: () => appendToDisplay('8') },
        { selector: '.number', index: 2, handler: () => appendToDisplay('9') },
        { selector: '.operator', index: 0, handler: () => appendToDisplay('/') },
        // 3行目
        { selector: '.number', index: 3, handler: () => appendToDisplay('4') },
        { selector: '.number', index: 4, handler: () => appendToDisplay('5') },
        { selector: '.number', index: 5, handler: () => appendToDisplay('6') },
        { selector: '.operator', index: 1, handler: () => appendToDisplay('*') },
        // 4行目
        { selector: '.number', index: 6, handler: () => appendToDisplay('1') },
        { selector: '.number', index: 7, handler: () => appendToDisplay('2') },
        { selector: '.number', index: 8, handler: () => appendToDisplay('3') },
        { selector: '.operator', index: 2, handler: () => appendToDisplay('-') },
        // 5行目
        { selector: '.number', index: 9, handler: () => appendToDisplay('0') },
        { selector: '.decimal', index: 0, handler: () => appendToDisplay('.') },
        { selector: '.equals', index: 0, handler: calculate },
        { selector: '.operator', index: 3, handler: () => appendToDisplay('+') },
    ];
    buttonMap.forEach(({ selector, index, handler }) => {
        const btns = document.querySelectorAll(selector);
        if (btns && btns[index]) {
            btns[index].addEventListener('click', handler);
        }
    });
});
