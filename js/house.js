import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as CANNON from 'https://cdn.skypack.dev/cannon-es';

// ----------------------------------------------- HOUSE --------------------------------------------------
let house;
const posMove = 2;
const offset = 1.25;
const offset2 = 0.5;
const posMatrix =   [
                        [11.5,0.1,9],[8.25,0.1,9],[8.25-posMove*1,0.1,9],[8.25-posMove*2,0.1,9],[8.25-posMove*3,0.1,9],[8.25-posMove*4,0.1,9],[8.25-posMove*5,0.1,9],[8.25-posMove*6,0.1,9],[8.25-posMove*7,0.1,9],
                        [-9,0.1,9],[-9,0.1,5.75],[-9,0.1,5.75-posMove*1],[-9,0.1,5.75-posMove*2],[-9,0.1,5.75-posMove*3],[-9,0.1,5.75-posMove*4],[-9,0.1,5.75-posMove*5],[-9,0.1,5.75-posMove*6],[-9,0.1,5.75-posMove*7],
                        [-9,0.1,-11.5],[-5.75,0.1,-11.5],[-5.75+posMove*1,0.1,-11.5],[-5.75+posMove*2,0.1,-11.5],[-5.75+posMove*3,0.1,-11.5],[-5.75+posMove*4,0.1,-11.5],[-5.75+posMove*5,0.1,-11.5],[-5.75+posMove*6,0.1,-11.5],[-5.75+posMove*7,0.1,-11.5],
                        [11.5,0.1,-11.5],[11.5,0.1,-8.25],[11.5,0.1,-8.25+posMove*1],[11.5,0.1,-8.25+posMove*2],[11.5,0.1,-8.25+posMove*3],[11.5,0.1,-8.25+posMove*4],[11.5,0.1,-8.25+posMove*5],[11.5,0.1,-8.25+posMove*6],[11.5,0.1,-8.25+posMove*7]
                    ];
let houseFlag = false;

const colors = [0xDE8FCC,
                0xF8B5D3,
                0xF18D89,
                0xFBCA38,
                0xFEF7AF,
                0xDEF0B2,
                0xA7E4F4,
                0x73C8D9];

export function createHouse(callback, currentIndex) {
    const loader = new GLTFLoader();

    const sound = new Audio('fall.wav');
    sound.playbackRate = 1.65;
    sound.volume = 0.5;

    sound.play();
    loader.load('house.glb', function (gltf) {
        const houseMesh = gltf.scene;

        // Scale and position adjustments
        houseMesh.scale.set(0.3, 0.3, 0.3);

        let houseColor;
        if (currentIndex<4){
            houseColor = colors[0];
        }
        else if (currentIndex<9){
            houseColor = colors[1];
        }
        else if (currentIndex<14){
            houseColor = colors[2];
        }
        else if (currentIndex<18){
            houseColor = colors[3];
        }
        else if (currentIndex<22){
            houseColor = colors[4];
        }
        else if (currentIndex<27){
            houseColor = colors[5];
        }
        else if (currentIndex<32){
            houseColor = colors[6];
        }
        else{
            houseColor = colors[7];
        }

        // Adjust material properties
        houseMesh.traverse(function (child) {
            if (child.isMesh) {
                child.material.roughness = 1; // Adjust roughness (0 to 1)
                child.material.color.set(houseColor); // Gray color
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });


        const body = new CANNON.Body({
            mass: 1,
            shape: new CANNON.Box(new CANNON.Vec3(0, 0, 0))
        });
        const quaternion = new CANNON.Quaternion();

        if (currentIndex < 9){
            body.position.set(posMatrix[currentIndex][0]-offset,20,posMatrix[currentIndex][2]-offset2);
            quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI / 2);
        }
        else if (currentIndex<18){
            body.position.set(posMatrix[currentIndex][0]+offset2,20,posMatrix[currentIndex][2]+offset);
        }
        else if(currentIndex<27){
            body.position.set(posMatrix[currentIndex][0]-offset,20,posMatrix[currentIndex][2]+3);
            quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI / 2);
        }
        else{
            body.position.set(posMatrix[currentIndex][0]-3,20,posMatrix[currentIndex][2]+offset); 
        }

        body.quaternion.copy(quaternion);

        callback(houseMesh, body);
    });
}