let display = document.getElementById('display');
let memoryIndicator = document.getElementById('memoryIndicator');
let currentInput = '';
let operator = '';
let previousInput = '';
let memory = 0; // メモリ変数

function appendToDisplay(value) {
    // 括弧や演算子の表示用変換
    const displayValue = value === '*' ? '×' : value === '/' ? '÷' : value;
    
    if (['+', '-', '*', '/', '(', ')'].includes(value)) {
        // 演算子や括弧の場合
        if (display.value === '' && value === '-') {
            // 負の数の場合
            display.value = '-';
        } else if (display.value === '' && value === '(') {
            // 先頭のカッコも許可
            display.value = '(';
        } else if (display.value !== '') {
            display.value += displayValue;
        }
    } else {
        // 数字や小数点の場合
        display.value += value;
    }
    
    // 入力を保存（計算用）
    currentInput = display.value;
}

function calculate() {
    try {
        if (display.value === '') return;
        
        // 表示用記号を計算用記号に変換
        let expression = display.value
            .replace(/×/g, '*')
            .replace(/÷/g, '/');
        
        // 括弧の対応チェック
        const openCount = (expression.match(/\(/g) || []).length;
        const closeCount = (expression.match(/\)/g) || []).length;
        
        if (openCount !== closeCount) {
            alert('括弧が正しく対応していません');
            return;
        }
        
        // 安全な計算のため、evalの代わりにFunction constructorを使用
        const result = Function('"use strict"; return (' + expression + ')')();
        
        if (!isFinite(result)) {
            alert('計算エラー: 結果が無限大または非数値です');
            return;
        }
        
        display.value = result;
        currentInput = result.toString();
        operator = '';
        previousInput = '';
        
    } catch (error) {
        alert('計算エラー: 式が正しくありません');
        console.error('Calculation error:', error);
    }
}

function clearDisplay() {
    display.value = '';
    currentInput = '';
    operator = '';
    previousInput = '';
}

function deleteLast() {
    if (display.value.length > 0) {
        display.value = display.value.slice(0, -1);
        currentInput = display.value;
    }
}

// メモリ機能
function memoryStore() {
    const value = getCurrentDisplayValue();
    if (value !== null) {
        memory = value;
        updateMemoryIndicator();
    }
}

function memoryRecall() {
    if (memory !== 0) {
        clearCurrentInput();
        currentInput = memory.toString();
        display.value = currentInput;
    }
}

function memoryAdd() {
    const value = getCurrentDisplayValue();
    if (value !== null) {
        memory += value;
        updateMemoryIndicator();
    }
}

function memorySubtract() {
    const value = getCurrentDisplayValue();
    if (value !== null) {
        memory -= value;
        updateMemoryIndicator();
    }
}

function memoryClear() {
    memory = 0;
    updateMemoryIndicator();
}

function getCurrentDisplayValue() {
    let value;
    if (currentInput !== '') {
        value = parseFloat(currentInput);
    } else if (display.value !== '' && !isNaN(parseFloat(display.value))) {
        value = parseFloat(display.value);
    } else {
        return null;
    }
    return isNaN(value) ? null : value;
}

function clearCurrentInput() {
    currentInput = '';
    operator = '';
    previousInput = '';
}

function updateMemoryIndicator() {
    if (memory !== 0) {
        memoryIndicator.textContent = `📝 メモリ: ${memory}`;
        memoryIndicator.style.color = '#28a745';
    } else {
        memoryIndicator.textContent = '\u00A0'; // 非破壊スペースで高さを維持
        memoryIndicator.style.color = 'transparent';
    }
}

// キーボード入力対応
document.addEventListener('keydown', function(event) {
    const key = event.key;
    const ctrlKey = event.ctrlKey;
    
    if (key >= '0' && key <= '9' || key === '.') {
        appendToDisplay(key);
    } else if (['+', '-', '*', '/', '(', ')'].includes(key)) {
        appendToDisplay(key);
    } else if (key === 'Enter' || key === '=') {
        calculate();
    } else if (key === 'Escape') {
        clearDisplay();
    } else if (key === 'Backspace') {
        deleteLast();
    }
    // メモリ機能のキーボードショートカット
    else if (ctrlKey && key.toLowerCase() === 's') {
        event.preventDefault();
        memoryStore();
    } else if (ctrlKey && key.toLowerCase() === 'r') {
        event.preventDefault();
        memoryRecall();
    } else if (ctrlKey && key.toLowerCase() === 'l') {
        event.preventDefault();
        memoryClear();
    } else if (ctrlKey && key === '+') {
        event.preventDefault();
        memoryAdd();
    } else if (ctrlKey && key === '-') {
        event.preventDefault();
        memorySubtract();
    }
});

// 初期化：メモリ領域を確保
updateMemoryIndicator();
