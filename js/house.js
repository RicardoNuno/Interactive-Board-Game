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

export function createHouse(callback, currentIndex) {
    const loader = new GLTFLoader();

    loader.load('house.glb', function (gltf) {
        const houseMesh = gltf.scene;

        // Scale and position adjustments
        houseMesh.scale.set(0.3, 0.3, 0.3);

        // Adjust material properties
        houseMesh.traverse(function (child) {
            if (child.isMesh) {
                child.material.roughness = 1; // Adjust roughness (0 to 1)
                child.material.color.set(0xFFFFFF); // Gray color
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
            body.position.set(posMatrix[currentIndex][0]-offset2,20,posMatrix[currentIndex][2]-offset2);
            quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI / 2);
        }

        body.quaternion.copy(quaternion);

        // Invoke the callback with the house object
        callback(houseMesh, body);
    });
}