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

    // Налаштування камери
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 40);

    // Налаштування рендерера
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true; // Обов'язково для активації WebXR
    container.appendChild(renderer.domElement);

    // Додаємо освітлення (важливо для відображення матеріалів моделі)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 2); 
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 2); 
    scene.add(ambientLight);
    
    // Твоє посилання на завантажену модель
     const modelUrl = '/models/model.glb';
    // Створюємо завантажувач та додаємо GLTF/GLB модель на сцену
    loader = new GLTFLoader();
    loader.load(
        'https://lab2-ar.vercel.app/models/model.glb',
        function (gltf) {
            model = gltf.scene;
            
            // Ставимо модель на 3 метри перед тобою
            model.position.z = -3;
            scene.add(model);

            // Використовуємо матеріал викладача, щоб виключити помилки з текстурами
            const goldMaterial = new THREE.MeshStandardMaterial({
                color: 0xffd700, 
                metalness: 1,
                roughness: 0.1,
            });
            
            model.traverse((child) => {
                if (child.isMesh) {
                    child.material = goldMaterial;
                    child.material.needsUpdate = true;
                }
            });

            console.log("Model added to scene");
        },
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded' );
        },
        function (error) {
            console.error('Помилка:', error);
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

let degrees = 0; // кут для оберту моделі

function render() {
    rotateModel();
    // Фактичне відображення сцени здійснюється засобами WebGL
    renderer.render(scene, camera);
}

function rotateModel() {
    if (model !== undefined) {
        degrees += 0.5; // Збільшив швидкість для кращої наочності анімації
        
        // Обертання по осі Y зазвичай виглядає природніше для 3D-моделей
        model.rotation.y = THREE.MathUtils.degToRad(degrees); 
    } 
}