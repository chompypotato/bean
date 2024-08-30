// Set up canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Game variables
const player = {
    x: canvas.width / 2,
    y: canvas.height - 30,
    width: 50,
    height: 20,
    speed: 5,
    color: 'white'
};

const bullets = [];
const bulletSpeed = 7;

document.addEventListener('keydown', (event) => {
    if (event.code === 'ArrowLeft') {
        player.x -= player.speed;
    } else if (event.code === 'ArrowRight') {
        player.x += player.speed;
    } else if (event.code === 'Space') {
        shoot();
    }
});

// Shoot a bullet
function shoot() {
    bullets.push({
        x: player.x + player.width / 2,
        y: player.y,
        width: 5,
        height: 10,
        color: 'red'
    });
}

// Game loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw player
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Update and draw bullets
    bullets.forEach((bullet, index) => {
        bullet.y -= bulletSpeed;
        ctx.fillStyle = bullet.color;
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

        // Remove bullets that have gone off-screen
        if (bullet.y < 0) {
            bullets.splice(index, 1);
        }
    });

    requestAnimationFrame(gameLoop);
}

// Start the game loop
gameLoop();

