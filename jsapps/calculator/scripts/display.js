// display.js
import { state } from './state.js';

export function appendToDisplay(value) {
    const displayValue = value === '*' ? '×' : value === '/' ? '÷' : value;
    if (["+", "-", "*", "/", "(", ")"].includes(value)) {
        if (state.display.value === '' && value === '-') {
            state.display.value = '-';
        } else if (state.display.value === '' && value === '(') {
            state.display.value = '(';
        } else if (state.display.value !== '') {
            state.display.value += displayValue;
        }
    } else {
        state.display.value += value;
    }
    state.currentInput = state.display.value;
}

export function clearDisplay() {
    state.display.value = '';
    state.currentInput = '';
    state.operator = '';
    state.previousInput = '';
}

export function deleteLast() {
    if (state.display.value.length > 0) {
        state.display.value = state.display.value.slice(0, -1);
        state.currentInput = state.display.value;
    }
}
