/**
 * ============================================================================
 * Bouncing Balls Effect Module
 * ============================================================================
 * Creates particles on mouse movement that fall with gravity and bounce.
 */

let particlesArray = [];
let animationFrameId;
let canvas, ctx;
let isRunning = false;

// Helper to convert hex color to an RGB string for use in rgba()
function hexToRgb(hex) {
    let r = 0, g = 0, b = 0;
    if (hex.length == 4) { // 3-digit hex
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length == 7) { // 6-digit hex
        r = parseInt(hex[1] + hex[2], 16);
        g = parseInt(hex[3] + hex[4], 16);
        b = parseInt(hex[5] + hex[6], 16);
    }
    return `${r},${g},${b}`;
}

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;

        // Give a slight random initial velocity
        this.speedX = (Math.random() - 0.5) * 4;
        this.speedY = (Math.random() - 0.5) * 2;
        
        this.size = Math.random() * 2 + 1; // Smaller particle size
        this.gravity = 0.2;
        this.bounceDamping = 0.7; // Energy lost on each bounce

        this.color = getComputedStyle(document.documentElement).getPropertyValue('--accent-gold-light').trim() || '#f3e5ab';
        
        this.life = 1; // Represents opacity
        this.decayRate = 0.005; // Fades out slowly over time
    }

    update() {
        // Apply gravity to vertical speed
        this.speedY += this.gravity;

        // Move particle
        this.x += this.speedX;
        this.y += this.speedY;

        // Bounce off the bottom of the screen
        if (this.y + this.size > canvas.height) {
            this.y = canvas.height - this.size; // Prevent sinking below the floor
            this.speedY *= -this.bounceDamping; // Reverse and dampen vertical speed
            
            // If the bounce is very small, reduce life faster to "settle" and die
            if (Math.abs(this.speedY) < 1) {
                this.life -= 0.1;
            }
        }
        
        // Bounce off the sides of the screen
        if (this.x + this.size > canvas.width || this.x - this.size < 0) {
            this.speedX *= -1;
        }

        // Gradual decay of the particle's life
        this.life -= this.decayRate;
        if (this.life < 0) this.life = 0;
    }

    draw() {
        if (this.life <= 0) return; // Don't draw dead particles

        const rgbColor = hexToRgb(this.color);
        ctx.fillStyle = `rgba(${rgbColor}, ${this.life})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function handleParticles() {
    for (let i = particlesArray.length - 1; i >= 0; i--) {
        particlesArray[i].update();
        particlesArray[i].draw();

        if (particlesArray[i].life <= 0) {
            particlesArray.splice(i, 1);
        }
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    handleParticles();
    animationFrameId = requestAnimationFrame(animate);
}

// A list of selectors for UI elements over which the effect should be disabled.
const noDrawSelectors = ['#sidebar', '#settings-panel', '#letter-modal-container', '.content-card', 'select', 'input', 'a'];

const handleMouseMove = (e) => {
    // Check if the cursor is hovering over a designated "no-draw" zone.
    const isOverNoDrawZone = noDrawSelectors.some(selector => e.target.closest(selector));
    if (isOverNoDrawZone) {
        return; // Do not create particles if hovering over a card or interactive element.
    }

    // Lower the spawn rate by only creating particles on some move events
    if (Math.random() > 0.7) return;

    // Create one particle per valid mouse move event, with a cap on the total number.
    if (particlesArray.length < 400) { // Increased total particle count
        const spawnRadius = 40;
        const spawnX = e.clientX + (Math.random() - 0.5) * spawnRadius;
        const spawnY = e.clientY + (Math.random() - 0.5) * spawnRadius;
        particlesArray.push(new Particle(spawnX, spawnY));
    }
};

const handleThemeChange = () => {
    setTimeout(() => {
        const newColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-gold-light').trim() || '#f3e5ab';
        if (newColor) {
            particlesArray.forEach(p => p.color = newColor);
        }
    }, 50);
};

function start() {
    if (isRunning) return;
    isRunning = true;

    canvas = document.getElementById('overlay-canvas');
    if (!canvas) { isRunning = false; return; }

    canvas.style.display = 'block';

    ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    animate();

    document.addEventListener('mousemove', handleMouseMove);
    document.getElementById('theme-select').addEventListener('change', handleThemeChange);
}

function stop() {
    if (!isRunning) return;
    isRunning = false;

    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    particlesArray = [];

    if (canvas) {
        canvas.style.display = 'none';
        document.removeEventListener('mousemove', handleMouseMove);
        const themeSelect = document.getElementById('theme-select');
        if (themeSelect) themeSelect.removeEventListener('change', handleThemeChange);
    }
}

export const bouncingBallsFx = { start, stop };