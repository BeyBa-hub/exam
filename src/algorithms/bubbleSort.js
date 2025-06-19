// src/algorithms/bubbleSort.js
import { delay } from './delay.js';

export const bubbleSort = async (arr, { onSwap, onHighlight, onComparison, onSwapCount, animationSpeed }) => {
    const n = arr.length;
    let swapped;
    
    for (let i = 0; i < n - 1; i++) {
        swapped = false;
        for (let j = 0; j < n - i - 1; j++) {
            onComparison(); // Збільшуємо лічильник порівнянь

            await onHighlight([j, j + 1], animationSpeed); // Підсвічуємо картки для порівняння

            if (arr[j] > arr[j + 1]) {
                // Обмін значень у внутрішньому масиві
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                
                await onSwap(j, j + 1, animationSpeed); // Анімуємо обмін у 3D сцені
                onSwapCount(); // Збільшуємо лічильник обмінів
                swapped = true;
            }
        }
        if (!swapped) break; // Якщо не було обмінів у внутрішньому циклі, масив вже відсортований
    }
};