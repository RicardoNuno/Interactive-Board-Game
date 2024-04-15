import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );
renderer.setPixelRatio(5);

var planeGeometry = new THREE.BoxGeometry(25, 25, 0.2); // Example dimensions

var textureLoader = new THREE.TextureLoader();
var monopolyTexture = textureLoader.load('/monopoly.png');
// Adjust the mipmap bias for texture filtering
monopolyTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
monopolyTexture.generateMipmaps = false; // Disable automatic mipmap generation
monopolyTexture.magFilter = THREE.LinearFilter; // Use linear filtering for magnification
monopolyTexture.minFilter = THREE.LinearMipmapLinearFilter; // Use linear filtering for minification


const planeMaterials = [
    new THREE.MeshBasicMaterial({ color: 0x000000 }), // Right side (black)
    new THREE.MeshBasicMaterial({ color: 0x000000 }), // Left side (black)
    new THREE.MeshBasicMaterial({ color: 0x000000 }), // Top side (black)
    new THREE.MeshBasicMaterial({ color: 0x000000 }), // Bottom side (black)
    new THREE.MeshBasicMaterial({ map: monopolyTexture }), // Front side (with texture)
    new THREE.MeshBasicMaterial({ color: 0xFFFF0F }) // Back side (Yellow)
];

// Create a material with different sides
var plane = new THREE.Mesh(planeGeometry, planeMaterials);
scene.add(plane);

const loader = new GLTFLoader();
var thimble;
var isMoving = false;
var targetX = 11;
var targetY = -9;
var originalZ = 0.1;
let jumpStartTime = 0;
const jumpDuration = 500; // Adjust the duration of the jump as needed (in milliseconds)
loader.load('thimble.gltf', function (gltf) {
    thimble = gltf;
    gltf.scene.scale.set(0.05, 0.05, 0.05);
    gltf.scene.position.set(targetX, targetY, originalZ);
    gltf.scene.rotation.set(Math.PI / 2, 0, 0);
    
    // Adjust material properties
    gltf.scene.traverse(function (child) {
        if (child.isMesh) {
            // Example: Set metallicness and roughness
            child.material.metalness = 0.7; // Adjust metallicness (0 to 1)
            child.material.roughness = 0.2; // Adjust roughness (0 to 1)
            child.material.envMapIntensity = 1; // Adjust environment map intensity
            
            // Example: Set color to gray to achieve metallic appearance
            child.material.color.set(0xFFFFF0); // Gray color
        }
    });
    
    // Add lights to the scene (ambient light and directional light)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    scene.add(gltf.scene);
});




var axesHelper = new THREE.AxesHelper(50); // The parameter is the length of the axes
scene.add(axesHelper);

camera.position.set(0, 19, 0); // Adjust Y value to position above the plane
camera.lookAt(plane.position);

var ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Example ambient light
scene.add(ambientLight);

var directionalLight = new THREE.DirectionalLight(0xffffff, 0.5); // Example directional light
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

// user interaction

let drag = false;
let phi = 0, theta = 0;
let old_x, old_y;
let radius = 16.5;

const mouseDown = function (e) {
    drag = true;
    old_x = e.pageX, old_y = e.pageY;
    e.preventDefault();
    return false;
}

const mouseUp = function (e) {
    drag = false;
}

const mouseMove = function (e) {
    if (!drag) return false;
    const dX = e.pageX - old_x,
        dY = e.pageY - old_y;
    theta += dX * 1.5 * Math.PI / window.innerWidth;
    phi += dY * 1.5 * Math.PI / window.innerHeight;
    old_x = e.pageX, old_y = e.pageY;

    e.preventDefault();
}

