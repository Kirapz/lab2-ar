import './style.css';
import * as THREE from "three";
import { ARButton } from "three/addons/webxr/ARButton.js";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

let camera, scene, renderer;
let sphereMesh, capsuleMesh, extrudeMesh; 
let controls;
init();
animate();

function init() {
    const container = document.createElement('div');
    document.body.appendChild(container);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 40);
    camera.position.z = 3;

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;
    container.appendChild(renderer.domElement);

    // Світло
    const directionalLight = new THREE.DirectionalLight(0xffffff, 3);
    directionalLight.position.set(3, 3, 3);
    scene.add(directionalLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    const tableHeight = 0.75;

    // Сфера
    const sphereGeometry = new THREE.SphereGeometry(0.15, 32, 16);
    const glassMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x87CEEB,
        transparent: true,
        opacity: 0.6,
        roughness: 0.3,
        metalness: 0.5,
        transmission: 0.9
    });

    sphereMesh = new THREE.Mesh(sphereGeometry, glassMaterial);
    sphereMesh.position.set(-0.5, tableHeight, -1);
    scene.add(sphereMesh);

    // Капсула
    const capsuleGeometry = new THREE.CapsuleGeometry(0.1, 0.25, 4, 16);
    const capsuleMaterial = new THREE.MeshStandardMaterial({
        color: 0xff4500,
        emissive: 0xff2200,
        emissiveIntensity: 1.5,
        metalness: 0.4,
        roughness: 0.3
    });

    capsuleMesh = new THREE.Mesh(capsuleGeometry, capsuleMaterial);
    capsuleMesh.position.set(0, tableHeight, -1);
    scene.add(capsuleMesh);

    // Трикутник
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(0.25, 0);
    shape.lineTo(0.125, 0.3);
    shape.lineTo(0, 0);

    const extrudeGeometry = new THREE.ExtrudeGeometry(shape, {
        depth: 0.1,
        bevelEnabled: true,
        bevelSize: 0.02,
        bevelThickness: 0.02
    });

    extrudeGeometry.center();
    
    const goldMaterial = new THREE.MeshStandardMaterial({
        color: 0xffd700,
        metalness: 1,
        roughness: 0.25
    });

    extrudeMesh = new THREE.Mesh(extrudeGeometry, goldMaterial);
    extrudeMesh.position.set(0.5, tableHeight, -1);
    scene.add(extrudeMesh);

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

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
    controls.update();
}

function render() {
    rotateObjects();
    renderer.render(scene, camera);
}

function rotateObjects() {
    if (sphereMesh) sphereMesh.rotation.y -= 0.01;
    if (capsuleMesh) capsuleMesh.rotation.x -= 0.01;
    if (extrudeMesh) {
        extrudeMesh.rotation.x -= 0.01;
        extrudeMesh.rotation.y -= 0.01;
    }
}