// app.js

// Set up the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Set the background color of the scene to light grey
renderer.setClearColor(0xd3d3d3);  // Light grey color

// Add ambient light to the scene
const ambientLight = new THREE.AmbientLight(0xffffff); // White light
scene.add(ambientLight);

// Add a directional light to the scene
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 1, 1).normalize();
scene.add(directionalLight);

// Add a basic cube to the scene
const playerGeometry = new THREE.BoxGeometry();
const playerMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const playerCube = new THREE.Mesh(playerGeometry, playerMaterial);
playerCube.position.set(0, 0.5, 0); // Position the player cube slightly above the ground
scene.add(playerCube);

// Add an enemy to the scene
const enemyGeometry = new THREE.BoxGeometry();
const enemyMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
const enemyCube = new THREE.Mesh(enemyGeometry, enemyMaterial);
enemyCube.position.set(5, 0.5, 5);  // Position the enemy cube somewhere in the scene
scene.add(enemyCube);

// Set up the camera position
camera.position.set(0, 1.6, 5);  // Position the camera slightly above the ground
camera.lookAt(new THREE.Vector3(0, 0, 0)); // Make sure the camera looks at the origin

// Set up the controls
const controls = new THREE.PointerLockControls(camera, renderer.domElement);

// Lock the pointer when clicking
document.addEventListener('click', () => {
    controls.lock();
});

// Movement variables
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const clock = new THREE.Clock();
let isMovingForward = false, isMovingBackward = false, isMovingLeft = false, isMovingRight = false;

// Handle keydown and keyup events for player movement
document.addEventListener('keydown', (event) => {
    switch(event.code) {
        case 'KeyW': isMovingForward = true; break;
        case 'KeyS': isMovingBackward = true; break;
        case 'KeyA': isMovingLeft = true; break;
        case 'KeyD': isMovingRight = true; break;
    }
});
document.addEventListener('keyup', (event) => {
    switch(event.code) {
        case 'KeyW': isMovingForward = false; break;
        case 'KeyS': isMovingBackward = false; break;
        case 'KeyA': isMovingLeft = false; break;
        case 'KeyD': isMovingRight = false; break;
    }
});

// Enemy AI logic
function updateEnemy() {
    const distance = enemyCube.position.distanceTo(playerCube.position);
    const moveSpeed = 2;

    if (distance > 1) {
        // Move the enemy towards the player
        enemyCube.position.lerp(playerCube.position, 0.01); // Lerp for smooth movement
    }
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta(); // seconds.
    const moveSpeed = 10 * delta; // Speed of movement

    // Update movement direction
    direction.z = Number(isMovingForward) - Number(isMovingBackward);
    direction.x = Number(isMovingRight) - Number(isMovingLeft);
    direction.normalize(); // Normalize the direction vector

    // Move the camera
    if (isMovingForward || isMovingBackward || isMovingLeft || isMovingRight) {
        velocity.addScaledVector(direction, moveSpeed);
    } else {
        velocity.multiplyScalar(0.9); // Damping when no movement
    }

    controls.moveRight(-velocity.x);
    controls.moveForward(-velocity.z);

    // Update enemy
    updateEnemy();

    renderer.render(scene, camera);
}

animate();
