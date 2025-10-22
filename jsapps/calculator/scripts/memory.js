// memory.js
import { state } from './state.js';
import { getCurrentDisplayValue, clearCurrentInput } from './calculator.js';

export function memoryStore() {
    const value = getCurrentDisplayValue();
    if (value !== null) {
        state.memory = value;
        updateMemoryIndicator();
    }
}

export function memoryRecall() {
    if (state.memory !== 0) {
        clearCurrentInput();
        state.currentInput = state.memory.toString();
        state.display.value = state.currentInput;
    }
}

export function memoryAdd() {
    const value = getCurrentDisplayValue();
    if (value !== null) {
        state.memory += value;
        updateMemoryIndicator();
    }
}

export function memorySubtract() {
    const value = getCurrentDisplayValue();
    if (value !== null) {
        state.memory -= value;
        updateMemoryIndicator();
    }
}

export function memoryClear() {
    state.memory = 0;
    updateMemoryIndicator();
}

export function updateMemoryIndicator() {
    if (state.memory !== 0) {
        state.memoryIndicator.textContent = `📝 メモリ: ${state.memory}`;
        state.memoryIndicator.style.color = '#28a745';
    } else {
        state.memoryIndicator.textContent = '\u00A0';
        state.memoryIndicator.style.color = 'transparent';
    }
}
