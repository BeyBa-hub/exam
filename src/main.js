// src/main.js

import * as THREE from 'three';
import { MindARThree } from 'mindar';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { SortingScene } from './scene.js';
import { UIController } from './ui.js';
import * as TWEEN from 'tween';

// Імпортуємо всі алгоритми
import { bubbleSort } from './algorithms/bubbleSort.js';
import { quickSort } from './algorithms/quickSort.js';
import { selectionSort } from './algorithms/selectionSort.js';
import { insertionSort } from './algorithms/insertionSort.js';
import { mergeSort } from './algorithms/mergeSort.js';

const algorithms = {
    bubbleSort: bubbleSort,
    quickSort: quickSort,
    selectionSort: selectionSort,
    insertionSort: insertionSort,
    mergeSort: mergeSort,
};

// *** ОНОВЛЕНИЙ ОБ'ЄКТ algorithmDescriptions ***
const algorithmDescriptions = {
    bubbleSort: {
        name: "Бульбашкове сортування",
        year: "1956 (перша згадка)",
        author: "Невідомий (перша згадка Кеннета Айверсона)",
        complexityBest: "$O(n)$",
        complexityAvg: "$O(n^2)$",
        complexityWorst: "$O(n^2)$",
        description: "Простий алгоритм, який багаторазово проходить по списку, порівнює сусідні елементи та міняє їх місцями, якщо вони розташовані в неправильному порядку. Повільний для великих списків."
    },
    quickSort: {
        name: "Швидке сортування",
        year: "1959",
        author: "Чарльз Ентоні Річард Хор (Tony Hoare)",
        complexityBest: "$O(n \\log n)$",
        complexityAvg: "$O(n \\log n)$",
        complexityWorst: "$O(n^2)$",
        description: "Ефективний алгоритм, що використовує стратегію 'розділяй і володарюй'. Вибирає 'опорний' елемент і розділяє інші елементи на дві підмножини: менші та більші за опорний. Потім рекурсивно застосовується до підмножин."
    },
    selectionSort: {
        name: "Сортування вибором",
        year: "1940-ті",
        author: "Невідомий (перші обчислювальні машини)",
        complexityBest: "$O(n^2)$",
        complexityAvg: "$O(n^2)$",
        complexityWorst: "$O(n^2)$",
        description: "Алгоритм, який розділяє список на відсортовану та невідсортовану частини. Він повторно знаходить найменший елемент з невідсортованої частини та переміщує його до відсортованої."
    },
    insertionSort: {
        name: "Сортування вставками",
        year: "1945",
        author: "Джон фон Нейман (для перших обчислювальних машин)",
        complexityBest: "$O(n)$",
        complexityAvg: "$O(n^2)$",
        complexityWorst: "$O(n^2)$",
        description: "Алгоритм, який будує фінальний відсортований масив (або список) по одному елементу за раз. Він бере елементи з вхідних даних і вставляє їх у правильну позицію в уже відсортованій частині."
    },
    mergeSort: {
        name: "Сортування злиттям",
        year: "1945",
        author: "Джон фон Нейман",
        complexityBest: "$O(n \\log n)$",
        complexityAvg: "$O(n \\log n)$",
        complexityWorst: "$O(n \\log n)$",
        description: "Ефективний, заснований на порівнянні алгоритм сортування, який використовує стратегію 'розділяй і володарюй'. Він розділяє список навпіл, рекурсивно сортує кожну половину, а потім зливає (об'єднує) відсортовані половини."
    },
};

let stats = {
    comparisons: 0,
    swaps: 0
};
let animationSpeed = 1;

// === ГЛОБАЛЬНІ ЗМІННІ ДЛЯ ГОЛОСОВОГО УПРАВЛІННЯ ===
let recognition = null;
let isListening = false;
let speechRecognitionAttempts = 0;
const MAX_SPEECH_RECOGNITION_ATTEMPTS = 5;

