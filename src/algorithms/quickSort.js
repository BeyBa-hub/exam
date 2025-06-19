// src/algorithms/quickSort.js
import { delay } from './delay.js';

const partition = async (arr, low, high, { onSwap, onHighlight, onComparison, onSwapCount, animationSpeed }) => {
    const pivot = arr[high];
    let i = low - 1;

    await onHighlight([high], animationSpeed); // Підсвічуємо pivot

    for (let j = low; j < high; j++) {
        onComparison(); // Збільшуємо лічильник порівнянь
        await onHighlight([j, high], animationSpeed); // Підсвічуємо поточний елемент та pivot

        if (arr[j] < pivot) {
            i++;
            if (i !== j) { // Уникаємо обміну елемента сам з собою
                [arr[i], arr[j]] = [arr[j], arr[i]]; // Обмін значень
                await onSwap(i, j, animationSpeed); // Анімуємо обмін
                onSwapCount(); // Збільшуємо лічильник обмінів
            }
        }
    }

    if (i + 1 !== high) { // Уникаємо обміну pivot'а сам з собою
        [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]]; // Обмін pivot'а
        await onSwap(i + 1, high, animationSpeed); // Анімуємо обмін pivot'а
        onSwapCount(); // Збільшуємо лічильник обмінів
    }

    return i + 1;
};

const quickSortRecursive = async (arr, low, high, callbacks) => {
    if (low < high) {
        const pi = await partition(arr, low, high, callbacks);
        await quickSortRecursive(arr, low, pi - 1, callbacks);
        await quickSortRecursive(arr, pi + 1, high, callbacks);
    }
};

export const quickSort = async (arr, callbacks) => {
    await quickSortRecursive(arr, 0, arr.length - 1, callbacks);
};