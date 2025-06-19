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

// Об'єкт для зберігання всіх алгоритмів, щоб можна було звертатися за назвою
const algorithms = {
    bubbleSort: bubbleSort,
    quickSort: quickSort,
    selectionSort: selectionSort,
    insertionSort: insertionSort,
    mergeSort: mergeSort,
};

const algorithmDescriptions = {
    bubbleSort: "Бульбашкове сортування: Простаний алгоритм, який багаторазово проходить по списку, порівнює сусідні елементи та міняє їх місцями, якщо вони розташовані в неправильному порядку. Повільний для великих списків.",
    quickSort: "Швидке сортування: Ефективний алгоритм, що використовує стратегію 'розділяй і володарюй'. Вибирає 'опорний' елемент і розділяє інші елементи на дві підмножини: менші та більші за опорний. Потім рекурсивно застосовується до підмножин.",
    selectionSort: "Сортування вибором: Алгоритм, який розділяє список на відсортовану та невідсортовану частини. Він повторно знаходить найменший елемент з невідсортованої частини та переміщує його до відсортованої.",
    insertionSort: "Сортування вставками: Алгоритм, який будує фінальний відсортований масив (або список) по одному елементу за раз. Він бере елементи з вхідних даних і вставляє їх у правильну позицію в уже відсортованій частині.",
    mergeSort: "Сортування злиттям: Ефективний, заснований на порівнянні алгоритм сортування, який використовує стратегію 'розділяй і володарюй'. Він розділяє список навпіл, рекурсивно сортує кожну половину, а потім зливає (об'єднує) відсортовані половини.",
};

let stats = {
    comparisons: 0,
    swaps: 0
};
let animationSpeed = 1;

