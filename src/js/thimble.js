import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';;
import * as CANNON from 'https://cdn.skypack.dev/cannon-es';
import * as CLOUD from './cloud.js'

// ----------------------------------------------- THIMBLE --------------------------------------------------
let thimble;
var isMoving = false;
let jumpStartTime = 0;
const jumpDuration = 500; // Adjust the duration of the jump as needed (in milliseconds)
let scoreCount;
const targetY = 0.1;
const posMove = 2;
const posMatrix =   [
                        [11.5,0.1,9],[8.25,0.1,9],[8.25-posMove*1,0.1,9],[8.25-posMove*2,0.1,9],[8.25-posMove*3,0.1,9],[8.25-posMove*4,0.1,9],[8.25-posMove*5,0.1,9],[8.25-posMove*6,0.1,9],[8.25-posMove*7,0.1,9],
                        [-9,0.1,9],[-9,0.1,5.75],[-9,0.1,5.75-posMove*1],[-9,0.1,5.75-posMove*2],[-9,0.1,5.75-posMove*3],[-9,0.1,5.75-posMove*4],[-9,0.1,5.75-posMove*5],[-9,0.1,5.75-posMove*6],[-9,0.1,5.75-posMove*7],
                        [-9,0.1,-11.5],[-5.75,0.1,-11.5],[-5.75+posMove*1,0.1,-11.5],[-5.75+posMove*2,0.1,-11.5],[-5.75+posMove*3,0.1,-11.5],[-5.75+posMove*4,0.1,-11.5],[-5.75+posMove*5,0.1,-11.5],[-5.75+posMove*6,0.1,-11.5],[-5.75+posMove*7,0.1,-11.5],
                        [11.5,0.1,-11.5],[11.5,0.1,-8.25],[11.5,0.1,-8.25+posMove*1],[11.5,0.1,-8.25+posMove*2],[11.5,0.1,-8.25+posMove*3],[11.5,0.1,-8.25+posMove*4],[11.5,0.1,-8.25+posMove*5],[11.5,0.1,-8.25+posMove*6],[11.5,0.1,-8.25+posMove*7]
                    ];
let currentIndex = 0;
let scoreFlag = false;

export function createThimble(callback) {
    const loader = new GLTFLoader();

    loader.load('thimble.gltf', function (gltf) {
        thimble = gltf.scene;

        // Scale and position adjustments
        thimble.scale.set(0.05, 0.05, 0.05);
        thimble.position.set(posMatrix[0][0],posMatrix[0][1],posMatrix[0][2]);

        // Adjust material properties
        thimble.traverse(function (child) {
            if (child.isMesh) {
                // Example: Set metallicness and roughness
                child.material.metalness = 0.7; // Adjust metallicness (0 to 1)
                child.material.roughness = 0.2; // Adjust roughness (0 to 1)
                child.material.envMapIntensity = 1; // Adjust environment map intensity
                
                // Example: Set color to gray to achieve metallic appearance
                child.material.color.set(0xFFFFF0); // Gray color
                child.castShadow = true;
                child.receiveShadow = true;
            }
            
        });

        const cylinderShape = new CANNON.Cylinder(2, 2, 2.25, 32);
        const thimbleBody = new CANNON.Body({
            mass: 0,
            shape: cylinderShape,
            position: new CANNON.Vec3(0, 1.1, 0)
        });
    

        // Invoke the callback with the thimble object
        callback(thimble, thimbleBody);
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
        const distanceX = posMatrix[currentIndex][0] - thimble.position.x;
        const distanceZ = posMatrix[currentIndex][2] - thimble.position.z;
        // Define movement speed
        const movementSpeed = 0.1; // Adjust as needed

        // Check if the distance is small enough to stop moving
        if (Math.abs(distanceX) < 0.0001 && Math.abs(distanceZ) < 0.0001) {
            // Snap the thimble to the target position
            thimble.position.x = posMatrix[currentIndex][0];
            thimble.position.z = posMatrix[currentIndex][2];
            // Stop moving
            isMoving = false;
            if (scoreCount != 0){
                moveThimble(scoreCount);
            }
            else {
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
            thimble.position.x = posMatrix[currentIndex][0];
            thimble.position.z = posMatrix[currentIndex][2];
            // Stop moving
            isMoving = false;
            if (scoreCount != 0){
                moveThimble(scoreCount);
            }
        }
    }
}

export function moveThimble(count, cloudObject){
    scoreCount = count - 1;
    if (!scoreCount){
        scoreFlag = true;
    }
    if (!isMoving) {
        currentIndex = (currentIndex + 1) % 36;
        isMoving = true;
        jumpStartTime = Date.now();
    }
    if (cloudObject){
        CLOUD.moveCloud(currentIndex, currentIndex + scoreCount, jumpDuration);
    }
}

export function getIndex(){
    return currentIndex;
}

export function getScoreFlag(){
    return scoreFlag;
}

export function setScoreFlag(){
    scoreFlag = false;
}