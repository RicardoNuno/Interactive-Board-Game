import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );
renderer.setPixelRatio(window.devicePixelRatio);

var planeGeometry = new THREE.BoxGeometry(25, 25, 0.5); // Example dimensions

var textureLoader = new THREE.TextureLoader();
var monopolyTexture = textureLoader.load('/test.jpg');

var planeMaterial = new THREE.MeshBasicMaterial({ map: monopolyTexture });
var plane = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(plane);

var axesHelper = new THREE.AxesHelper(50); // The parameter is the length of the axes
scene.add(axesHelper);

camera.position.set(0, 30, 0); // Adjust Y value to position above the plane
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
let radius = 24;

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
    if (keyCode == 189) {
        radius += 0.1;
    }
}

renderer.domElement.addEventListener("mousedown", mouseDown);
renderer.domElement.addEventListener("mouseup", mouseUp);
renderer.domElement.addEventListener("mousemove", mouseMove);

document.addEventListener("keydown", onDocumentKeyDown, false);

window.addEventListener('resize', function () {
    renderer.setSize(window.innerWidth, window.innerHeight);
    const aspect = window.innerWidth / window.innerHeight;
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
});

function animate() {
	requestAnimationFrame( animate );

    // updating camera position and orientation
    camera.position.x = radius * Math.sin(theta) * Math.cos(phi) * 1.5;
    camera.position.y = radius * Math.sin(phi) * 1.5;
    camera.position.z = radius * Math.cos(theta) * Math.cos(phi);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    camera.updateMatrix();
	renderer.render( scene, camera );
}

animate();