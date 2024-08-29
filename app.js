// app.js

// Set up the scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add a basic cube to the scene
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Set up the camera position
camera.position.set(0, 1.6, 5);  // Position the camera slightly above the ground
camera.rotation.set(0, Math.PI, 0); // Face the camera toward the cube

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

// Handle keydown and keyup events
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

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta(); // seconds.
    const moveSpeed = 10 * delta; // Speed of movement

    // Update movement
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

    renderer.render(scene, camera);
}

animate();
