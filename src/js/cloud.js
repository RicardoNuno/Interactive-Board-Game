import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';;
import * as CANNON from 'https://cdn.skypack.dev/cannon-es';

const posMove = 2;
const height = 0.1;
const posMatrix = [
    [10.5, height, 10], [7.25, height, 10], [7.25 - posMove * 1, height, 10], [7.25 - posMove * 2, height, 10], [7.25 - posMove * 3, height, 10], [7.25 - posMove * 4, height, 10], [7.25 - posMove * 5, height, 10], [7.25 - posMove * 6, height, 10], [7.25 - posMove * 7, height, 10],
    [-10, height, 10], [-10, height, 7.25], [-10, height, 7.25 - posMove * 1], [-10, height, 7.25 - posMove * 2], [-10, height, 7.25 - posMove * 3], [-10, height, 7.25 - posMove * 4], [-10, height, 7.25 - posMove * 5], [-10, height, 7.25 - posMove * 6], [-10, height, 7.25 - posMove * 7],
    [-10, height, -10.5], [-7, height, -10.5], [-7 + posMove * 1, height, -10.5], [-7 + posMove * 2, height, -10.5], [-7 + posMove * 3, height, -10.5], [-7 + posMove * 4, height, -10.5], [-7 + posMove * 5, height, -10.5], [-7 + posMove * 6, height, -10.5], [-7 + posMove * 7, height, -10.5],
    [10.5, height, -10.5], [10.5, height, -7.25], [10.5, height, -7.25 + posMove * 1], [10.5, height, -7.25 + posMove * 2], [10.5, height, -7.25 + posMove * 3], [10.5, height, -7.25 + posMove * 4], [10.5, height, -7.25 + posMove * 5], [10.5, height, -7.25 + posMove * 6], [10.5, height, -7.25 + posMove * 7]
];

let cloud;
let cloudBody;
let mixer;
let isMoving = false;
let moveStartTime = 0;
let moveDuration = 1000;
let rotationStartTime = 0;
let rotationDuration = 20000; // Define rotation duration
let targetPosition = new THREE.Vector3();
let startPosition = new THREE.Vector3();
const clock = new THREE.Clock();
let positionQueue = [];
let targetQuaternion = new THREE.Quaternion();
let startQuaternion = new THREE.Quaternion();
let opacityStartTime = 0;
let opacityDuration = 2000; // Duration for the opacity animation
let isDisappearing = false;
let disappearStartTime = 0;
let disappearDuration = 2000; // Duration for the disappearance animation
let cloudFlag = false;

export function resetCloudVariables() {
    cloud = null;
    cloudBody = null;
    mixer = null;
    isMoving = false;
    moveStartTime = 0;
    positionQueue = [];
    targetQuaternion = new THREE.Quaternion();
    startQuaternion = new THREE.Quaternion();
    opacityStartTime = 0;
    isDisappearing = false;
    disappearStartTime = 0;
    cloudFlag = false;
}

export function createCloud(callback, currentIndex = 0) {
    resetCloudVariables();
    const loader = new GLTFLoader();

    loader.load('cloud.glb', function (gltf) {
        cloud = gltf.scene;

        // Set up animation mixer
        mixer = new THREE.AnimationMixer(cloud);

        // Play all animations
        gltf.animations.forEach((clip) => {
            mixer.clipAction(clip).play();
        });

        // Set initial position
        cloud.position.set(posMatrix[currentIndex][0], posMatrix[currentIndex][1], posMatrix[currentIndex][2]);

        // Set initial opacity
        cloud.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.material.transparent = true;
                child.material.opacity = 0;
            }
        });

        cloudBody = new CANNON.Body({
            mass: 1,
            shape: new CANNON.Box(new CANNON.Vec3(0.25, 0.25, 0.25))
        });
        cloudBody.position.set(posMatrix[currentIndex][0], posMatrix[currentIndex][1], posMatrix[currentIndex][2]);

        // Set initial quaternion
        setTargetQuaternion(currentIndex);
        cloud.quaternion.copy(targetQuaternion);
        cloudBody.quaternion.copy(targetQuaternion);

        // Start opacity animation
        opacityStartTime = Date.now();

        callback(cloud, cloudBody);
    });
}

