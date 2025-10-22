// calculator.js
import { state } from './state.js';

export function getCurrentDisplayValue() {
    let value;
    if (state.currentInput !== '') {
        value = parseFloat(state.currentInput);
    } else if (state.display.value !== '' && !isNaN(parseFloat(state.display.value))) {
        value = parseFloat(state.display.value);
    } else {
        return null;
    }
    return isNaN(value) ? null : value;
}

export function calculate() {
    try {
        if (state.display.value === '') return;
        let expression = state.display.value
            .replace(/×/g, '*')
            .replace(/÷/g, '/');
        const openCount = (expression.match(/\(/g) || []).length;
        const closeCount = (expression.match(/\)/g) || []).length;
        if (openCount !== closeCount) {
            alert('括弧が正しく対応していません');
            return;
        }
        const result = Function('"use strict"; return (' + expression + ')')();
        if (!isFinite(result)) {
            alert('計算エラー: 結果が無限大または非数値です');
            return;
        }
        state.display.value = result;
        state.currentInput = result.toString();
        state.operator = '';
        state.previousInput = '';
    } catch (error) {
        alert('計算エラー: 式が正しくありません');
        console.error('Calculation error:', error);
    }
}

export function clearCurrentInput() {
    state.currentInput = '';
    state.operator = '';
    state.previousInput = '';
}