function onDocumentKeyDown(event) {
    // Get the key code of the pressed key 
    const keyCode = event.which;
    console.log("tecla " + keyCode);

    // + get closer
    if (keyCode == 187) {
        radius -= 0.1;
    }

    // - move away
    if (keyCode == 189 && radius <= 17) {
        radius += 0.1;
    }
    if (keyCode === 37 && thimble.scene.position.x > -9) {
        if (!isMoving) {
            // Set the target position to move the thimble to the left by 1 unit
            targetX -= 1.92;
            // Start the movement
            isMoving = true;
            // Simulate a jump by moving the thimble upwards in the Z direction
            jumpStartTime = Date.now();
        }
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
    
    
    if (keyCode === 38 &&  thimble.scene.position.y < 11.5) {
        // Move thimble 1 unit to the left
        if (!isMoving) {
            // Set the target position to move the thimble to the right by 1 unit
            targetY += 1.92;
            // Start the movement
            isMoving = true;
            // Simulate a jump by moving the thimble upwards in the Z direction
            jumpStartTime = Date.now();
        }
    }

    if (keyCode === 40 &&  thimble.scene.position.y > -8.5) {
        if (!isMoving) {
            // Set the target position to move the thimble to the right by 1 unit
            targetY -= 1.92;
            // Start the movement
            isMoving = true;
            // Simulate a jump by moving the thimble upwards in the Z direction
            jumpStartTime = Date.now();
        }
    }
}

renderer.domElement.addEventListener("mousedown", mouseDown);
renderer.domElement.addEventListener("mouseup", mouseUp);
renderer.domElement.addEventListener("mousemove", mouseMove);
renderer.setClearColor(0xabcdef);

document.addEventListener("keydown", onDocumentKeyDown, false);

window.addEventListener('resize', function () {
    renderer.setSize(window.innerWidth, window.innerHeight);
    const aspect = window.innerWidth / window.innerHeight;
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
});

function calculateJumpHeight(elapsedTime, duration) {
    const halfDuration = duration / 2;
    const jumpHeight = 1; // Adjust the height of the jump as needed
    let jumpOffset = jumpHeight * Math.sin((elapsedTime / halfDuration) * Math.PI);
    
    // Ensure the thimble doesn't go below the original Z position
    jumpOffset = Math.max(originalZ, jumpOffset);

    return jumpOffset;
}


function animateThimbleMovement() {
    // Check if the thimble is currently moving
    if (isMoving) {
        // Calculate the distance between current position and target position
        const distanceX = targetX - thimble.scene.position.x;
        const distanceY = targetY - thimble.scene.position.y;
        // Define movement speed
        const movementSpeed = 0.1; // Adjust as needed

        // Check if the distance is small enough to stop moving
        if (Math.abs(distanceX) < 0.01 && Math.abs(distanceY) < 0.01) {
            // Snap the thimble to the target position
            thimble.scene.position.x = targetX;
            thimble.scene.position.y = targetY;
            // Stop moving
            isMoving = false;
        } else {
            // Move the thimble towards the target position
            thimble.scene.position.x += distanceX * movementSpeed;
            thimble.scene.position.y += distanceY * movementSpeed;
        }

        const elapsedTime = Date.now() - jumpStartTime;
        if (elapsedTime <= jumpDuration) {
            // Calculate the height of the jump
            const jumpOffset = calculateJumpHeight(elapsedTime, jumpDuration);
            // Update the thimble's Z position
            thimble.scene.position.z = originalZ + jumpOffset;
        } else {
            // Snap the thimble to the target position when the jump is complete
            thimble.scene.position.x = targetX;
            thimble.scene.position.y = targetY;
            // Stop moving
            isMoving = false;
        }
    }
}

function animate() {
    requestAnimationFrame(animate);
    animateThimbleMovement();

    // Clamp phi to avoid flipping
    phi = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, phi));

    // Update camera position
    camera.position.x = radius * Math.sin(theta) * Math.cos(phi) * 1.5;
    camera.position.y = radius * Math.sin(phi) * 1.5;
    camera.position.z = radius * Math.cos(theta) * Math.cos(phi);
    
    // Update camera orientation
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
}

animate();