export function moveCloud(startIndex, endIndex, jumpDuration) {
    positionQueue = [];
    for (let i = startIndex; i <= endIndex; i++) {
        const wrappedIndex = i % posMatrix.length;
        positionQueue.push(wrappedIndex);
    }
    if (!isMoving) {
        moveToNextPosition(jumpDuration);
    }
}

function moveToNextPosition(jumpDuration) {
    if (positionQueue.length > 0) {
        const nextIndex = positionQueue.shift();
        if (nextIndex >= 0 && nextIndex < posMatrix.length) {
            startPosition.copy(cloud.position);
            targetPosition.set(posMatrix[nextIndex][0], posMatrix[nextIndex][1], posMatrix[nextIndex][2]);
            moveStartTime = Date.now();
            isMoving = true;
            moveDuration = jumpDuration;

            startQuaternion.copy(cloud.quaternion);
            setTargetQuaternion(nextIndex);
            rotationStartTime = Date.now(); // Set rotation start time
        } else {
            console.error(`Next index ${nextIndex} is out of bounds for posMatrix.`);
        }
    }
}

function setTargetQuaternion(index) {
    if (index+1 == 0) {
        targetQuaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), +Math.PI * (4/7));
    } else if (index < 9) {
        targetQuaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI * 2);
    } else if (index == 9) {
        targetQuaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI / 4);
    } else if (index < 18) {
        targetQuaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI / 2);
    } else if (index == 18) {
        targetQuaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI / (4/3));
    } else if (index < 27) {
        targetQuaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI);
    } else if (index == 27) {
        targetQuaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI * (4/3));
    } else {
        targetQuaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI / 2);
    }
}

export function updateCloudPosition(cloud, body) {
    if (isMoving) {
        const elapsedTime = Date.now() - moveStartTime;
        const t = Math.min(elapsedTime / moveDuration, 1);

        // Interpolate position based on t
        cloud.position.lerpVectors(startPosition, targetPosition, t);
        body.position.copy(cloud.position);

        const rotationElapsedTime = Date.now() - rotationStartTime;
        const rotationT = Math.min(rotationElapsedTime / rotationDuration, 1);

        // Interpolate rotation based on rotationT
        cloud.quaternion.slerp(targetQuaternion, rotationT);
        body.quaternion.copy(cloud.quaternion);

        // Check if the cloud has reached its target position
        if (t >= 1) {
            isMoving = false;
            if (positionQueue.length > 0) {
                moveToNextPosition(moveDuration);
            }
        }
    }
    const deltaTime = clock.getDelta();
    if (mixer) {
        mixer.update(deltaTime);
    }

    cloud.position.copy(body.position);
    cloud.quaternion.copy(body.quaternion);

    // Opacity animation
    const opacityElapsedTime = Date.now() - opacityStartTime;
    const opacityT = Math.min(opacityElapsedTime / opacityDuration, 1);
    cloud.traverse((child) => {
        if (child instanceof THREE.Mesh) {
            child.material.opacity = opacityT;
        }
    });

    // Disappearance animation
    if (isDisappearing) {
        const disappearElapsedTime = Date.now() - disappearStartTime;
        const disappearT = Math.min(disappearElapsedTime / disappearDuration, 1);
        cloud.traverse((child) => {
            if (child instanceof THREE.Mesh) {
                child.material.opacity = 1 - disappearT;
            }
        });
        if (disappearT >= 1) {
            cloudFlag = true;
        }
    }
}

export function removeCloud() {
    isDisappearing = true;
    disappearStartTime = Date.now();
}

export function getCloudFlag() {
    return cloudFlag;
}