// Змінні для 3D-тексту на другому маркері
let infoTextPlane = null;
let infoTextTexture = null;

// Функція для створення або оновлення тексту на 3D-площині
const updateInfoText = (algorithmName) => {
    const info = algorithmDescriptions[algorithmName];
    if (!info) return;

    const textCanvas = document.createElement('canvas');
    const context = textCanvas.getContext('2d');
    textCanvas.width = 1024;
    textCanvas.height = 512; // Зменшимо висоту, оскільки опису не буде

    context.clearRect(0, 0, textCanvas.width, textCanvas.height);
    context.fillStyle = 'white';
    context.textAlign = 'left'; // Вирівнювання тексту по лівому краю

    let yOffset = 100; // Початковий Y-зсув
    const lineHeight = 70; // Висота рядка

    context.font = 'Bold 60px Arial';
    context.fillText(info.name, 50, yOffset);
    yOffset += lineHeight * 1.5; // Більший відступ після назви

    context.font = '40px Arial';
    context.fillText(`Автор: ${info.author}`, 50, yOffset);
    yOffset += lineHeight;
    context.fillText(`Рік: ${info.year}`, 50, yOffset);
    yOffset += lineHeight;
    context.fillText(`Складність (найкращий): ${info.complexityBest}`, 50, yOffset);
    yOffset += lineHeight;
    context.fillText(`Складність (середній): ${info.complexityAvg}`, 50, yOffset);
    yOffset += lineHeight;
    context.fillText(`Складність (найгірший): ${info.complexityWorst}`, 50, yOffset);
    // *** Опис алгоритму більше не виводиться тут ***

    if (infoTextTexture) {
        infoTextTexture.dispose(); // Очищаємо стару текстуру
    }
    infoTextTexture = new THREE.CanvasTexture(textCanvas);
    if (infoTextPlane) {
        infoTextPlane.material.map = infoTextTexture;
        infoTextPlane.material.needsUpdate = true;
        // Оновлюємо розмір площини, якщо змінилася висота Canvas
        infoTextPlane.geometry.dispose(); // Вивільнити стару геометрію
        infoTextPlane.geometry = new THREE.PlaneGeometry(2.5, 2.5 * (textCanvas.height / textCanvas.width));
    }
};

