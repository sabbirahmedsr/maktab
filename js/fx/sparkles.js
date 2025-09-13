/**
 * ============================================================================
 * Sparkles Effect Module
 * ============================================================================
 */

let particlesArray = [];
let animationFrameId;
let canvas, ctx;
let currentDensity = 'medium';

const DENSITY_MAP = { low: 50, medium: 100, high: 300 };

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 1 + 0.5; // Make particles smaller
        this.speedX = (Math.random() - 0.5) * 0.6; // Reduce horizontal speed
        this.speedY = (Math.random() - 0.5) * 0.6; // Reduce vertical speed
        this.color = getComputedStyle(document.documentElement).getPropertyValue('--accent-gold-light').trim();
        this.maxSize = this.size;
        this.isGrowing = false;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.isGrowing) {
            if (this.size < this.maxSize) this.size += 0.01; // Slower grow speed
            else this.isGrowing = false;
        } else {
            if (this.size > 0.2) this.size -= 0.01; // Slower shrink speed
            else this.reset();
        }
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.speedX = (Math.random() - 0.5) * 0.6; // Reduce horizontal speed
        this.speedY = (Math.random() - 0.5) * 0.6; // Reduce vertical speed
        this.maxSize = Math.random() * 1 + 0.5; // Make particles smaller
        this.isGrowing = true;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function handleParticles() {
    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
        particlesArray[i].draw();
    }
}

function animate() {
    // The background is now handled by CSS, so we just need to clear the canvas.
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

export const sparklesFx = { start, stop };