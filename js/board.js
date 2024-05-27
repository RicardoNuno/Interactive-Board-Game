import * as THREE from 'three';
// ----------------------------------------------- BOARD --------------------------------------------------
export function createBoard(){
    var boardGeometry = new THREE.BoxGeometry(25, 25, 0.2); // Example dimensions
    var textureLoader = new THREE.TextureLoader();
    var monopolyTexture = textureLoader.load('/ricardopolio.png');
    var rulesTexture = textureLoader.load('/rules.png')
    // Adjust the mipmap bias for texture filtering
    monopolyTexture.generateMipmaps = false; // Disable automatic mipmap generation
    monopolyTexture.magFilter = THREE.LinearFilter; // Use linear filtering for magnification
    monopolyTexture.minFilter = THREE.LinearMipmapLinearFilter; // Use linear filtering for minification

    rulesTexture.generateMipmaps = false; // Disable automatic mipmap generation
    rulesTexture.magFilter = THREE.LinearFilter; // Use linear filtering for magnification
    rulesTexture.minFilter = THREE.LinearMipmapLinearFilter; // Use linear filtering for minification

    const boardMaterials = [
        new THREE.MeshBasicMaterial({ color: 0x000000 }), // Right side (black)
        new THREE.MeshBasicMaterial({ color: 0x000000 }), // Left side (black)
        new THREE.MeshBasicMaterial({ color: 0x000000 }), // Top side (black)
        new THREE.MeshBasicMaterial({ color: 0x000000 }), // Bottom side (black)
        new THREE.MeshBasicMaterial({ map: monopolyTexture }), // Front side (with texture)
        new THREE.MeshBasicMaterial({ map: rulesTexture }) // Back side (Yellow)
    ];

    // Create a material with different sides
    var board = new THREE.Mesh(boardGeometry, boardMaterials);
    board.receiveShadow = true;
    board.rotateX(-Math.PI / 2);

    return board;
}

export function createFloor() {
    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(25, 25),
        new THREE.ShadowMaterial({
            opacity: .1
        })
    )
    floor.receiveShadow = true;
    floor.position.y = 0.101;
    floor.quaternion.setFromAxisAngle(new THREE.Vector3(-1, 0, 0), Math.PI * .5);
    return floor;
}