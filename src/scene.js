// src/scene.js
import * as THREE from 'three';
import * as TWEEN from 'tween'; // Імпорт Tween.js

export class SortingScene {
    constructor(parentGroup, initialNumbers, isARMode) {
        this.parentGroup = parentGroup;
        this.isARMode = isARMode;
        this.initialNumbers = [...initialNumbers]; // Копія початкових чисел
        this.cardObjects = []; // Масив для зберігання {value, object: THREE.Group}
        this.animationSpeed = 1; // Початкова швидкість анімації
        
        this.initCards();
    }

    // Допоміжна функція для отримання кольору картки за значенням
    getCardColor(value) {
        const hue = (value / 10) * 360; // Припустимо числа від 1 до 9-10
        return `hsl(${hue}, 80%, 60%)`;
    }

    // Створює 3D-меш для картки з числом
    createCardMesh(number) {
        const cardWidth = 0.1;
        const cardHeight = 0.15;
        const thickness = 0.01;

        // Створюємо Canvas для текстури
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const context = canvas.getContext('2d');

        // Фон картки
        context.fillStyle = this.getCardColor(number);
        context.fillRect(0, 0, canvas.width, canvas.height);

        // Текст числа
        context.font = 'bold 120px Arial';
        context.fillStyle = '#FFFFFF'; // Білий текст
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(number.toString(), canvas.width / 2, canvas.height / 2);

        const texture = new THREE.CanvasTexture(canvas);
        
        // Матеріал картки (спереду)
        const frontMaterial = new THREE.MeshBasicMaterial({ map: texture });
        // Матеріал боків та зворотньої сторони
        const sideMaterial = new THREE.MeshBasicMaterial({ color: 0xcccccc });

        const geometry = new THREE.BoxGeometry(cardWidth, cardHeight, thickness);
        const materials = [
            sideMaterial, // right
            sideMaterial, // left
            sideMaterial, // top
            sideMaterial, // bottom
            frontMaterial, // front (індекс 4)
            sideMaterial  // back
        ];
        const cardMesh = new THREE.Mesh(geometry, materials);
        return cardMesh;
    }

    // Ініціалізує та розміщує картки
    initCards() {
        // Очищаємо попередні картки
        this.cardObjects.forEach(card => {
            this.parentGroup.remove(card.object);
        });
        this.cardObjects = [];

        const numCards = this.initialNumbers.length;
        const cardSpacing = 0.12; // Відстань між центрами карток
        const totalWidth = (numCards - 1) * cardSpacing;
        const startX = -totalWidth / 2;

        this.initialNumbers.forEach((number, index) => {
            const cardMesh = this.createCardMesh(number);
            const cardGroup = new THREE.Group();
            cardGroup.add(cardMesh);

            // Розташовуємо картки вздовж осі X, трохи над маркером
            cardGroup.position.set(startX + index * cardSpacing, 0.05, 0);
            cardGroup.rotation.x = -Math.PI / 2; // Картки лежать плашмя
            
            this.parentGroup.add(cardGroup);
            this.cardObjects.push({ value: number, object: cardGroup });
        });
    }

    getCards() {
        return this.cardObjects;
    }

    resetCards() {
        this.initCards(); // Просто переініціалізуємо картки до початкового стану
    }

    // Анімація обміну картками
    async animateSwap(idx1, idx2, animationSpeed) {
        const card1 = this.cardObjects[idx1].object;
        const card2 = this.cardObjects[idx2].object;

        const pos1 = card1.position.clone();
        const pos2 = card2.position.clone();

        const duration = 500 / animationSpeed; // Час анімації залежить від швидкості

        // Анімуємо рух обох карток одночасно
        const tween1 = new TWEEN.Tween(card1.position)
            .to({ x: pos2.x }, duration)
            .easing(TWEEN.Easing.Quadratic.Out)
            .start();

        const tween2 = new TWEEN.Tween(card2.position)
            .to({ x: pos1.x }, duration)
            .easing(TWEEN.Easing.Quadratic.Out)
            .start();

        // Потрібно чекати завершення обох твінів
        await Promise.all([
            new Promise(resolve => tween1.onComplete(resolve)),
            new Promise(resolve => tween2.onComplete(resolve))
        ]);

        // Оновлюємо внутрішній порядок в cardObjects
        // Це важливо для коректної роботи алгоритмів з візуальним обміном
        // і для того, щоб next highlight/swap працював з правильними індексами
        [this.cardObjects[idx1], this.cardObjects[idx2]] = [this.cardObjects[idx2], this.cardObjects[idx1]];
    }

    // Підсвічування карток
    async highlightCards(indices, animationSpeed) {
        const duration = 200 / animationSpeed; // Час підсвічування

        const initialColors = [];
        for (const i of indices) {
            const cardMesh = this.cardObjects[i].object.children[0];
            // Змінено: cardMesh.material.materials[4] на cardMesh.material[4]
            initialColors.push(cardMesh.material[4].color.getHex()); // Зберігаємо оригінальний колір (індекс 4 для лицьової сторони)
            cardMesh.material[4].color.set("#ffcc00"); // Жовтий для підсвічування
        }
        
        await new Promise(resolve => setTimeout(resolve, duration));

        for (let k = 0; k < indices.length; k++) {
            const i = indices[k];
            const cardMesh = this.cardObjects[i].object.children[0];
            // Змінено: cardMesh.material.materials[4] на cardMesh.material[4]
            cardMesh.material[4].color.set(this.getCardColor(this.cardObjects[i].value)); // Повертаємо оригінальний колір
        }
    }
    
    // Анімація успішного сортування
    async celebrateSort(animationSpeed) {
        const popUpDuration = 150 / animationSpeed;
        const dropDuration = 100 / animationSpeed;

        for (let i = 0; i < this.cardObjects.length; i++) {
            const cardGroup = this.cardObjects[i].object;
            const originalY = cardGroup.position.y;

            // Підняти
            await new Promise(resolve => {
                new TWEEN.Tween(cardGroup.position)
                    .to({ y: originalY + 0.3 }, popUpDuration)
                    .easing(TWEEN.Easing.Quadratic.Out)
                    .onComplete(resolve)
                    .start();
            });

            // Опустити
            await new Promise(resolve => {
                new TWEEN.Tween(cardGroup.position)
                    .to({ y: originalY }, dropDuration)
                    .easing(TWEEN.Easing.Quadratic.In)
                    .onComplete(resolve)
                    .start();
            });
        }
    }

    // Оновлення текстури картки (якщо її значення змінилося)
    updateCardTexture(cardObject) {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const context = canvas.getContext('2d');

        context.fillStyle = this.getCardColor(cardObject.value);
        context.fillRect(0, 0, canvas.width, canvas.height);

        context.font = 'bold 120px Arial';
        context.fillStyle = '#FFFFFF';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(cardObject.value.toString(), canvas.width / 2, canvas.height / 2);

        // Змінено: cardObject.object.children[0].material.materials[4] на cardObject.object.children[0].material[4]
        cardObject.object.children[0].material[4].map.dispose(); // Звільняємо стару текстуру
        cardObject.object.children[0].material[4].map = new THREE.CanvasTexture(canvas);
        cardObject.object.children[0].material[4].map.needsUpdate = true;
    }
}