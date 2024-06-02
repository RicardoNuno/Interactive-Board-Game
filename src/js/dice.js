import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import * as CANNON from 'https://cdn.skypack.dev/cannon-es';

// ----------------------------------------------- DICES --------------------------------------------------
const params = {
    segments: 54,
    edgeRadius: 0.08,
    notchRadius: 0.15,
    notchDepth: 0.1,
};
let currentScore;
var diceFlag = false;

export function createDiceMesh() {
    const boxMaterialOuter = new THREE.MeshStandardMaterial({
        color: 0xeeeeee,
    })
    const boxMaterialInner = new THREE.MeshStandardMaterial({
        color: 0x000000,
        roughness: 0,
        metalness: 1,
        side: THREE.DoubleSide
    })

    const diceMesh = new THREE.Group();
    const innerMesh = new THREE.Mesh(createInnerGeometry(), boxMaterialInner);
    const outerMesh = new THREE.Mesh(createBoxGeometry(), boxMaterialOuter);
    outerMesh.castShadow = true;
    diceMesh.add(innerMesh, outerMesh);

    return diceMesh;
}

export function createDice(initialPositionY, diceMesh) {

    // Set the initial position of the dice
    diceMesh.position.set(0, initialPositionY, 0); // Adjust the X and Z position as needed

    const body = new CANNON.Body({
        mass: 1,
        shape: new CANNON.Box(new CANNON.Vec3(.5, .5, .5)),
        sleepTimeLimit: .1
    });

    body.position.set(0, 1, 0);

    return {diceMesh, body};
}

function createBoxGeometry() {
    const boxGeometry = new THREE.BoxGeometry(1, 1, 1, params.segments, params.segments, params.segments);

    const positionAttr = boxGeometry.attributes.position;
    const subCubeHalfSize = .5 - params.edgeRadius;
    const notchWave = (v) => params.notchDepth * (Math.cos(Math.PI * Math.max(-1, Math.min(1, (1 / params.notchRadius) * v))) + 1.);
    const notch = (pos) => notchWave(pos[0]) * notchWave(pos[1]);

    for (let i = 0; i < positionAttr.count; i++) {
        let position = new THREE.Vector3().fromBufferAttribute(positionAttr, i);
        const subCube = new THREE.Vector3(Math.sign(position.x), Math.sign(position.y), Math.sign(position.z)).multiplyScalar(subCubeHalfSize);
        const addition = new THREE.Vector3().subVectors(position, subCube);
        const absX = Math.abs(position.x), absY = Math.abs(position.y), absZ = Math.abs(position.z);

        if (absX > subCubeHalfSize && absY > subCubeHalfSize && absZ > subCubeHalfSize) {
            addition.normalize().multiplyScalar(params.edgeRadius);
            position = subCube.add(addition);
        } else if (absX > subCubeHalfSize && absY > subCubeHalfSize) {
            addition.z = 0;
            addition.normalize().multiplyScalar(params.edgeRadius);
            position.x = subCube.x + addition.x;
            position.y = subCube.y + addition.y;
        } else if (absX > subCubeHalfSize && absZ > subCubeHalfSize) {
            addition.y = 0;
            addition.normalize().multiplyScalar(params.edgeRadius);
            position.x = subCube.x + addition.x;
            position.z = subCube.z + addition.z;
        } else if (absY > subCubeHalfSize && absZ > subCubeHalfSize) {
            addition.x = 0;
            addition.normalize().multiplyScalar(params.edgeRadius);
            position.y = subCube.y + addition.y;
            position.z = subCube.z + addition.z;
        }

        const offset = .23;
        if (position.y === .5) position.y -= notch([position.x, position.z]);
        else if (position.x === .5) {
            position.x -= notch([position.y + offset, position.z + offset]);
            position.x -= notch([position.y - offset, position.z - offset]);
        } else if (position.z === .5) {
            position.z -= notch([position.x - offset, position.y + offset]);
            position.z -= notch([position.x, position.y]);
            position.z -= notch([position.x + offset, position.y - offset]);
        } else if (position.z === -.5) {
            position.z += notch([position.x + offset, position.y + offset]);
            position.z += notch([position.x + offset, position.y - offset]);
            position.z += notch([position.x - offset, position.y + offset]);
            position.z += notch([position.x - offset, position.y - offset]);
        } else if (position.x === -.5) {
            position.x += notch([position.y + offset, position.z + offset]);
            position.x += notch([position.y + offset, position.z - offset]);
            position.x += notch([position.y, position.z]);
            position.x += notch([position.y - offset, position.z + offset]);
            position.x += notch([position.y - offset, position.z - offset]);
        } else if (position.y === -.5) {
            position.y += notch([position.x + offset, position.z + offset]);
            position.y += notch([position.x + offset, position.z]);
            position.y += notch([position.x + offset, position.z - offset]);
            position.y += notch([position.x - offset, position.z + offset]);
            position.y += notch([position.x - offset, position.z]);
            position.y += notch([position.x - offset, position.z - offset]);
        }

        positionAttr.setXYZ(i, position.x, position.y, position.z);
    }

    boxGeometry.deleteAttribute('normal');
    boxGeometry.deleteAttribute('uv');
    const mergedGeometry = BufferGeometryUtils.mergeVertices(boxGeometry);
    mergedGeometry.computeVertexNormals();
    return mergedGeometry;
}