document.addEventListener("DOMContentLoaded", async () => {
    let renderer, scene, camera;
    let mindarThree = null;
    let controls = null;
    let sortingScene = null;
    let currentMode = 'ar';
    const initialNumbers = [5, 2, 8, 1, 9, 4, 7, 3, 6];
    let currentNumbers = [...initialNumbers];

    const ui = new UIController();
    let selectedAlgorithm = ui.algorithmSelect.value; // Поточний вибраний алгоритм

    const updateStatsDisplay = () => {
        ui.updateMetrics(0, stats.comparisons, stats.swaps);
    };

    const onComparison = () => {
        stats.comparisons++;
        updateStatsDisplay();
    };

    const onSwapCount = () => {
        stats.swaps++;
        updateStatsDisplay();
    };

    const cleanupMindAR = () => {
        const videoElement = document.querySelector('video[srcobject]');
        if (videoElement && videoElement.srcObject) {
            videoElement.srcObject.getTracks().forEach(track => track.stop());
            videoElement.srcObject = null;
            videoElement.remove();
            console.log("Camera stream stopped and video element removed.");
        }

        const bodyChildren = Array.from(document.body.children);
        bodyChildren.forEach(child => {
            if (child.id !== 'ui-overlay') {
                document.body.removeChild(child);
            }
        });
        console.log("MindAR DOM elements (except UI overlay) cleaned up.");

        mindarThree = null;
    };

    const setUIElementsVisibility = (isVisible) => {
        const displayStyle = isVisible ? 'flex' : 'none';
        document.getElementById('top-ui-panel').style.display = displayStyle;
        document.getElementById('bottom-ui-panel').style.display = displayStyle;
        if (isListening) {
            ui.updateVoiceStatus(true, "Слухаю...", false);
        } else {
            ui.updateVoiceStatus(false, "Вимкнено", false);
        }
    };

    const isSorted = (arr) => {
        for (let i = 0; i < arr.length - 1; i++) {
            if (arr[i] > arr[i + 1]) {
                return false;
            }
        }
        return true;
    };

    const initAR = async () => {
        cleanupMindAR();

        mindarThree = new MindARThree({
            container: document.body,
            imageTargetSrc: "./src/markers/targets.mind", // ЦЕЙ ФАЙЛ МАЄ МІСТИТИ 2 МАРКЕРИ! (0 і 1)
            filterMinCF: 0.001,
            filterBeta: 0.001,
        });
        renderer = mindarThree.renderer;
        scene = mindarThree.scene;
        camera = mindarThree.camera;

        const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
        scene.add(light);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(0, 1, 1);
        scene.add(directionalLight);

        // --- Якір для основного маркеру сортування (Індекс 0) ---
        const sortingAnchor = mindarThree.addAnchor(0);
        sortingScene = new SortingScene(sortingAnchor.group, initialNumbers, true);

        sortingAnchor.onTargetFound = () => {
            console.log("Sorting marker (Index 0) found!");
            ui.showMessage("Основний маркер знайдено. Готово до сортування.");
            setUIElementsVisibility(true);
        };
        sortingAnchor.onTargetLost = () => {
            console.log("Sorting marker (Index 0) lost!");
            ui.showMessage("Основний маркер втрачено. Відстеження призупинено.");
            setUIElementsVisibility(false);
        };

        // --- Якір для інформаційного маркеру (Індекс 1) ---
        const infoAnchor = mindarThree.addAnchor(1);
        
        // Ініціалізуємо текстуру та площину при першому запуску
        updateInfoText(selectedAlgorithm); // Створюємо початкову текстуру
        const infoMaterial = new THREE.MeshBasicMaterial({ map: infoTextTexture, transparent: true, side: THREE.DoubleSide });
        infoTextPlane = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 2.5 * (infoTextTexture.image.height / infoTextTexture.image.width)), infoMaterial); // Розмір відповідно до Canvas
        infoTextPlane.position.set(0, 1.2, 0); // Розміщення над маркером
        infoTextPlane.rotation.x = -Math.PI / 8; // Трохи нахилимо для кращого огляду
        infoTextPlane.visible = false; // Початково ховаємо
        infoAnchor.group.add(infoTextPlane);

        infoAnchor.onTargetFound = () => {
            console.log("Info marker (Index 1) found!");
            ui.showMessage("Знайдено інформаційний маркер.", 3000);
            updateInfoText(selectedAlgorithm); // Оновлюємо текст при знаходженні (на випадок зміни алгоритму)
            infoTextPlane.visible = true; // Показуємо 3D-текст
        };
        infoAnchor.onTargetLost = () => {
            console.log("Info marker (Index 1) lost!");
            infoTextPlane.visible = false; // Приховуємо 3D-текст
        };

        await mindarThree.start();
        renderer.setAnimationLoop(() => {
            renderer.render(scene, camera);
            TWEEN.update();
        });
        console.log("AR Mode Initialized with Sorting Cards and Info Marker.");
        setUIElementsVisibility(false);
        if (!isListening) {
            ui.updateVoiceStatus(false, "Вимкнено", false);
        }
    };

    const initFreeMode = () => {
        cleanupMindAR();

        const oldRendererCanvas = document.querySelector('canvas');
        if (oldRendererCanvas && oldRendererCanvas.parentElement) {
            oldRendererCanvas.parentElement.removeChild(oldRendererCanvas);
            console.log("Old Free Mode Canvas removed before creating new one.");
        }

        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        document.body.appendChild(renderer.domElement);

        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(0, 5, 5);
        scene.add(directionalLight);

        camera.position.set(0, 1, 3);

        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.25;

        const plane = new THREE.Mesh(
            new THREE.PlaneGeometry(3, 3),
            new THREE.MeshBasicMaterial({ color: 0xcccccc, transparent: true, opacity: 0.5, side: THREE.DoubleSide })
        );
        plane.rotation.x = -Math.PI / 2;
        scene.add(plane);

        sortingScene = new SortingScene(scene, initialNumbers, false);

        const animate = () => {
            requestAnimationFrame(animate);
            if (controls) controls.update();
            renderer.render(scene, camera);
            TWEEN.update();
        };
        animate();

        console.log("Free Mode Initialized with Sorting Cards.");
        ui.showMessage("Безмаркерний режим. Використовуйте мишку для навігації.");
        setUIElementsVisibility(true);

        if (!isListening) {
            ui.updateVoiceStatus(false, "Вимкнено", false);
        }

        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
    };

    ui.onModeChange(async (mode) => {
        if (currentMode === mode) return;

        if (renderer && renderer.setAnimationLoop) {
            renderer.setAnimationLoop(null);
        }

        currentMode = mode;
        if (currentMode === 'ar') {
            await initAR();
        } else {
            initFreeMode();
        }
        sortingScene.resetCards();
        currentNumbers = [...initialNumbers];
        stats = { comparisons: 0, swaps: 0 };
        ui.updateMetrics(0, stats.comparisons, stats.swaps);
    });

    ui.onStartSort(async () => {
        if (!algorithms[selectedAlgorithm]) {
            ui.showMessage(`Помилка: Алгоритм "${selectedAlgorithm}" не знайдено.`);
            return;
        }

        currentNumbers = sortingScene.getCards().map(card => card.value);

        if (isSorted(currentNumbers)) {
            ui.showMessage("Список вже відсортований! Анімація не потрібна.");
            return;
        }

        ui.showMessage(`Запуск сортування (${selectedAlgorithm})...`);

        stats = { comparisons: 0, swaps: 0 };
        ui.updateMetrics(0, stats.comparisons, stats.swaps);

        const callbacks = {
            onSwap: async (idx1, idx2) => {
                [currentNumbers[idx1], currentNumbers[idx2]] = [currentNumbers[idx2], currentNumbers[idx1]];
                await sortingScene.animateSwap(idx1, idx2, animationSpeed);
            },
            onHighlight: (indices) => sortingScene.highlightCards(indices, animationSpeed),
            onComparison: onComparison,
            onSwapCount: onSwapCount,
            animationSpeed: animationSpeed
        };

        const startTime = performance.now();
        await algorithms[selectedAlgorithm]([...currentNumbers], callbacks);
        const endTime = performance.now();

        ui.updateMetrics((endTime - startTime) / 1000, stats.comparisons, stats.swaps);
        ui.showMessage(`Сортування (${selectedAlgorithm}) завершено!`);

        currentNumbers = sortingScene.getCards().map(card => card.value);

        await sortingScene.celebrateSort(animationSpeed);
    });

    ui.onReset(() => {
        // Очищаємо всі поточні картки зі сцени
        sortingScene.getCards().forEach(cardData => {
            if (cardData.object.parent) {
                cardData.object.parent.remove(cardData.object);
            }
        });

        // Створюємо нову SortingScene з початковими числами
        if (currentMode === 'ar' && mindarThree && mindarThree.anchors[0]) {
            sortingScene = new SortingScene(mindarThree.anchors[0].group, [...initialNumbers], true);
        } else if (currentMode === 'free' && scene) {
            sortingScene = new SortingScene(scene, [...initialNumbers], false);
        }

        currentNumbers = [...initialNumbers];
        stats = { comparisons: 0, swaps: 0 };
        ui.updateMetrics(0, stats.comparisons, stats.swaps);
        ui.showMessage("Картки скинуто.");
    });

    ui.onAlgorithmSelectChange((algorithmName) => {
        selectedAlgorithm = algorithmName;
        ui.showMessage(`Вибрано алгоритм: ${algorithmName}`);
        // *** ОНОВЛЕННЯ ТЕКСТУ НА ДРУГОМУ МАРКЕРІ ПРИ ЗМІНІ АЛГОРИТМУ ***
        if (infoTextPlane && infoTextPlane.visible) { // Оновлюємо, лише якщо маркер видно
            updateInfoText(selectedAlgorithm);
        }
    });

    ui.onAnimationSpeedChange((speed) => {
        animationSpeed = parseFloat(speed);
        ui.setSpeedValue(animationSpeed);
    });

    const infoButton = document.getElementById('info-button');
    infoButton.addEventListener('click', () => {
        // Тепер беремо тільки опис (description) для цієї кнопки
        const description = algorithmDescriptions[selectedAlgorithm].description || "Опис для цього алгоритму відсутній.";
        ui.showMessage(description, 5000);
    });

    // ===========================================
    // === ФАЗА 3: ІНТЕГРАЦІЯ З UI ТА УПРАВЛІННЯ ===
    // ===========================================
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
        ui.showMessage("Вибачте, ваш браузер не підтримує Web Speech API для голосових команд.", 7000);
        console.warn("Web Speech API not supported in this browser.");
        ui.toggleVoiceButton.style.display = 'none';
        ui.updateVoiceStatus(false, "Не підтримується", true);
    } else {
        recognition = new SpeechRecognition();
        recognition.lang = 'uk-UA';
        recognition.interimResults = false;
        recognition.continuous = true;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            isListening = true;
            ui.updateVoiceStatus(true, "Слухаю...", false);
            ui.showMessage("Голосові команди активні. Говоріть...", 0);
            speechRecognitionAttempts = 0;
        };

        recognition.onresult = (event) => {
            const last = event.results.length - 1;
            const command = event.results[last][0].transcript.trim().toLowerCase();
            console.log('Голосова команда:', command);
            ui.showMessage(`Ви сказали: "${command}"`, 3000);
            processVoiceCommand(command);
            speechRecognitionAttempts = 0;
        };

        recognition.onend = () => {
            isListening = false;
            console.log("Розпізнавання мови завершено.");
            if (speechRecognitionAttempts < MAX_SPEECH_RECOGNITION_ATTEMPTS) {
                speechRecognitionAttempts++;
                console.log(`Перезапуск розпізнавання... Спроба ${speechRecognitionAttempts}`);
                ui.updateVoiceStatus(false, `Перезапуск... (${speechRecognitionAttempts})`, false);
                setTimeout(() => {
                    if (isListening === false) {
                        try {
                            recognition.start();
                        } catch (e) {
                            console.error("Помилка при перезапуску розпізнавання:", e);
                            ui.updateVoiceStatus(false, "Помилка перезапуску", true);
                        }
                    }
                }, 500);
            } else {
                ui.updateVoiceStatus(false, "Вимкнено", false);
                ui.showMessage("Голосові команди не активні.", 2000);
                if (speechRecognitionAttempts >= MAX_SPEECH_RECOGNITION_ATTEMPTS) {
                    ui.showMessage("Виникла проблема з голосовими командами. Досягнуто ліміту перезапусків.", 7000);
                }
            }
        };

        recognition.onerror = (event) => {
            isListening = false;
            console.error('Помилка розпізнавання мови:', event.error);
            let errorMessage = "Сталася помилка з голосовими командами.";
            if (event.error === 'no-speech') {
                errorMessage = "Не розпізнано мови. Будь ласка, говоріть чітко.";
            } else if (event.error === 'not-allowed') {
                errorMessage = "Доступ до мікрофона заборонено. Будь ласка, надайте дозвіл у налаштуваннях браузера.";
                speechRecognitionAttempts = MAX_SPEECH_RECOGNITION_ATTEMPTS;
                ui.toggleVoiceButton.disabled = true;
            } else if (event.error === 'aborted') {
                errorMessage = "Розпізнавання зупинено.";
            }
            ui.showMessage(errorMessage, 5000);
            ui.updateVoiceStatus(false, `Помилка: ${event.error}`, true);

            if (event.error !== 'not-allowed' && speechRecognitionAttempts < MAX_SPEECH_RECOGNITION_ATTEMPTS) {
                speechRecognitionAttempts++;
                console.log(`Перезапуск після помилки... Спроба ${speechRecognitionAttempts}`);
                ui.updateVoiceStatus(false, `Помилка, перезапуск... (${speechRecognitionAttempts})`, true);
                setTimeout(() => {
                    if (isListening === false) {
                         try {
                            recognition.start();
                        } catch (e) {
                            console.error("Помилка при перезапуску розпізнавання після помилки:", e);
                        }
                    }
                }, 500);
            }
        };

        window.startVoiceRecognition = () => {
            if (!isListening) {
                try {
                    recognition.start();
                } catch (e) {
                    console.error("Помилка при спробі старту розпізнавання:", e);
                    ui.showMessage("Неможливо запустити голосові команди. Можливо, вже працює або сталася помилка дозволів?", 5000);
                    ui.updateVoiceStatus(false, "Неможливо запустити", true);
                }
            } else {
                ui.showMessage("Голосові команди вже активні.", 2000);
            }
        };

        window.stopVoiceRecognition = () => {
            if (isListening) {
                recognition.stop();
                ui.showMessage("Голосові команди вимкнено.", 2000);
            } else {
                ui.showMessage("Голосові команди не активні.", 2000);
            }
        };

        ui.toggleVoiceButton.addEventListener('click', () => {
            if (isListening) {
                window.stopVoiceRecognition();
            } else {
                window.startVoiceRecognition();
            }
        });

        ui.updateVoiceStatus(false, "Вимкнено", false);
    }

    const processVoiceCommand = (command) => {
        const processedCommand = command.trim().toLowerCase();

        if (processedCommand.includes('сортувати') || processedCommand.includes('старт')) {
            ui.startSortButton.click();
        } else if (processedCommand.includes('скинути') || processedCommand.includes('почати знову')) {
            ui.resetButton.click();
        }

        else if (processedCommand.includes('бульбашкове')) {
            ui.algorithmSelect.value = 'bubbleSort';
            ui.algorithmSelect.dispatchEvent(new Event('change'));
            ui.showMessage("Вибрано бульбашкове сортування.");
        } else if (processedCommand.includes('швидке сортування')) {
            ui.algorithmSelect.value = 'quickSort';
            ui.algorithmSelect.dispatchEvent(new Event('change'));
            ui.showMessage("Вибрано швидке сортування.");
        } else if (processedCommand.includes('сортування вибором')) {
            ui.algorithmSelect.value = 'selectionSort';
            ui.algorithmSelect.dispatchEvent(new Event('change'));
            ui.showMessage("Вибрано сортування вибором.");
        } else if (processedCommand.includes('сортування вставками')) {
            ui.algorithmSelect.value = 'insertionSort';
            ui.algorithmSelect.dispatchEvent(new Event('change'));
            ui.showMessage("Вибрано сортування вставками.");
        } else if (processedCommand.includes('сортування злиттям')) {
            ui.algorithmSelect.value = 'mergeSort';
            ui.algorithmSelect.dispatchEvent(new Event('change'));
            ui.showMessage("Вибрано сортування злиттям.");
        }

        else if (processedCommand.includes('швидкість один') || processedCommand.includes('нормальна швидкість') || processedCommand.includes('швидкість 1')) {
            ui.animationSpeedInput.value = '1';
            ui.animationSpeedInput.dispatchEvent(new Event('input'));
            ui.showMessage("Швидкість анімації: 1x.");
        } else if (processedCommand.includes('швидкість два') || processedCommand.includes('швидкість 2')) {
            ui.animationSpeedInput.value = '0.5';
            ui.animationSpeedInput.dispatchEvent(new Event('input'));
            ui.showMessage("Швидкість анімації: 2x.");
        } else if (processedCommand.includes('швидкість чотири') || processedCommand.includes('швидкість 4')) {
            ui.animationSpeedInput.value = '0.25';
            ui.animationSpeedInput.dispatchEvent(new Event('input'));
            ui.showMessage("Швидкість анімації: 4x.");
        } else if (processedCommand.includes('швидкість половина') || processedCommand.includes('повільно') || processedCommand.includes('швидкість 0.5')) {
            ui.animationSpeedInput.value = '2';
            ui.animationSpeedInput.dispatchEvent(new Event('input'));
            ui.showMessage("Швидкість анімації: 0.5x.");
        }

        else if (processedCommand.includes('інформація') || processedCommand.includes('опис алгоритму')) {
            document.getElementById('info-button').click();
        }
        else if (processedCommand.includes('показати інформацію про алгоритм') || processedCommand.includes('що це за алгоритм')) {
            if (infoTextPlane && infoTextPlane.visible) {
                 ui.showMessage(`Інформація про ${algorithmDescriptions[selectedAlgorithm].name} відображається на другому маркері.`, 4000);
            } else {
                 ui.showMessage(`Наведіть камеру на другий маркер, щоб побачити інформацію про ${algorithmDescriptions[selectedAlgorithm].name}.`, 4000);
            }
        }

        else if (processedCommand.includes('привіт') || processedCommand.includes('привіт джарвіс')) {
            ui.showMessage("Привіт! Чим можу допомогти?");
        } else if (processedCommand.includes('що я можу сказати') || processedCommand.includes('команди')) {
            const helpMessage = "Команди: сортувати, скинути, [алгоритм], швидкість (один/два/чотири/половина), інформація, показати інформацію про алгоритм, показати/приховати метрики, увімкнути/вимкнути мікрофон, вільний/AR режим.";
            ui.showMessage(helpMessage, 10000);
        } else if (processedCommand.includes('показати метрики')) {
            ui.toggleMetrics(true);
            ui.showMessage("Метрики показано.");
        } else if (processedCommand.includes('приховати метрики')) {
            ui.toggleMetrics(false);
            ui.showMessage("Метрики приховано.");
        }

        else if (processedCommand.includes('зупинити мікрофон') || processedCommand.includes('вимкнути голосові команди')) {
            window.stopVoiceRecognition();
        } else if (processedCommand.includes('увімкнути мікрофон') || processedCommand.includes('активувати голосові команди')) {
            window.startVoiceRecognition();
        }

        else if (processedCommand.includes('ar режим') || processedCommand.includes('доповнена реальність')) {
            const arModeButton = document.getElementById('ar-mode-button');
            if (arModeButton && currentMode !== 'ar') {
                arModeButton.click();
                ui.showMessage("Перемикання на AR режим...", 3000);
            } else if (currentMode === 'ar') {
                ui.showMessage("Ви вже в AR режимі.", 2000);
            } else {
                ui.showMessage("Кнопка AR режиму не знайдена.", 2000);
            }
        } else if (processedCommand.includes('вільний режим') || processedCommand.includes('без маркера')) {
            const freeModeButton = document.getElementById('free-mode-button');
            if (freeModeButton && currentMode !== 'free') {
                freeModeButton.click();
                ui.showMessage("Перемикання на вільний режим...", 3000);
            } else if (currentMode === 'free') {
                ui.showMessage("Ви вже у вільному режимі.", 2000);
            } else {
                ui.showMessage("Кнопка вільного режиму не знайдена.", 2000);
            }
        }

        else {
            ui.showMessage(`Команда "${command}" не розпізнана. Будь ласка, спробуйте ще раз.`, 3000);
        }
    };

    await initAR();
});
