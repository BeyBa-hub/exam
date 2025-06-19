// src/algorithms/insertionSort.js
import { delay } from './delay.js';

export const insertionSort = async (arr, { onSwap, onHighlight, onComparison, onSwapCount, animationSpeed }) => {
    const n = arr.length;
    for (let i = 1; i < n; i++) {
        let key = arr[i];
        let j = i - 1;
        
        await onHighlight([i], animationSpeed); // Підсвічуємо елемент, який вставляємо

        while (j >= 0 && arr[j] > key) {
            onComparison(); // Збільшуємо лічильник порівнянь
            await onHighlight([j, j + 1], animationSpeed); // Підсвічуємо елементи, що зсуваються

            // Тут ми виконуємо віртуальний "зсув" і анімуємо його як обмін
            // У реальному insertion sort це не обмін, а переміщення
            // Для візуалізації через onSwap:
            [arr[j + 1], arr[j]] = [arr[j], arr[j + 1]]; // Обмін значень у масиві
            await onSwap(j, j + 1, animationSpeed); // Анімуємо "зсув" як обмін
            onSwapCount(); // Збільшуємо лічильник обмінів
            
            j--;
            await delay(100, animationSpeed); // Затримка між кроками зсуву
        }
        // arr[j + 1] = key; // Цей рядок не потрібен, оскільки значення вже "перемістилися" обмінами
    }
};