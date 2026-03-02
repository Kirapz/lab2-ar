import './style.css';
import * as THREE from "three";
import { ARButton } from "three/addons/webxr/ARButton.js";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let container;
let camera, scene, renderer;
let reticle;
let controller;
let model = null; // Змінна для нашої будівлі

let hitTestSource = null;
let hitTestSourceInitialized = false;

init();
animate();

function init() {
    container = document.createElement("div");
    document.body.appendChild(container);

    // Сцена
    scene = new THREE.Scene();

    // Камера
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);

    // Рендерер
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    container.appendChild(renderer.domElement);

    // --- ОСВІТЛЕННЯ (М'яке для архітектури) ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(5, 10, 5);
    scene.add(directionalLight);

    // Контролер
    controller = renderer.xr.getController(0);
    controller.addEventListener('select', onSelect);
    scene.add(controller);

    addReticleToScene();

    const button = ARButton.createButton(renderer, {
        requiredFeatures: ["hit-test"]
    });
    document.body.appendChild(button);

    window.addEventListener("resize", onWindowResize, false);
}

function addReticleToScene() {
    const geometry = new THREE.RingGeometry(0.1, 0.12, 32).rotateX(-Math.PI / 2);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    reticle = new THREE.Mesh(geometry, material);
    reticle.matrixAutoUpdate = false;
    reticle.visible = false;
    scene.add(reticle);
}

function onSelect() {
    if (reticle.visible) {
        // Шлях до вашої моделі (має лежати в папці public/models/model2.glb)
        const modelUrl = './models/model2.glb';
        const loader = new GLTFLoader();

        // Якщо модель вже існує, видаляємо її перед встановленням нової
        if (model) {
            scene.remove(model);
        }

        loader.load(
            modelUrl,
            function (gltf) {
                model = gltf.scene;
                
                // Правильне позиціонування з ретікла
                model.position.setFromMatrixPosition(reticle.matrix);
                
                // МАСШТАБ: вам може знадобитися змінити ці цифри залежно від розміру вашої моделі будівлі
                model.scale.set(0.001, 0.001, 0.001); 
                
                // Додаємо модель на сцену ЗБЕРІГАЮЧИ оригінальні текстури будівлі
                scene.add(model);
            },
            function (xhr) {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            function (error) {
                console.error('Error loading model:', error);
            }
        );
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    renderer.setAnimationLoop(render);
}

async function initializeHitTestSource() {
    const session = renderer.xr.getSession();
    const viewerSpace = await session.requestReferenceSpace("viewer");
    hitTestSource = await session.requestHitTestSource({ space: viewerSpace });
    hitTestSourceInitialized = true;

    session.addEventListener("end", () => {
        hitTestSourceInitialized = false;
        hitTestSource = null;
    });
}

function render(timestamp, frame) {
    if (frame) {
        if (!hitTestSourceInitialized) {
            initializeHitTestSource();
        }

        if (hitTestSourceInitialized) {
            const hitTestResults = frame.getHitTestResults(hitTestSource);
            if (hitTestResults.length > 0) {
                const hit = hitTestResults[0];
                const localSpace = renderer.xr.getReferenceSpace();
                const pose = hit.getPose(localSpace);

                reticle.visible = true;
                reticle.matrix.fromArray(pose.transform.matrix);
            } else {
                reticle.visible = false;
            }
        }
        
        // Повільне обертання будівлі навколо своєї осі, щоб можна було її роздивитися
        if (model) {
            model.rotation.y -= 0.005;
        }
    }
    renderer.render(scene, camera);
}