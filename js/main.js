import * as THREE from 'three';
import * as CANNON from 'https://cdn.skypack.dev/cannon-es';
import {createBoard, createFloor} from './board.js';
import * as DICE from './dice.js';
import {createButton1, createButton2} from './redButton.js';
import * as THIMBLE from './thimble.js';
import * as HOUSE from './house.js';

let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

let renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );
renderer.setPixelRatio(3);

// ----------------------------------------------- INIT SCENE --------------------------------------------------
let diceMesh;
let diceDic = {};
let floor;
let redButton;
let thimbleObj;
let diceObject;
let currentScore;
let houseObject;
let buttonFlag = true;
let currentIndex;
let forbiddenIdx = [0,2,4,7,9,
                    12,14,18,
                    20,22,25,27,
                    30,32,34];
let throwFlag = true;

function initScene() {
    renderer.shadowMap.enabled = true;
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);
    const topLight = new THREE.PointLight(0xffffff, .8);
    topLight.position.set(5, 13, 0);
    topLight.castShadow = true;
    topLight.shadow.mapSize.width = 2048;
    topLight.shadow.mapSize.height = 2048;
    topLight.shadow.camera.near = 2;
    topLight.shadow.camera.far = 400;
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.7); // Example directional light
    directionalLight.position.set(15, 30, 15);
    scene.add(directionalLight);
    scene.add(topLight);

    addObjects();
    animate();

    const audio = new Audio('Funny Quirky Comedy.mp3');
    let audioInitialized = false;

    // Function to initialize audio playback
    function initAudio() {
        audio.loop = true;
        audio.play();
    }

    // Listen for a user interaction event
    document.addEventListener('mousedown', function() {
        if (!audioInitialized) {
            initAudio();
            audioInitialized = true;
        }
    });
}

function addObjects(){
    scene.add(createBoard());
    floor = createFloor();
    scene.add(floor);
    floorPhysics(floor);

    const button1 = createButton1();
    scene.add(button1.torus);
    physicsWorld.addBody(button1.body);

    const button2 = createButton2();
    redButton = scene.add(button2.sphere);
    physicsWorld.addBody(button2.body);
    
    THIMBLE.createThimble(function (thimble, thimbleBody) {
        thimbleObj = thimble;
        scene.add(thimble);
        physicsWorld.addBody(thimbleBody);
    });
}

function floorPhysics(floor){
    const floorBody = new CANNON.Body({
        type: CANNON.Body.STATIC,
        shape: new CANNON.Plane(),
    });
    floorBody.position.copy(floor.position);
    floorBody.quaternion.copy(floor.quaternion);
    physicsWorld.addBody(floorBody);
}

function diceInit(){
    diceMesh = DICE.createDiceMesh();
    diceDic = DICE.createDice(5, diceMesh);
    physicsWorld.addBody(diceDic.body);
    diceObject = diceDic;
    scene.add(diceMesh);
    DICE.addDiceEvents(diceObject);
}

// ----------------------------------------------- USER INTERACTION --------------------------------------------------
let drag = false;
let phi = 90, theta = 0;
let old_x, old_y;
let radius = 16;

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
    phi = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, phi)); // Clamp phi to avoid flipping
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
}

renderer.domElement.addEventListener("mousedown", mouseDown);
renderer.domElement.addEventListener("mouseup", mouseUp);
renderer.domElement.addEventListener("mousemove", mouseMove);
renderer.setClearColor(0xabcdef);

document.addEventListener("keydown", onDocumentKeyDown, false);

// ----------------------------------------------- RESIZING WINDOW --------------------------------------------------
window.addEventListener('resize', function () {
    renderer.setSize(window.innerWidth, window.innerHeight);
    const aspect = window.innerWidth / window.innerHeight;
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
});

// ----------------------------------------------- PHYSICS --------------------------------------------------

let physicsWorld;

function initPhysics() {
    physicsWorld = new CANNON.World({
        allowSleep: true,
        gravity: new CANNON.Vec3(0, -50, 0),
    })
    physicsWorld.defaultContactMaterial.restitution = .3;
}

// ----------------------------------------------- BUTTON RAYCAST --------------------------------------------------

// Create a raycaster
const raycaster = new THREE.Raycaster();

// Listen for mouse clicks on the renderer element
renderer.domElement.addEventListener('click', onClick);

