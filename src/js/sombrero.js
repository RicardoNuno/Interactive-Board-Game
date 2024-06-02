import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';;
import * as CANNON from 'https://cdn.skypack.dev/cannon-es';

let sombrero, mixer;
let clock = new THREE.Clock();
let opacityStartTime = 0;
let opacityDuration = 2000; // Duration for the opacity animation
let animationRunning = false;

// Function to create and set up the sombrero
export function createSombrero(callback) {
    const loader = new GLTFLoader();

    loader.load('sombrero.glb', function (gltf) {
        sombrero = gltf.scene;

        // Scale and position adjustments
        sombrero.scale.set(10, 10, 10);
        sombrero.position.set(0, 0, 0);

        // Set initial opacity
        sombrero.traverse(function (child) {
            if (child.isMesh) {
                child.material.transparent = true;
                child.material.opacity = 0; // Initial opacity
            }
        });

        // Set up the animation mixer
        mixer = new THREE.AnimationMixer(sombrero);

        // Play all animations
        gltf.animations.forEach((clip) => {
            mixer.clipAction(clip).play();
        });

        // Adjust the physics body if necessary
        const cylinderShape = new CANNON.Cylinder(2, 2, 2.25, 32);
        const sombreroBody = new CANNON.Body({
            mass: 0,
            shape: cylinderShape,
            position: new CANNON.Vec3(0, 1.1, 0)
        });

        // Start the opacity animation
        opacityStartTime = Date.now();

        // Invoke the callback with the sombrero object
        callback(sombrero, sombreroBody);
    });
}

// Function to update the animation
export function updateSombreroAnimation() {
    const deltaTime = clock.getDelta();
    if (mixer) {
        mixer.update(deltaTime);

        // Opacity animation
        const opacityElapsedTime = Date.now() - opacityStartTime;
        const opacityT = Math.min(opacityElapsedTime / opacityDuration, 1);
        sombrero.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.material.opacity = opacityT;
            }
        });

        // Check if the opacity animation has finished
        if (opacityT >= 1) {
            animationRunning = true;
        }
    }
}

// Function to start the disappearance animation
export function removeSombrero() {
    isDisappearing = true;
    disappearStartTime = Date.now();
}

// Function to update the disappearance animation
export function updateDisappearanceAnimation() {
    if (isDisappearing) {
        const disappearElapsedTime = Date.now() - disappearStartTime;
        const disappearT = Math.min(disappearElapsedTime / disappearDuration, 1);
        sombrero.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.material.opacity = 1 - disappearT;
            }
        });
        if (disappearT >= 1) {
            // Add any additional cleanup or removal logic here if needed
            // For example, you might want to remove the sombrero from the scene
            animationRunning = false;
        }
    }
}
