// src/algorithms/delay.js
export const delay = (ms, animationSpeed) => {
    return new Promise(resolve => setTimeout(resolve, ms / animationSpeed));
};