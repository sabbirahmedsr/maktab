/**
 * ============================================================================
 * Glitter Effect Module
 * ============================================================================
 * Creates a gentle, falling glitter effect with rotating, twinkling particles.
 */

let particlesArray = [];
let animationFrameId;
let canvas, ctx;
let currentDensity = 'medium';

const DENSITY_MAP = { low: 300, medium: 500, high: 700, 'very-high': 1200 };

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height; // Start anywhere on screen
        this.size = Math.random() * 2 + 1; // Size of the glitter piece (e.g., 1-3px)

        // Slow downward drift with a slight side-to-side motion
        this.speedY = Math.random() * 0.5 + 0.2;
        this.speedX = (Math.random() - 0.5) * 0.3;

        // Rotation for the twinkle effect
        this.angle = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.05;

        // Opacity for fading in/out to create a "twinkle"
        this.opacity = Math.random() * 0.5 + 0.5; // Start with some opacity
        this.opacityDirection = 1;
        this.opacitySpeed = Math.random() * 0.02;

        // Use two theme colors for variety
        const colors = [
            getComputedStyle(document.documentElement).getPropertyValue('--accent-gold-light').trim(),
            getComputedStyle(document.documentElement).getPropertyValue('--accent-gold-dark').trim()
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
        this.y += this.speedY;
        this.x += this.speedX;
        this.angle += this.rotationSpeed;

        // Twinkle by changing opacity
        this.opacity += this.opacitySpeed * this.opacityDirection;
        if (this.opacity > 1 || this.opacity < 0.2) {
            this.opacityDirection *= -1; // Reverse direction
        }

        // Reset particle if it falls off the bottom of the screen
        if (this.y > canvas.height + this.size) {
            this.reset();
        }
    }

    reset() {
        this.y = -this.size; // Start just above the screen
        this.x = Math.random() * canvas.width;
        this.speedY = Math.random() * 0.5 + 0.2;
        this.speedX = (Math.random() - 0.5) * 0.3;
    }

    draw() {
        ctx.save();
        // Move the origin to the particle's position and rotate
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        // Set color and opacity
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.opacity;
        
        // Draw the rectangle centered on the new origin
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        ctx.restore();
    }
}

function handleParticles() {
    // Reset global alpha after each frame to avoid conflicts
    ctx.globalAlpha = 1;
    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    handleParticles();
    animationFrameId = requestAnimationFrame(animate);
}

const handleResize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    particlesArray = [];
    for (let i = 0; i < DENSITY_MAP[currentDensity]; i++) particlesArray.push(new Particle());
};

const handleThemeChange = () => {
    setTimeout(() => {
        const newColors = [
            getComputedStyle(document.documentElement).getPropertyValue('--accent-gold-light').trim(),
            getComputedStyle(document.documentElement).getPropertyValue('--accent-gold-dark').trim()
        ];
        particlesArray.forEach(p => p.color = newColors[Math.floor(Math.random() * newColors.length)]);
    }, 50);
};

function start(density = 'medium') {
    canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    currentDensity = density;
    ctx = canvas.getContext('2d');
    handleResize();
    animate();
    window.addEventListener('resize', handleResize);
    document.getElementById('theme-select').addEventListener('change', handleThemeChange);
}

function stop() {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    particlesArray = [];
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    window.removeEventListener('resize', handleResize);
    const themeSelect = document.getElementById('theme-select');
    if (themeSelect) themeSelect.removeEventListener('change', handleThemeChange);
}

export const glitterFx = { start, stop };