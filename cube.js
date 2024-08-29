const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Resize the canvas to fill the window
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Grid dimensions
const gridSize = 10;
const blockSize = 1;

// Create a 3D array representing the world
const world = Array.from({ length: gridSize }, () =>
    Array.from({ length: gridSize }, () => Array(gridSize).fill(false))
);

const vertices = [
    [-1, -1, -1],
    [1, -1, -1],
    [1, 1, -1],
    [-1, 1, -1],
    [-1, -1, 1],
    [1, -1, 1],
    [1, 1, 1],
    [-1, 1, 1]
];

const edges = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 0],
    [4, 5],
    [5, 6],
    [6, 7],
    [7, 4],
    [0, 4],
    [1, 5],
    [2, 6],
    [3, 7]
];

const scale = 100;
const offsetX = canvas.width / 2;
const offsetY = canvas.height / 2;
let angleX = 0;
let angleY = 0;
let posX = 0;
let posY = 0;
let posZ = 0;
let velocityY = 0;
let jumping = false;

const gravity = -0.1;
const jumpStrength = 2;

function project(vertex) {
    const [x, y, z] = vertex;
    const cosX = Math.cos(angleX);
    const sinX = Math.sin(angleX);
    const cosY = Math.cos(angleY);
    const sinY = Math.sin(angleY);

    // Rotation around X axis
    let z1 = z * cosX - y * sinX;
    let y1 = y * cosX + z * sinX;

    // Rotation around Y axis
    let x1 = x * cosY - z1 * sinY;
    z1 = z1 * cosY + x * sinY;

    // Translate position
    x1 += posX;
    y1 += posY;
    z1 += posZ;

    // Perspective projection
    let scaleFactor = scale / (z1 + 4);
    let x2 = x1 * scaleFactor + offsetX;
    let y2 = y1 * scaleFactor + offsetY;

    return [x2, y2];
}

function drawCube(x, y, z) {
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.beginPath();

    edges.forEach(([start, end]) => {
        const [x1, y1] = project(vertices[start].map((v, i) => v + x * blockSize)[0]);
        const [x2, y2] = project(vertices[end].map((v, i) => v + x * blockSize)[0]);

        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
    });

    ctx.stroke();
}

function drawWorld() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
            for (let z = 0; z < gridSize; z++) {
                if (world[x][y][z]) {
                    drawCube(x - gridSize / 2, y - gridSize / 2, z - gridSize / 2);
                }
            }
        }
    }
}

function update() {
    if (jumping) {
        velocityY += gravity;
        posY += velocityY;

        if (posY <= 0) {
            posY = 0;
            velocityY = 0;
            jumping = false;
        }
    }
}

function animate() {
    angleX += 0.01;
    angleY += 0.01;
    update();
    drawWorld();
    requestAnimationFrame(animate);
}

function handleKeyDown(event) {
    const speed = 0.2;
    switch (event.key) {
        case 'w':
            posZ -= speed;
            break;
        case 's':
            posZ += speed;
            break;
        case 'a':
            posX -= speed;
            break;
        case 'd':
            posX += speed;
            break;
        case ' ':
            if (!jumping && posY === 0) {
                velocityY = jumpStrength;
                jumping = true;
            }
            break;
    }
}

function handleMouseClick(event) {
    const x = Math.floor(posX + gridSize / 2);
    const y = Math.floor(posY + gridSize / 2);
    const z = Math.floor(posZ + gridSize / 2);

    if (event.button === 0) { // Left click to place block
        if (x >= 0 && x < gridSize && y >= 0 && y < gridSize && z >= 0 && z < gridSize) {
            world[x][y][z] = true;
        }
    } else if (event.button === 2) { // Right click to break block
        if (x >= 0 && x < gridSize && y >= 0 && y < gridSize && z >= 0 && z < gridSize) {
            world[x][y][z] = false;
        }
    }
}

document.addEventListener('keydown', handleKeyDown);
document.addEventListener('mousedown', handleMouseClick);
canvas.oncontextmenu = e => e.preventDefault(); // Prevent context menu on right click

animate();
