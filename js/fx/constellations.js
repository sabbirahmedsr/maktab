/**
 * ============================================================================
 * Constellations Effect Module
 * ============================================================================
 * A custom-built effect featuring slow-moving, theme-colored particles that
 * connect with faint lines when they are close to each other, resembling
 * shifting constellations.
 */

let particlesArray = [];
let animationFrameId;
let canvas, ctx;
let currentDensity = 'medium';

const DENSITY_MAP = { low: 60, medium: 120, high: 200, 'very-high': 350 };

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 1.5 + 0.5; // Size between 0.5 and 2
        this.speedX = (Math.random() - 0.5) * 0.5; // Very slow speed
        this.speedY = (Math.random() - 0.5) * 0.5;
        this.color = getComputedStyle(document.documentElement).getPropertyValue('--accent-gold-light').trim();

        // Properties for twinkling effect
        this.opacity = Math.random() * 0.5; // Start with a random opacity up to 0.5
        this.fadeSpeed = (Math.random() * 0.01) + 0.005;
        this.isFadingIn = Math.random() > 0.5;
    }

    update() {
        // Bounce off edges
        if (this.x > canvas.width || this.x < 0) this.speedX *= -1;
        if (this.y > canvas.height || this.y < 0) this.speedY *= -1;

        this.x += this.speedX;
        this.y += this.speedY;

        // Twinkle logic
        if (this.isFadingIn) {
            this.opacity += this.fadeSpeed;
            if (this.opacity >= 0.7) { // Max opacity
                this.opacity = 0.7;
                this.isFadingIn = false;
            }
        } else {
            this.opacity -= this.fadeSpeed;
            if (this.opacity <= 0.1) { // Min opacity
                this.opacity = 0.1;
                this.isFadingIn = true;
            }
        }
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.opacity;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1; // Reset global alpha
    }
}

function drawLines() {
    const lineColor = particlesArray.length > 0 ? particlesArray[0].color : '#f3e5ab';
    for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
            const dx = particlesArray[a].x - particlesArray[b].x;
            const dy = particlesArray[a].y - particlesArray[b].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            const connectDistance = 150; // Increased connection distance for more lines

            if (distance < connectDistance) { // Connect if particles are close
                ctx.strokeStyle = lineColor;
                ctx.lineWidth = 0.4; // Slightly thicker lines for better visibility
                ctx.globalAlpha = (1 - (distance / connectDistance)) * 0.3; // Increased max opacity
                ctx.beginPath();
                ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                ctx.stroke();
                ctx.globalAlpha = 1; // Reset
            }
        }
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawLines();
    particlesArray.forEach(p => {
        p.update();
        p.draw();
    });
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
        const newColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-gold-light').trim() || '#f3e5ab';
        if (newColor) particlesArray.forEach(p => p.color = newColor);
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

export const constellationsFx = { start, stop };