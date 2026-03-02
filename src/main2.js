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

            // 1. Зменшуємо модель рівно у 2 рази (було 1, 1, 1)
            model.scale.set(0.5, 0.5, 0.5); 

            // 2. Опускаємо нижче. Y відповідає за висоту. 
            // Якщо раніше було -0.5, давай зробимо -1.2 (це опустить її ще на 70 сантиметрів вниз)
            model.position.set(0, -1.2, -2); 

            // Залишаємо виправлення для матеріалів на всяк випадок (зайвим не буде для будь-якої моделі)
            model.traverse((child) => {
                if (child.isMesh && child.material) {
                    child.material.side = THREE.DoubleSide;
                    if (child.material.transparent || child.material.map) {
                        child.material.alphaTest = 0.5;
                        child.material.depthWrite = true; 
                    }
                }
            });

            scene.add(model);
            console.log("Модель успішно завантажена, зменшена та опущена!");
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