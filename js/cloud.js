import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as CANNON from 'https://cdn.skypack.dev/cannon-es';

const posMove = 2;
const height = 3;
const posMatrix =   [
    [11.5,height,9],[8.25,height,9],[8.25-posMove*1,height,9],[8.25-posMove*2,height,9],[8.25-posMove*3,height,9],[8.25-posMove*4,height,9],[8.25-posMove*5,height,9],[8.25-posMove*6,height,9],[8.25-posMove*7,height,9],
    [-9,height,9],[-9,height,5.75],[-9,height,5.75-posMove*1],[-9,height,5.75-posMove*2],[-9,height,5.75-posMove*3],[-9,height,5.75-posMove*4],[-9,height,5.75-posMove*5],[-9,height,5.75-posMove*6],[-9,height,5.75-posMove*7],
    [-9,height,-11.5],[-5.75,height,-11.5],[-5.75+posMove*1,height,-11.5],[-5.75+posMove*2,height,-11.5],[-5.75+posMove*3,height,-11.5],[-5.75+posMove*4,height,-11.5],[-5.75+posMove*5,height,-11.5],[-5.75+posMove*6,height,-11.5],[-5.75+posMove*7,height,-11.5],
    [11.5,height,-11.5],[11.5,height,-8.25],[11.5,height,-8.25+posMove*1],[11.5,height,-8.25+posMove*2],[11.5,height,-8.25+posMove*3],[11.5,height,-8.25+posMove*4],[11.5,height,-8.25+posMove*5],[11.5,height,-8.25+posMove*6],[11.5,height,-8.25+posMove*7]
];

// ----------------------------------------------- CLOUD --------------------------------------------------
export function createCloud(callback, currentIndex = 0) {
    const loader = new GLTFLoader();

    loader.load('cloud.glb', function (gltf) {
        const cloudMesh = gltf.scene;

        // Scale and initial position adjustments
        cloudMesh.scale.set(0.25, 0.25, 0.25);
        cloudMesh.position.set(posMatrix[currentIndex][0], posMatrix[currentIndex][1], posMatrix[currentIndex][2]);

        // Adjust material properties
        cloudMesh.traverse(function (child) {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        const body = new CANNON.Body({
            mass: 1,
            shape: new CANNON.Box(new CANNON.Vec3(0.25, 0.25, 0.25))
        });
        body.position.set(posMatrix[currentIndex][0], posMatrix[currentIndex][1], posMatrix[currentIndex][2]);

        callback(cloudMesh, body);

        // Function to animate the cloud's movement
        cloudMesh.moveTo = function (newIndex, duration = 1) {
            const startPosition = cloudMesh.position.clone();
            const endPosition = new THREE.Vector3(posMatrix[newIndex][0], posMatrix[newIndex][1], posMatrix[newIndex][2]);

            const startTime = clock.getElapsedTime();

            function updatePosition() {
                const elapsed = clock.getElapsedTime() - startTime;
                const t = Math.min(elapsed / duration, 1);

                cloudMesh.position.lerpVectors(startPosition, endPosition, t);
                body.position.copy(cloudMesh.position);

                if (t < 1) {
                    requestAnimationFrame(updatePosition);
                }
            }

            updatePosition();
        };
    });
}
