import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import * as CANNON from 'https://cdn.skypack.dev/cannon-es';

// ----------------------------------------------- BUTTON --------------------------------------------------

export function createButton1(){
    var extrudeSettings = {
        amount : 2,
        steps : 1,
        bevelEnabled: false,
        curveSegments: 44
    };
    
    var arcShape = new THREE.Shape();
    arcShape.absarc(0, 0, 2, 0, Math.PI * 2, 0, false);
    
    var holePath = new THREE.Path();
    holePath.absarc(0, 0, 1.2, 0, Math.PI * 2, true);
    arcShape.holes.push(holePath);
    
    const hollowCgeometry = new THREE.ExtrudeGeometry(arcShape, extrudeSettings);
    
    // Define the material for the torus
    const hollowCmaterial = new THREE.MeshStandardMaterial({
        color: 0xF0FFF0, // Grey color
        metalness: 0.8, // Fully metallic
        roughness: 0.5, // Adjust the roughness as desired (0 to 1)
        side: THREE.DoubleSide // Render both sides of the faces
    });

    const buttonShape = new CANNON.Cylinder(2,2,2,32);
    const buttonBody = new CANNON.Body({
        mass: 0,
        shape: buttonShape,
        position: new CANNON.Vec3(0, 1.1, 0)
    });

    hollowCmaterial.castShadow = true;
    hollowCmaterial.receiveShadow = true;
    
    // Create the torus mesh
    const torus = new THREE.Mesh( hollowCgeometry, hollowCmaterial );
    
    // Set the position of the torus
    torus.position.set(0,1.1,0);
    torus.rotateX(Math.PI / 2);
    
    // Add the torus to the scene
    return {torus, body: buttonBody};
}

export function createButton2(){
    const redCylinderGeometry = new THREE.CylinderGeometry(1.2, 1.2, 1, 32);
    redCylinderGeometry.translate(0, -0.4, 0);

    const sphereGeometry = new THREE.SphereGeometry(1.6, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2)
    const sphereMaterial = new THREE.MeshStandardMaterial({
        color: 0xff0000, // Grey color
        metalness: 0.3, // Fully metallic
        roughness: 0.5, // Adjust the roughness as desired (0 to 1)
        side: THREE.DoubleSide // Render both sides of the faces
    });
    const bottomGeometry = new THREE.CircleGeometry(1.6, 32);

    // Enable shadows for the material
    sphereMaterial.castShadow = true;
    sphereMaterial.receiveShadow = true;


    const rotationAngle = Math.PI / 2; // 90 degrees
    const rotationMatrix = new THREE.Matrix4().makeRotationX(rotationAngle);
    bottomGeometry.applyMatrix4(rotationMatrix);

    const mergeSphere = BufferGeometryUtils.mergeGeometries([redCylinderGeometry, sphereGeometry,bottomGeometry]);
    const sphere = new THREE.Mesh(mergeSphere, sphereMaterial);
    sphere.position.set(0, 1.3, 0);

    const buttonShape = new CANNON.Sphere(1.6,1.6,1,32);
    const buttonBody = new CANNON.Body({
        mass: 0,
        shape: buttonShape,
        position: new CANNON.Vec3(0, 1.3, 0)
    });

    // Enable shadows for the mesh
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    sphere.name = 'vermelho';
    return {sphere,body: buttonBody};
}