document.addEventListener("DOMContentLoaded", async () => {
    let renderer, scene, camera;
    let mindarThree = null;
    let controls = null;
    let sortingScene = null;
    let currentMode = 'ar';
    const initialNumbers = [5, 2, 8, 1, 9, 4, 7, 3, 6]; // Початковий масив
    let currentNumbers = [...initialNumbers]; // Масив, який будемо сортувати

    const ui = new UIController();
    let selectedAlgorithm = ui.algorithmSelect.value;

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
            if (child.id !== 'ui-overlay') { // Зберігаємо лише UI-оверлей
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
    };

    // Нова функція: Перевірка, чи масив відсортований
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
            imageTargetSrc: "./src/markers/test-marker.mind",
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

        const sortingAnchor = mindarThree.addAnchor(0);

        // Передаємо initialNumbers, а не currentNumbers, оскільки currentNumbers буде змінюватися
        sortingScene = new SortingScene(sortingAnchor.group, initialNumbers, true); 
        
        sortingAnchor.onTargetFound = () => {
            console.log("Sorting marker found!");
            ui.showMessage("Маркер знайдено. Готово до сортування.");
            setUIElementsVisibility(true); 
        };
        sortingAnchor.onTargetLost = () => {
            console.log("Sorting marker lost!");
            ui.showMessage("Маркер втрачено. Відстеження призупинено.");
            setUIElementsVisibility(false); 
        };

        await mindarThree.start();
        renderer.setAnimationLoop(() => {
            renderer.render(scene, camera);
            TWEEN.update();
        });
        console.log("AR Mode Initialized with Sorting Cards.");
        setUIElementsVisibility(false); 
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

        // Передаємо initialNumbers, а не currentNumbers
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
        // При зміні режиму завжди скидаємо картки
        sortingScene.resetCards();
        currentNumbers = [...initialNumbers]; // Оновлюємо currentNumbers
        stats = { comparisons: 0, swaps: 0 };
        ui.updateMetrics(0, stats.comparisons, stats.swaps);
    });

    ui.onStartSort(async () => {
        if (!algorithms[selectedAlgorithm]) {
            ui.showMessage(`Помилка: Алгоритм "${selectedAlgorithm}" не знайдено.`);
            return;
        }

        // Отримуємо поточні значення карток для перевірки та сортування
        currentNumbers = sortingScene.getCards().map(card => card.value); 

        // !!! ДОДАНО: Перевірка, чи масив вже відсортований !!!
        if (isSorted(currentNumbers)) {
            ui.showMessage("Список вже відсортований! Анімація не потрібна.");
            // Можливо, додати невелику "святкову" анімацію, навіть якщо не було сортування,
            // або просто вивести повідомлення.
            // await sortingScene.celebrateSort(animationSpeed); // Опціонально
            return; // Вихід з функції, анімація не починається
        }

        ui.showMessage(`Запуск сортування (${selectedAlgorithm})...`);
        
        stats = { comparisons: 0, swaps: 0 }; 
        ui.updateMetrics(0, stats.comparisons, stats.swaps);

        const callbacks = {
            onSwap: async (idx1, idx2) => {
                // Оновлюємо currentNumbers після візуального обміну
                [currentNumbers[idx1], currentNumbers[idx2]] = [currentNumbers[idx2], currentNumbers[idx1]];
                await sortingScene.animateSwap(idx1, idx2, animationSpeed);
            },
            onHighlight: (indices) => sortingScene.highlightCards(indices, animationSpeed),
            onComparison: onComparison,
            onSwapCount: onSwapCount,
            animationSpeed: animationSpeed
        };

        const startTime = performance.now();
        // Передаємо копію currentNumbers для алгоритму, щоб не змінювати її безпосередньо.
        // Зміни в currentNumbers відбуватимуться тільки через onSwap колбек.
        await algorithms[selectedAlgorithm]([...currentNumbers], callbacks); 
        const endTime = performance.now();
        
        ui.updateMetrics((endTime - startTime) / 1000, stats.comparisons, stats.swaps);
        ui.showMessage(`Сортування (${selectedAlgorithm}) завершено!`);

        // Оновлюємо currentNumbers після завершення сортування, щоб відобразити кінцевий стан
        // (хоча візуально вони вже будуть відсортовані через onSwap)
        // Це важливо для коректної роботи isSorted після сортування.
        currentNumbers = sortingScene.getCards().map(card => card.value);

        await sortingScene.celebrateSort(animationSpeed);
    });

    ui.onReset(() => {
        if (currentMode === 'ar' && mindarThree && mindarThree.anchors[0]) {
            // Перевіряємо, чи існує anchor.group перед передачею.
            // Якщо anchor ще не був знайдений (або втрачений), anchor.group може бути undefined.
            // Хоча у випадку resetCards, ми просто переініціалізуємо sortingScene
            // з початковими числами, тому це має працювати.
             sortingScene.getCards().forEach(cardData => {
                if (cardData.object.parent) {
                   cardData.object.parent.remove(cardData.object);
                }
            });
            sortingScene = new SortingScene(mindarThree.anchors[0].group, [...initialNumbers], true);
        } else if (currentMode === 'free' && scene) {
            sortingScene.getCards().forEach(cardData => {
                 if (cardData.object.parent) {
                    cardData.object.parent.remove(cardData.object);
                }
            });
            sortingScene = new SortingScene(scene, [...initialNumbers], false);
        }
        
        currentNumbers = [...initialNumbers]; // Скидаємо currentNumbers до початкового стану
        stats = { comparisons: 0, swaps: 0 };
        ui.updateMetrics(0, stats.comparisons, stats.swaps);
        ui.showMessage("Картки скинуто.");
    });

    ui.onAlgorithmSelectChange((algorithmName) => {
        selectedAlgorithm = algorithmName;
        ui.showMessage(`Вибрано алгоритм: ${algorithmName}`);
    });

    ui.onAnimationSpeedChange((speed) => {
        animationSpeed = parseFloat(speed);
        ui.setSpeedValue(animationSpeed);
    });

    const infoButton = document.getElementById('info-button');
    infoButton.addEventListener('click', () => {
        const description = algorithmDescriptions[selectedAlgorithm] || "Опис для цього алгоритму відсутній.";
        ui.showMessage(description, 5000); // Відображаємо опис на 5 секунд
    });

    await initAR(); // Початковий режим - AR
});