const canvas = document.getElementById('gameCanvas');
const gl = canvas.getContext('webgl');

if (!gl) {
    alert('WebGL not supported');
}

// Adjust canvas size
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const vertexShaderSource = `
    attribute vec4 a_position;
    uniform mat4 u_projectionMatrix;
    uniform mat4 u_modelViewMatrix;
    void main() {
        gl_Position = u_projectionMatrix * u_modelViewMatrix * a_position;
    }
`;

const fragmentShaderSource = `
    precision mediump float;
    uniform vec4 u_color;
    void main() {
        gl_FragColor = u_color;
    }
`;

// Utility function to create and compile a shader
function compileShader(gl, source, type) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

// Create and link the shader program
function createProgram(gl, vsSource, fsSource) {
    const vertexShader = compileShader(gl, vsSource, gl.VERTEX_SHADER);
    const fragmentShader = compileShader(gl, fsSource, gl.FRAGMENT_SHADER);
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program link error:', gl.getProgramInfoLog(program));
        return null;
    }
    return program;
}

const program = createProgram(gl, vertexShaderSource, fragmentShaderSource);

const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
const projectionMatrixLocation = gl.getUniformLocation(program, 'u_projectionMatrix');
const modelViewMatrixLocation = gl.getUniformLocation(program, 'u_modelViewMatrix');
const colorLocation = gl.getUniformLocation(program, 'u_color');

// Define vertices for a cube
const vertices = new Float32Array([
    -0.5, -0.5, -0.5,
    0.5, -0.5, -0.5,
    0.5, 0.5, -0.5,
    -0.5, 0.5, -0.5,
    -0.5, -0.5, 0.5,
    0.5, -0.5, 0.5,
    0.5, 0.5, 0.5,
    -0.5, 0.5, 0.5,
]);

const indices = new Uint16Array([
    0, 1, 2, 0, 2, 3,
    4, 5, 6, 4, 6, 7,
    0, 1, 5, 0, 5, 4,
    2, 3, 7, 2, 7, 6,
    0, 3, 7, 0, 7, 4,
    1, 2, 6, 1, 6, 5
]);

// Create and bind buffers
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

const indexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

function setupShaderAttributes() {
    gl.useProgram(program);
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 0, 0);
}

const projectionMatrix = mat4.create();
const modelViewMatrix = mat4.create();

function updateProjectionMatrix() {
    mat4.perspective(projectionMatrix, Math.PI / 4, canvas.width / canvas.height, 0.1, 100);
}

function updateModelViewMatrix() {
    mat4.lookAt(modelViewMatrix, [0, 0, 5], [0, 0, 0], [0, 1, 0]);
}

const bullets = [];
const bulletSpeed = 0.02;
let maxBullets = 10;
let currentBullets = maxBullets;

function shootBullet() {
    if (currentBullets > 0) {
        bullets.push({x: 0, y: 0, z: 0});
        currentBullets--;
        updateBulletCountDisplay();
    }
}

function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i];
        bullet.z -= bulletSpeed;
        if (bullet.z < -10) {
            bullets.splice(i, 1);
        }
    }
}

function drawBullets() {
    gl.useProgram(program);
    gl.uniform4f(colorLocation, 1.0, 0.0, 0.0, 1.0); // Red color
    for (const bullet of bullets) {
        mat4.translate(modelViewMatrix, modelViewMatrix, [bullet.x, bullet.y, bullet.z]);
        drawCube();
        mat4.translate(modelViewMatrix, modelViewMatrix, [-bullet.x, -bullet.y, -bullet.z]);
    }
}

function updateBulletCountDisplay() {
    document.getElementById('bulletCount').textContent = `Bullets: ${currentBullets}`;
}

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        shootBullet();
    }
});

function drawCube() {
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    gl.uniformMatrix4fv(projectionMatrixLocation, false, projectionMatrix);
    gl.uniformMatrix4fv(modelViewMatrixLocation, false, modelViewMatrix);

    gl.uniform4f(colorLocation, 0.0, 1.0, 0.0, 1.0); // Green color for cube
    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);
}

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    updateProjectionMatrix();
    updateModelViewMatrix();
    
    drawCube();
    updateBullets();
    drawBullets();
    
    requestAnimationFrame(render);
}

gl.clearColor(0.0, 0.0, 0.0, 1.0);
gl.enable(gl.DEPTH_TEST);

setupShaderAttributes();
render();
