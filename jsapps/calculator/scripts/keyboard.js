// keyboard.js
import { appendToDisplay, clearDisplay, deleteLast } from './display.js';
import { calculate } from './calculator.js';
import { memoryStore, memoryRecall, memoryAdd, memorySubtract, memoryClear } from './memory.js';

export function setupKeyboard() {
    document.addEventListener('keydown', function(event) {
        const key = event.key;
        const ctrlKey = event.ctrlKey;
        if ((key >= '0' && key <= '9') || key === '.') {
            appendToDisplay(key);
        } else if (["+", "-", "*", "/", "(", ")"].includes(key)) {
            appendToDisplay(key);
        } else if (key === 'Enter' || key === '=') {
            calculate();
        } else if (key === 'Escape') {
            clearDisplay();
        } else if (key === 'Backspace') {
            deleteLast();
        } else if (ctrlKey && key.toLowerCase() === 's') {
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
}
