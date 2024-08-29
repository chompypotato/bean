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

    // Check for floor collision
    if (player.y > canvas.height - PLAYER_HEIGHT) {
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
