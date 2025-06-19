// src/algorithms/mergeSort.js
import { delay } from './delay.js';

const merge = async (arr, l, m, r, { onComparison, animationSpeed }) => {
    const n1 = m - l + 1;
    const n2 = r - m;

    const L = new Array(n1);
    const R = new Array(n2);

    for (let i = 0; i < n1; i++) L[i] = arr[l + i];
    for (let j = 0; j < n2; j++) R[j] = arr[m + 1 + j];

    let i = 0;
    let j = 0;
    let k = l;

    while (i < n1 && j < n2) {
        onComparison(); // Порівняння під час злиття
        // highlightCards([l + i, m + 1 + j], animationSpeed); // Можна підсвічувати елементи, що порівнюються
        await delay(50, animationSpeed); // Невеликий delay

        if (L[i] <= R[j]) {
            arr[k] = L[i];
            i++;
        } else {
            arr[k] = R[j];
            j++;
        }
        k++;
    }

    while (i < n1) {
        arr[k] = L[i];
        i++;
        k++;
    }

    while (j < n2) {
        arr[k] = R[j];
        j++;
        k++;
    }
    // Оскільки mergeSort не робить обмінів, onSwap тут не викликається.
    // Візуалізація оновиться після завершення в main.js через resetCards().
};

const mergeSortRecursive = async (arr, l, r, callbacks) => {
    if (l >= r) {
        return;
    }
    const m = l + Math.floor((r - l) / 2);
    await mergeSortRecursive(arr, l, m, callbacks);
    await mergeSortRecursive(arr, m + 1, r, callbacks);
    await merge(arr, l, m, r, callbacks);
};

export const mergeSort = async (arr, callbacks) => {
    await mergeSortRecursive(arr, 0, arr.length - 1, callbacks);
};