function createInnerGeometry() {
    const baseGeometry = new THREE.PlaneGeometry(1 - 2 * params.edgeRadius, 1 - 2 * params.edgeRadius);
    const offset = 0.48;

    const transformations = [
        { translate: [0, 0, offset] }, // Index 0
        { translate: [0, 0, -offset] }, // Index 1
        { rotate: [0.5 * Math.PI], translate: [0, -offset, 0], axis: 'x' }, // Index 2
        { rotate: [0.5 * Math.PI], translate: [0, offset, 0], axis: 'x' }, // Index 3
        { rotate: [0.5 * Math.PI], translate: [-offset, 0, 0] }, // Index 4
        { rotate: [0.5 * Math.PI], translate: [offset, 0, 0] } // Index 5
    ];

    const mergedGeometry = new THREE.BufferGeometry();
    const mergedPositions = [];
    const mergedIndices = [];
    let currentIndex = 0;

    transformations.forEach(transformation => {
        let geometry;
        if (transformation.rotate) {
            if (transformation.axis == 'x'){
                geometry = baseGeometry.clone().rotateX(transformation.rotate[0]);
            }
            else{
                geometry = baseGeometry.clone().rotateY(transformation.rotate[0]);
            }
        } else {
            geometry = baseGeometry.clone();
        }

        geometry.translate(...transformation.translate);

        const positions = geometry.attributes.position.array;
        const indices = geometry.index ? Array.from(geometry.index.array) : undefined;

        positions.forEach(position => mergedPositions.push(position));

        if (indices) {
            indices.forEach(index => mergedIndices.push(index + currentIndex));
        }

        currentIndex += positions.length / 3;
    });

    mergedGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(mergedPositions), 3));
    if (mergedIndices.length > 0) {
        mergedGeometry.setIndex(mergedIndices);
    }

    return mergedGeometry;
}

export function addDiceEvents(dice) {
    dice.body.addEventListener('sleep', handleSleepEvent);
}

function handleSleepEvent(event) {
    const euler = new CANNON.Vec3();
    event.target.quaternion.toEuler(euler);

    const epsilon = 0.1;
    const isZero = angle => Math.abs(angle) < epsilon;
    const isHalfPi = angle => Math.abs(angle - 0.5 * Math.PI) < epsilon;
    const isMinusHalfPi = angle => Math.abs(0.5 * Math.PI + angle) < epsilon;
    const isPiOrMinusPi = angle => Math.abs(Math.PI - angle) < epsilon || Math.abs(Math.PI + angle) < epsilon;

    if (isZero(euler.z)) {
        if (isZero(euler.x)) {
            diceResult(1);
        } else if (isHalfPi(euler.x)) {
            diceResult(4);
        } else if (isMinusHalfPi(euler.x)) {
            diceResult(3);
        } else if (isPiOrMinusPi(euler.x)) {
            diceResult(6);
        } else {
            diceFlag = true; // Landed on edge; wait to fall on side and fire the event again
        }
    } else if (isHalfPi(euler.z)) {
        diceResult(2);
    } else if (isMinusHalfPi(euler.z)) {
        diceResult(5);
    } else {
        diceFlag = true; // Landed on edge; wait to fall on side and fire the event again
    }
}

function diceResult(score) {
    currentScore = score;
    diceFlag = true;
}


export function throwDice(dice) {
    resetDicePhysics(dice);
    randomizeDicePosition(dice);
    applyRandomImpulse(dice);
    allowDiceSleep(dice);
}

function resetDicePhysics(dice) {
    dice.body.velocity.setZero();
    dice.body.angularVelocity.setZero();
}

function randomizeDicePosition(dice) {
    const randomXRotation = 2 * Math.PI * Math.random();
    const randomZRotation = 2 * Math.PI * Math.random();
    dice.diceMesh.rotation.set(randomXRotation, 0, randomZRotation);

    dice.body.position.set(0, 5, 0);
    dice.diceMesh.position.copy(dice.body.position);

    dice.body.quaternion.copy(dice.diceMesh.quaternion);
}

function applyRandomImpulse(dice) {
    const force = 3 + 5 * Math.random();
    const impulse = new CANNON.Vec3(-force, force, 0);
    const offset = new CANNON.Vec3(0, 0, 0.2);
    dice.body.applyImpulse(impulse, offset);
}

function allowDiceSleep(dice) {
    dice.body.allowSleep = true;
}

export function getDiceFlag(){
    return {diceFlag, currentScore};
}

export function setDiceFlag(){
    diceFlag = false;
}