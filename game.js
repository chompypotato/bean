const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const healthDisplay = document.getElementById('health');
const ammoDisplay = document.getElementById('ammo');

const player = {
    x: canvas.width / 2,
    y: canvas.height - 50,
    width: 30,
    height: 30,
    speed: 5,
    health: 100
};

const bullets = [];
const enemies = [];
const bulletSpeed = 7;
const enemySpeed = 2;
const maxAmmo = 30; // Increased ammo capacity
let ammo = maxAmmo;
let lastShotTime = 0;
const shootDelay = 100; // Time in milliseconds between shots
const reloadTime = 2000; // Time in milliseconds to reload bullets
let isReloading = false; // Track if reloading is in progress
let reloadStartTime = 0; // Track when reloading started

function update() {
    movePlayer();
    moveBullets();
    moveEnemies();
    checkCollisions();
    updateDisplay();
    spawnEnemies();
    draw();
    handleReloading();
    requestAnimationFrame(update);
}

function movePlayer() {
    if (keys['w']) player.y -= player.speed;
    if (keys['s']) player.y += player.speed;
    if (keys['a']) player.x -= player.speed;
    if (keys['d']) player.x += player.speed;

    // Boundaries
    if (player.x < 0) player.x = 0;
    if (player.x > canvas.width - player.width) player.x = canvas.width - player.width;
    if (player.y < 0) player.y = 0;
    if (player.y > canvas.height - player.height) player.y = canvas.height - player.height;
}

function moveBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        bullets[i].y -= bulletSpeed;
        if (bullets[i].y < 0) {
            bullets.splice(i, 1);
        }
    }
}

function moveEnemies() {
    for (let i = enemies.length - 1; i >= 0; i--) {
        enemies[i].y += enemySpeed;
        if (enemies[i].y > canvas.height) {
            enemies.splice(i, 1);
        }
    }
}

function checkCollisions() {
    // Check for collisions between bullets and enemies
    for (let i = bullets.length - 1; i >= 0; i--) {
        for (let j = enemies.length - 1; j >= 0; j--) {
            if (bullets[i].x < enemies[j].x + enemies[j].width &&
                bullets[i].x + bullets[i].width > enemies[j].x &&
                bullets[i].y < enemies[j].y + enemies[j].height &&
                bullets[i].y + bullets[i].height > enemies[j].y) {
                // Remove bullet and enemy
                bullets.splice(i, 1);
                enemies.splice(j, 1);
                break;
            }
        }
    }

    // Check for collisions between enemies and player
    for (let enemy of enemies) {
        if (player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.height > enemy.y) {
            // Player hit
            player.health -= 10;
            healthDisplay.textContent = player.health;
            enemies.splice(enemies.indexOf(enemy), 1);
            if (player.health <= 0) {
                alert('Game Over!');
                location.reload();
            }
            break;
        }
    }
}

function spawnEnemies() {
    if (Math.random() < 0.02) {
        enemies.push({
            x: Math.random() * (canvas.width - 30),
            y: 0,
            width: 30,
            height: 30
        });
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw player (bean) with brown color
    ctx.fillStyle = 'saddlebrown'; // Use a brown color
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Draw bullets
    ctx.fillStyle = 'black';
    for (let bullet of bullets) {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    }

    // Draw enemies
    ctx.fillStyle = 'red';
    for (let enemy of enemies) {
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    }
}

function updateDisplay() {
    ammoDisplay.textContent = ammo;
}

function handleReloading() {
    if (isReloading) {
        const now = Date.now();
        if (now - reloadStartTime >= reloadTime) {
            ammo = maxAmmo; // Refill ammo
            isReloading = false; // End reloading
            updateDisplay(); // Update ammo display after reloading
        }
    }
}

const keys = {};
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.key === 'r') {
        if (!isReloading && ammo < maxAmmo) {
            isReloading = true;
            reloadStartTime = Date.now();
        }
    }
});
document.addEventListener('keyup', (e) => keys[e.key] = false);

document.addEventListener('click', () => {
    if (!isReloading) {
        const now = Date.now();
        if (ammo > 0 && now - lastShotTime > shootDelay) { // Time between shots
            bullets.push({
                x: player.x + player.width / 2 - 5,
                y: player.y,
                width: 10,
                height: 20
            });
            ammo--;
            lastShotTime = now;
            updateDisplay(); // Update ammo display after shooting
        }
    }
});

update();
