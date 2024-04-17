import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as CANNON from 'https://cdn.skypack.dev/cannon-es';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';

// ----------------------------------------------- THIMBLE --------------------------------------------------
const loader = new GLTFLoader();
let thimble;
var isMoving = false;
var targetX = 11;
var targetY = 0.1;
var originalZ = 9;
let jumpStartTime = 0;
const jumpDuration = 500; // Adjust the duration of the jump as needed (in milliseconds)
let scoreCount;

export function createThimble(callback) {
    const loader = new GLTFLoader();

    loader.load('thimble.gltf', function (gltf) {
        thimble = gltf.scene;

        // Scale and position adjustments
        thimble.scale.set(0.05, 0.05, 0.05);
        thimble.position.set(targetX, targetY, originalZ);

        // Adjust material properties
        thimble.traverse(function (child) {
            if (child.isMesh) {
                // Example: Set metallicness and roughness
                child.material.metalness = 0.7; // Adjust metallicness (0 to 1)
                child.material.roughness = 0.2; // Adjust roughness (0 to 1)
                child.material.envMapIntensity = 1; // Adjust environment map intensity
                
                // Example: Set color to gray to achieve metallic appearance
                child.material.color.set(0xFFFFF0); // Gray color
            }
        });

        // Invoke the callback with the thimble object
        callback(thimble);
    });
}

// ----------------------------------------------- THIMBLE ANIMATION --------------------------------------------------
function calculateJumpHeight(elapsedTime, duration) {
    const halfDuration = duration / 2;
    const jumpHeight = 1.2; // Adjust the height of the jump as needed
    let jumpOffset = jumpHeight * Math.sin((elapsedTime / halfDuration) * Math.PI);
    
    // Ensure the thimble doesn't go below the original Z position
    jumpOffset = Math.max(targetY, jumpOffset);

    return jumpOffset;
}


export function animateThimbleMovement(thimble) {
    // Check if the thimble is currently moving
    if (isMoving) {
        // Calculate the distance between current position and target position
        const distanceX = targetX - thimble.position.x;
        const distanceZ = originalZ - thimble.position.z;
        // Define movement speed
        const movementSpeed = 0.1; // Adjust as needed

        // Check if the distance is small enough to stop moving
        if (Math.abs(distanceX) < 0.0001 && Math.abs(distanceZ) < 0.0001) {
            // Snap the thimble to the target position
            thimble.position.x = targetX;
            thimble.position.z = originalZ;
            // Stop moving
            isMoving = false;
            if (scoreCount != 0){
                console.log("han?")
                moveThimble(scoreCount)
                console.log(scoreCount);
            }
        } else {
            // Move the thimble towards the target position
            thimble.position.x += distanceX * movementSpeed;
            thimble.position.z += distanceZ * movementSpeed;
        }

        const elapsedTime = Date.now() - jumpStartTime;
        if (elapsedTime <= jumpDuration) {
            // Calculate the height of the jump
            const jumpOffset = calculateJumpHeight(elapsedTime, jumpDuration);
            // Update the thimble's Z position
            thimble.position.y = targetY + jumpOffset;
        } else {
            // Snap the thimble to the target position when the jump is complete
            thimble.position.x = targetX;
            thimble.position.z = originalZ;
            // Stop moving
            isMoving = false;
            if (scoreCount != 0){
                console.log("han?")
                moveThimble(scoreCount);
                console.log(scoreCount);
            }
        }
    }
    return scoreCount;
}

export function moveThimble(count){
    scoreCount = count - 1
    if (!isMoving) {
        // Set the target position to move the thimble to the left by 1 unit
        targetX -= 1.92;
        // Start the movement
        isMoving = true;
        // Simulate a jump by moving the thimble upwards in the Z direction
        jumpStartTime = Date.now();
    }
}
/*
if (keyCode === 37 && thimble.scene.position.x > -9) {
}

if (keyCode === 39 && thimble.scene.position.x < 11.5) {
    if (!isMoving) {
        // Set the target position to move the thimble to the right by 1 unit
        targetX += 1.92;
        // Start the movement
        isMoving = true;
        // Simulate a jump by moving the thimble upwards in the Z direction
        jumpStartTime = Date.now();
    }
}


if (keyCode === 38 &&  thimble.scene.position.z < 11.5) {
    // Move thimble 1 unit to the left
    if (!isMoving) {
        // Set the target position to move the thimble to the right by 1 unit
        originalZ += 1.92;
        // Start the movement
        isMoving = true;
        // Simulate a jump by moving the thimble upwards in the Z direction
        jumpStartTime = Date.now();
    }
}

if (keyCode === 40 &&  thimble.scene.position.z > -8.5) {
    if (!isMoving) {
        // Set the target position to move the thimble to the right by 1 unit
        originalZ -= 1.92;
        // Start the movement
        isMoving = true;
        // Simulate a jump by moving the thimble upwards in the Z direction
        jumpStartTime = Date.now();
    }
}
*/