const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const GRAVITY = 0.5;
const PLAYER_WIDTH = 50;
const PLAYER_HEIGHT = 50;
const PLAYER_SPEED = 5;
const JUMP_FORCE = -10;
const BULLET_SPEED = 5;

// Platforms
const platforms = [
    { x: 100, y: canvas.height - 150, width: 200, height: 20 },
    { x: 400, y: canvas.height - 250, width: 200, height: 20 },
    { x: 700, y: canvas.height - 350, width: 200, height: 20 }
];

let keys = {};
let player = {
    x: canvas.width / 2,
    y: canvas.height - PLAYER_HEIGHT,
    width: PLAYER_WIDTH,
    height: PLAYER_HEIGHT,
    dx: 0,
    dy: 0,
    jumping: false
};

let bullets = [];

// Event listeners
window.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

window.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Game loop
function update() {
    // Player movement
    if (keys['ArrowLeft']) {
        player.dx = -PLAYER_SPEED;
    } else if (keys['ArrowRight']) {
        player.dx = PLAYER_SPEED;
    } else {
        player.dx = 0;
    }
    
    if (keys[' ']) {
        if (!player.jumping) {
            player.dy = JUMP_FORCE;
            player.jumping = true;
        }
    }

    // Update player position
    player.x += player.dx;
    player.y += player.dy;
    
    // Apply gravity
    player.dy += GRAVITY;

    // Check for platform collision
    let onGround = false;
    platforms.forEach(platform => {
        if (player.x < platform.x + platform.width &&
            player.x + player.width > platform.x &&
            player.y + player.height > platform.y &&
            player.y < platform.y + platform.height) {
                
            player.y = platform.y - player.height;
            player.dy = 0;
            player.jumping = false;
            onGround = true;
        }
    });

    if (!onGround && player.y > canvas.height - PLAYER_HEIGHT) {
        player.y = canvas.height - PLAYER_HEIGHT;
        player.dy = 0;
        player.jumping = false;
    }

    // Bullet movement
    bullets.forEach((bullet, index) => {
        bullet.x += bullet.dx;
        if (bullet.x > canvas.width || bullet.x < 0) {
            bullets.splice(index, 1);
        }
    });

    // Draw everything
    draw();
    
    requestAnimationFrame(update);
}

// Draw function
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw platforms
    ctx.fillStyle = 'gray';
    platforms.forEach(platform => {
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    });

    // Draw player
    ctx.fillStyle = 'red';
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Draw bullets
    ctx.fillStyle = 'black';
    bullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, 10, 5);
    });
}

// Shooting bullets
window.addEventListener('mousedown', () => {
    let bullet = {
        x: player.x + PLAYER_WIDTH / 2,
        y: player.y + PLAYER_HEIGHT / 2,
        dx: BULLET_SPEED
    };
    bullets.push(bullet);
});

// Start the game
update();
