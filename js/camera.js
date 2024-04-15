import * as THREE from 'three';

const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );


camera.position.set(0, 19, 0); // Adjust Y value to position above the plane
camera.lookAt(plane.position);

window.addEventListener('resize', function () {
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
});

function cameraAnimate() {

    // Clamp phi to avoid flipping
    phi = Math.max(-Math.PI / 2 + 0.01, Math.min(Math.PI / 2 - 0.01, phi));

    // Update camera position
    camera.position.x = radius * Math.sin(theta) * Math.cos(phi) * 1.5;
    camera.position.y = radius * Math.sin(phi) * 1.5;
    camera.position.z = radius * Math.cos(theta) * Math.cos(phi);
    
    // Update camera orientation
    camera.lookAt(0, 0, 0);

}