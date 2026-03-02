import './style.css';
import * as THREE from 'three';
import { ARButton } from 'three/addons/webxr/ARButton.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let camera, scene, renderer;
let loader;
let model;

init();
animate();

function init() {
    const container = document.createElement('div');
    document.body.appendChild(container);

    scene = new THREE.Scene();

    // Камера
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 40);
    camera.position.set(0, 1.6, 2); 

    // Рендерер
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true; 
    container.appendChild(renderer.domElement);

    // --- ОСВІТЛЕННЯ (робимо яскравіше) ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5); 
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2); 
    directionalLight.position.set(5, 10, 5); // Підняли світло вище
    scene.add(directionalLight);

    // Додаємо напівсферичне світло, щоб модель гарно виглядала з усіх боків
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1.5);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);
    
    // Твоє посилання
    const modelUrl = 'https://lab2-ar.vercel.app/models/model.glb';

    loader = new GLTFLoader();
    loader.load(
        modelUrl,
        function (gltf) {
            model = gltf.scene;

            // 1. Ручне масштабування (якщо вона буде замала, зміни на 2, 3 або 5)
            model.scale.set(1.5, 1.5, 1.5); 

            // 2. Ставимо прямо перед тобою: по центру (0), на рівні грудей (1.2) і трохи ближче (-1.5)
            model.position.set(0, 1.2, -1.5); 

            // 3. РЯТУЄМО ВОЛОССЯ ТА ОЧІ
            model.traverse((child) => {
                if (child.isMesh) {
                    // Змушуємо Three.js малювати текстури з обох боків (повертає волосся)
                    child.material.side = THREE.DoubleSide;
                    
                    // Виправляємо проблеми з прозорістю (повертає очі та вії)
                    if (child.material.transparent || child.material.map) {
                        child.material.alphaTest = 0.5; // Відкидає баги з прозорим фоном
                        child.material.depthWrite = true; 
                    }
                }
            });

            scene.add(model);
            console.log("Модель успішно завантажена з виправленими матеріалами!");
        },
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        function (error) {
            console.error('Помилка завантаження моделі:', error);
        }
    );

    document.body.appendChild(ARButton.createButton(renderer));
    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    renderer.setAnimationLoop(render);
}

let degrees = 0; 

function render() {
    rotateModel();
    renderer.render(scene, camera);
}

function rotateModel() {
    if (model !== undefined) {
        degrees += 0.5; 
        model.rotation.y = THREE.MathUtils.degToRad(degrees); 
    } 
}