/**
 * ============================================================================
 * Fireflies Effect Module
 * ============================================================================
 * Creates glowing particles on mouse movement that gradually disappear and spread.
 */

let particlesArray = [];
let animationFrameId;
let canvas, ctx;
let mouseX, mouseY;
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

        // Create a smooth outward burst effect
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 2.5 + 1; // Increased initial burst speed for more distance
        this.speedX = Math.cos(angle) * speed;
        this.speedY = Math.sin(angle) * speed;
        this.friction = 0.97; // Slightly less friction to travel further

        this.color = getComputedStyle(document.documentElement).getPropertyValue('--accent-gold-light').trim() || '#f3e5ab';
        
        // --- New Continuous Pulse & Decay Logic ---
        // 1. Size similar to sparkles.js
        this.maxSize = Math.random() * 1.5 + 1; // Max pulse size (e.g., 1 to 2.5)
        this.minSize = 0.2;
        this.size = Math.random() * this.maxSize; // Start at a random size within its pulse range
        
        // 2. Pulsing properties
        this.isGrowing = Math.random() > 0.5;
        this.pulseSpeed = Math.random() * 0.04 + 0.02; // Speed of the pulse

        // 3. Gradual decay properties
        this.life = 1; // Controls overall lifetime/opacity
        this.decayRate = Math.random() * 0.003 + 0.001; // Slower decay for longer lifetime
    }

    update() {
        // Apply friction to slow the particle down for a smooth stop
        this.speedX *= this.friction;
        this.speedY *= this.friction;
        this.x += this.speedX;
        this.y += this.speedY;

        // Gradual decay of lifetime and max pulse size
        this.life -= this.decayRate;
        this.maxSize -= this.decayRate * 2; // Max size shrinks over time

        if (this.maxSize < this.minSize) {
            this.life = 0; // Kill particle if its max pulse size is too small
        }

        // Continuous pulsing logic
        if (this.isGrowing) {
            this.size += this.pulseSpeed; // Grow
            if (this.size >= this.maxSize) {
                this.size = this.maxSize;
                this.isGrowing = false;
            }
        } else {
            this.size -= this.pulseSpeed; // Shrink
            if (this.size <= this.minSize) {
                this.size = this.minSize;
                this.isGrowing = true;
            }
        }
        if (this.life <= 0) this.life = 0;
    }

    draw() {
        if (this.life <= 0) return; // Don't draw dead particles

        // Create a radial gradient for a soft glow
        const rgbColor = hexToRgb(this.color);
        const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
        gradient.addColorStop(0, `rgba(${rgbColor}, ${this.life})`); // Center is bright
        gradient.addColorStop(0.8, `rgba(${rgbColor}, ${this.life * 0.5})`);
        gradient.addColorStop(1, `rgba(${rgbColor}, 0)`); // Edge is transparent

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function handleFireflies() {
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
    handleFireflies();
    animationFrameId = requestAnimationFrame(animate);
}

// A list of selectors for UI elements over which the effect should be disabled for performance and usability.
const noDrawSelectors = [
    '#sidebar',
    '#settings-panel',
    '#letter-modal-container',
    '.content-card', // Disable effect over content cards, but not the main content background.
    'select',
    'input',
    'a'
];

const handleMouseMove = (e) => {
    // Check if the cursor is hovering over a designated "no-draw" zone.
    const isOverNoDrawZone = noDrawSelectors.some(selector => e.target.closest(selector));
    if (isOverNoDrawZone) {
        return; // Do not create particles if hovering over a card or interactive element.
    }

    mouseX = e.clientX;
    mouseY = e.clientY;

    // Create a small burst of particles at the cursor location
    const burstAmount = 3; // Increased number of particles for a denser, firework-like burst
    if (particlesArray.length < 500) { // Increased the cap on total particles
        for (let i = 0; i < burstAmount; i++) {
            particlesArray.push(new Particle(mouseX, mouseY));
        }
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



export const firefliesFx = { start, stop };