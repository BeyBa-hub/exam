// src/algorithms/selectionSort.js
import { delay } from './delay.js';

export const selectionSort = async (arr, { onSwap, onHighlight, onComparison, onSwapCount, animationSpeed }) => {
    const n = arr.length;
    for (let i = 0; i < n - 1; i++) {
        let minIdx = i;
        await onHighlight([minIdx], animationSpeed); // Підсвічуємо поточний мінімальний

        for (let j = i + 1; j < n; j++) {
            onComparison(); // Збільшуємо лічильник порівнянь
            await onHighlight([minIdx, j], animationSpeed); // Підсвічуємо порівнювані елементи

            if (arr[j] < arr[minIdx]) {
                minIdx = j;
                await onHighlight([minIdx], animationSpeed); // Підсвічуємо новий мінімальний
            }
            await delay(100, animationSpeed); // Невеликий delay між порівняннями
        }
        
        if (minIdx !== i) {
            [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]]; // Обмін значень
            await onSwap(i, minIdx, animationSpeed); // Анімуємо обмін
            onSwapCount(); // Збільшуємо лічильник обмінів
        }
    }
};