// Define the onClick function
function onClick(event) {
    // Calculate mouse position in normalized device coordinates (NDC)
    const mouse = new THREE.Vector2(
        (event.clientX / renderer.domElement.clientWidth) * 2 - 1,
        -(event.clientY / renderer.domElement.clientHeight) * 2 + 1
    );

    // Update the raycaster's origin and direction based on the mouse position
    raycaster.setFromCamera(mouse, camera);

    // Find intersected objects
    const intersects = raycaster.intersectObjects(scene.children, true);

    // If there are intersections, handle the first one
    if (intersects.length > 0) {
        const clickedObject = intersects[0].object;
        // Handle the click on the object
        handleClickOnObject(clickedObject);
    }
}

function handleClickOnObject(object) {
    if (object.name === 'vermelho' && buttonFlag) {

        if (throwFlag || !diceObject) {
            throwFlag = false;
            buttonFlag = false;
            if (!diceObject){
                diceInit();
            }
            const initialPosition = object.position.clone();
            const targetPosition = new THREE.Vector3().copy(initialPosition).add(new THREE.Vector3(0, -0.2, 0));

            // Define animation parameters
            const duration = 1000; // Animation duration in milliseconds
            const startTime = Date.now();
            
            // Define an animation loop
            function animate() {
                const currentTime = Date.now();
                const elapsedTime = currentTime - startTime;
                const t = THREE.MathUtils.clamp(elapsedTime / duration, 0, 1); // Ensure t is between 0 and 1
                
                // Interpolate position based on t
                const newPosition = initialPosition.clone().lerp(targetPosition, t);
                object.position.copy(newPosition);
                
                // Update renderer on each frame
                renderer.render(scene, camera);
                
                // Check if animation is complete
                if (t < 1) {
                    requestAnimationFrame(animate); // Continue animation
                } else {
                    // Animation complete, animate back up
                    animateBackUp();
                }
            }
            
            // Start the animation
            animate();
            
            // Define animation for moving back up
            function animateBackUp() {
                const startBackUpTime = Date.now();
                const initialPositionBackUp = object.position.clone();
                
                // Define an animation loop for moving back up
                function animateUp() {
                    const currentTimeBackUp = Date.now();
                    const elapsedTimeBackUp = currentTimeBackUp - startBackUpTime;
                    const tBackUp = THREE.MathUtils.clamp(elapsedTimeBackUp / duration, 0, 1); // Ensure tBackUp is between 0 and 1
                    
                    // Interpolate position based on tBackUp
                    const newPositionBackUp = initialPositionBackUp.clone().lerp(initialPosition, tBackUp);
                    object.position.copy(newPositionBackUp);
                    
                    // Check if animation is complete
                    if (tBackUp < 1) {
                        requestAnimationFrame(animateUp); // Continue animation
                    }
                    else{
                        buttonFlag = true;
                    }
                }
                
                // Start the back up animation
                animateUp();
            }  
            currentScore = DICE.throwDice(diceObject);
        }
    }
}

function verifyDiceFlag(){
    const { diceFlag, currentScore } = DICE.getDiceFlag();
    if (diceFlag){
        DICE.setDiceFlag();
        THIMBLE.moveThimble(currentScore);
    }
}

function checkPlaceHouse(){
    currentIndex = THIMBLE.getIndex();
    if (THIMBLE.getScoreFlag()){
        if (!forbiddenIdx.includes(currentIndex)){
                HOUSE.createHouse(function (houseMesh, body) {
                houseObject = {houseMesh,body};
                scene.add(houseObject.houseMesh);
                physicsWorld.addBody(houseObject.body);
                forbiddenIdx.push(currentIndex);
            },currentIndex);
        }
        THIMBLE.setScoreFlag();   
        throwFlag = true;
    }
}

// ----------------------------------------------- PROJECT RENDERING --------------------------------------------------
function animate() {
    requestAnimationFrame(animate);
    THIMBLE.animateThimbleMovement(thimbleObj);

    // Clamp phi to avoid flipping
    phi = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, phi));

    // Update camera position
    camera.position.x = radius * Math.sin(theta) * Math.cos(phi) * 1.5;
    camera.position.y = radius * Math.sin(phi) * 1.5;
    camera.position.z = radius * Math.cos(theta) * Math.cos(phi);
    
    // Update camera orientation
    camera.lookAt(0, 0, 0);

    physicsWorld.fixedStep();

    if (diceObject){
        diceObject.diceMesh.position.copy(diceObject.body.position);
        diceObject.diceMesh.quaternion.copy(diceObject.body.quaternion);
        verifyDiceFlag();
    }

    checkPlaceHouse();
    
    if (houseObject){
        houseObject.houseMesh.position.copy(houseObject.body.position);
        houseObject.houseMesh.quaternion.copy(houseObject.body.quaternion);
    }
    
    renderer.render(scene, camera);
}

initPhysics();
initScene();
animate();