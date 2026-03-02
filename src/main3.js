import './style.css';
import * as THREE from "three";
import { ARButton } from "three/addons/webxr/ARButton.js";

let container;
let camera, scene, renderer;
let reticle;
let controller;

let hitTestSource = null;
let hitTestSourceInitialized = false;

init();
animate();

function init() {
    container = document.createElement("div");
    document.body.appendChild(container);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    container.appendChild(renderer.domElement);

    // світло
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.0);
    dirLight.position.set(2, 4, 2);
    scene.add(dirLight);

    // Контролер для AR сесій
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
    const geometry = new THREE.RingGeometry(0.08, 0.1, 32).rotateX(-Math.PI / 2);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 }); 
    reticle = new THREE.Mesh(geometry, material);
    reticle.matrixAutoUpdate = false;
    reticle.visible = false;
    scene.add(reticle);
}

function onSelect() {
    if (reticle.visible) {
       
        const size = 0.075;
        const geometry = new THREE.BoxGeometry(size, size, size);
        
        const materials = [
            new THREE.MeshStandardMaterial({ color: 0xff00ff, roughness: 0.3, metalness: 0.2 }), // Right (Рожевий)
            new THREE.MeshStandardMaterial({ color: 0xff00ff, roughness: 0.3, metalness: 0.2 }), // Left (Рожевий)
            new THREE.MeshStandardMaterial({ color: 0x8a2be2, roughness: 0.3, metalness: 0.2 }), // Top (Фіолетовий)
            new THREE.MeshStandardMaterial({ color: 0x8a2be2, roughness: 0.3, metalness: 0.2 }), // Bottom (Фіолетовий)
            new THREE.MeshStandardMaterial({ color: 0x00bfff, roughness: 0.3, metalness: 0.2 }), // Front (Блакитний)
            new THREE.MeshStandardMaterial({ color: 0x00bfff, roughness: 0.3, metalness: 0.2 })  // Back (Блакитний)
        ];

        const mesh = new THREE.Mesh(geometry, materials);
        
        // Встановлення позиції на поверхню
        mesh.position.setFromMatrixPosition(reticle.matrix);
        mesh.position.y += size / 2; 
        
        scene.add(mesh);
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

     
        scene.children.forEach(child => {
            if (child instanceof THREE.Mesh && child !== reticle) {
                child.rotation.y -= 0.01; 
            }
        });
    }
    renderer.render(scene, camera);
}