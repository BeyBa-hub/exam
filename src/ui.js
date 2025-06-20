// src/ui.js
export class UIController {
    constructor() {
        this.executionTimeElement = document.getElementById('execution-time');
        this.comparisonsElement = document.getElementById('comparisons'); // Новий елемент
        this.swapsElement = document.getElementById('swaps');           // Новий елемент
        this.uiMessageElement = document.getElementById('ui-message');
        this.arModeButton = document.getElementById('ar-mode-button');
        this.freeModeButton = document.getElementById('free-mode-button');
        this.startSortButton = document.getElementById('start-sort-button');
        this.resetButton = document.getElementById('reset-button');
        this.algorithmSelect = document.getElementById('algorithm-select');
        this.animationSpeedInput = document.getElementById('animation-speed'); // Новий елемент
        this.speedValueSpan = document.getElementById('speed-value');          // Новий елемент

        this.voiceStatusText = document.getElementById('voice-status-text');
        this.micIndicator = document.getElementById('mic-indicator');
        this.toggleVoiceButton = document.getElementById('toggle-voice-button');

        // Приховуємо панель метрик за замовчуванням (або показуємо, як вам потрібно)
        this.metricsDisplay = document.querySelector('.metrics-display');
        this.initEventListeners();
        this.showMessage("Завантаження...");
        this.setSpeedValue(this.animationSpeedInput.value); // Встановлюємо початкове значення швидкості
    }

    initEventListeners() {
        this.arModeButton.addEventListener('click', () => {
            if (this.modeChangeCallback) this.modeChangeCallback('ar');
        });
        this.freeModeButton.addEventListener('click', () => {
            if (this.modeChangeCallback) this.modeChangeCallback('free');
        });
        this.startSortButton.addEventListener('click', () => {
            if (this.startSortCallback) this.startSortCallback();
        });
        this.resetButton.addEventListener('click', () => {
            if (this.resetCallback) this.resetCallback();
        });
        
        this.algorithmSelect.addEventListener('change', () => {
            if (this.algorithmSelectCallback) {
                this.algorithmSelectCallback(this.algorithmSelect.value);
            }
        });

        // Обробник для зміни швидкості анімації
        this.animationSpeedInput.addEventListener('input', () => {
            if (this.animationSpeedChangeCallback) {
                this.animationSpeedChangeCallback(this.animationSpeedInput.value);
            }
        });
    }

    onModeChange(callback) {
        this.modeChangeCallback = callback;
    }

    onStartSort(callback) {
        this.startSortCallback = callback;
    }

    onReset(callback) {
        this.resetCallback = callback;
    }

    onAlgorithmSelectChange(callback) {
        this.algorithmSelectCallback = callback;
    }

    // Новий метод для реєстрації колбека при зміні швидкості анімації
    onAnimationSpeedChange(callback) {
        this.animationSpeedChangeCallback = callback;
    }

    // Оновлений метод для оновлення метрик (додано порівняння та обміни)
    updateMetrics(time, comparisons, swaps) {
        this.executionTimeElement.textContent = time.toFixed(2);
        this.comparisonsElement.textContent = comparisons;
        this.swapsElement.textContent = swaps;
    }

    showMessage(message) {
        this.uiMessageElement.textContent = message;
    }

    // Встановлює значення швидкості в UI
    setSpeedValue(speed) {
        this.speedValueSpan.textContent = `${parseFloat(speed).toFixed(1)}x`;
    }

        updateVoiceStatus(isListening, statusText, isError = false) {
        this.voiceStatusText.textContent = `Голос: ${statusText}`;
        this.micIndicator.classList.remove('listening', 'error');
        if (isListening) {
            this.micIndicator.classList.add('listening');
        } else if (isError) {
            this.micIndicator.classList.add('error');
        }
    }

    // Новий метод для перемикання видимості метрик (для голосової команди)
    toggleMetrics(show) {
        if (this.metricsDisplay) {
            this.metricsDisplay.style.display = show ? 'block' : 'none'; // Або 'flex' якщо це блок
        }
    }

    // Цей метод більше не потрібен, оскільки кнопки замінені на select
    // toggleAlgorithmButtons(show) { }
}
