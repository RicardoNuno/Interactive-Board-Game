import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as CANNON from 'https://cdn.skypack.dev/cannon-es';

const posMove = 2;
const height = 0.1;
const posMatrix = [
    [11.5, height, 9], [8.25, height, 9], [8.25 - posMove * 1, height, 9], [8.25 - posMove * 2, height, 9], [8.25 - posMove * 3, height, 9], [8.25 - posMove * 4, height, 9], [8.25 - posMove * 5, height, 9], [8.25 - posMove * 6, height, 9], [8.25 - posMove * 7, height, 9],
    [-9, height, 9], [-9, height, 5.75], [-9, height, 5.75 - posMove * 1], [-9, height, 5.75 - posMove * 2], [-9, height, 5.75 - posMove * 3], [-9, height, 5.75 - posMove * 4], [-9, height, 5.75 - posMove * 5], [-9, height, 5.75 - posMove * 6], [-9, height, 5.75 - posMove * 7],
    [-9, height, -11.5], [-5.75, height, -11.5], [-5.75 + posMove * 1, height, -11.5], [-5.75 + posMove * 2, height, -11.5], [-5.75 + posMove * 3, height, -11.5], [-5.75 + posMove * 4, height, -11.5], [-5.75 + posMove * 5, height, -11.5], [-5.75 + posMove * 6, height, -11.5], [-5.75 + posMove * 7, height, -11.5],
    [11.5, height, -11.5], [11.5, height, -8.25], [11.5, height, -8.25 + posMove * 1], [11.5, height, -8.25 + posMove * 2], [11.5, height, -8.25 + posMove * 3], [11.5, height, -8.25 + posMove * 4], [11.5, height, -8.25 + posMove * 5], [11.5, height, -8.25 + posMove * 6], [11.5, height, -8.25 + posMove * 7]
];

let cloud;
let cloudBody;
let mixer; // Define mixer here
let isMoving = false;
let moveStartTime = 0;
const moveDuration = 1000; // Adjust the duration of the movement as needed (in milliseconds)
let targetPosition = new THREE.Vector3();
let startPosition = new THREE.Vector3();
const clock = new THREE.Clock(); // Add a clock to measure time

export function createCloud(callback, currentIndex = 0) {
    const loader = new GLTFLoader();

    loader.load('cloud.glb', function (gltf) {
        cloud = gltf.scene;

        // Set up animation mixer
        mixer = new THREE.AnimationMixer(cloud);

        // Play all animations
        gltf.animations.forEach((clip) => {
            mixer.clipAction(clip).play();
        });

        // Scale and initial position adjustments
        cloud.position.set(posMatrix[currentIndex][0], posMatrix[currentIndex][1], posMatrix[currentIndex][2]);

        cloudBody = new CANNON.Body({
            mass: 1,
            shape: new CANNON.Box(new CANNON.Vec3(0.25, 0.25, 0.25))
        });
        cloudBody.position.set(posMatrix[currentIndex][0], posMatrix[currentIndex][1], posMatrix[currentIndex][2]);

        callback(cloud, cloudBody); // Pass mixer to callback
    });
}

export function moveCloud(currentIndex) {
    startPosition.copy(cloud.position);
    targetPosition.set(posMatrix[currentIndex][0], posMatrix[currentIndex][1], posMatrix[currentIndex][2]);
    moveStartTime = Date.now();
    isMoving = true;
}

export function updateCloudPosition(cloud, body) {
    if (isMoving) {
        const elapsedTime = Date.now() - moveStartTime;
        const t = Math.min(elapsedTime / moveDuration, 1); // Ensure t is between 0 and 1

        // Interpolate position based on t
        cloud.position.lerpVectors(startPosition, targetPosition, t);
        body.position.copy(cloud.position);

        // Check if the cloud has reached its target position
        if (t >= 1) {
            isMoving = false;
        }
    }
    const deltaTime = clock.getDelta(); // Get the time delta
    // Update the animation mixer
    if (mixer) {
        mixer.update(deltaTime); // Use deltaTime for animation updates
    }

    // Sync the cloud's position and rotation with the physics body
    cloud.position.copy(body.position);
    cloud.quaternion.copy(body.quaternion);
}

