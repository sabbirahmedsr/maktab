/**
 * ============================================================================
 * Shooting Stars Effect Module
 * ============================================================================
 */

let starsArray = [];
let animationFrameId;
let canvas, ctx;
let shootingStarInterval;
let currentDensity = 'medium';

const DENSITY_MAP = { low: 150, medium: 400, high: 600, 'very-high': 900 };

class Star {
    constructor(isShootingStar = false) {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.color = getComputedStyle(document.documentElement).getPropertyValue('--accent-gold-light').trim();
        this.isShootingStar = isShootingStar;

        if (isShootingStar) {
            this.size = Math.random() * 1.5 + 0.5; // Smaller, more subtle
            this.maxLife = Math.random() * 200 + 500; // Lifespan of 500-700 frames for longer travel
            this.life = this.maxLife;
            this.trail = [];
            this.trailLength = 30; // The number of segments in the trail

            const edge = Math.floor(Math.random() * 4);
            let targetX, targetY;

            // Determine start position from a random edge
            if (edge === 0) { this.x = Math.random() * canvas.width; this.y = 0; } // Top
            else if (edge === 1) { this.x = canvas.width; this.y = Math.random() * canvas.height; } // Right
            else if (edge === 2) { this.x = Math.random() * canvas.width; this.y = canvas.height; } // Bottom
            else { this.x = 0; this.y = Math.random() * canvas.height; } // Left

            // Determine target on the opposite side to ensure a long path
            if (edge === 0) { targetX = Math.random() * canvas.width; targetY = canvas.height; } // from Top to Bottom
            else if (edge === 1) { targetX = 0; targetY = Math.random() * canvas.height; } // from Right to Left
            else if (edge === 2) { targetX = Math.random() * canvas.width; targetY = 0; } // from Bottom to Top
            else { targetX = canvas.width; targetY = Math.random() * canvas.height; } // from Left to Right

            const dx = targetX - this.x;
            const dy = targetY - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Slower, gentler speed
            const speed = (Math.random() * 2 + 1); // Speed between 1 and 3

            this.speedX = (dx / distance) * speed;
            this.speedY = (dy / distance) * speed;

        } else {
            // --- Static Star ---
            this.size = Math.random() * 1.5;
            this.speedX = 0; // Static stars don't move
            this.speedY = 0;
            // Properties for twinkling effect
            this.opacity = Math.random() * 0.5 + 0.2;
            this.fadeSpeed = (Math.random() * 0.01) + 0.005;
            this.isFadingIn = Math.random() > 0.5;
        }
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.isShootingStar) {
            this.life--;

            // Add current position to the trail
            this.trail.push({ x: this.x, y: this.y });
            // Keep the trail at a fixed length
            if (this.trail.length > this.trailLength) {
                this.trail.shift();
            }
        } else {
            // Twinkle logic for static stars
            if (this.isFadingIn) {
                this.opacity += this.fadeSpeed;
                if (this.opacity >= 1) this.isFadingIn = false;
            } else {
                this.opacity -= this.fadeSpeed;
                if (this.opacity <= 0.1) this.isFadingIn = true;
            }
        }
    }

    draw() {
        ctx.fillStyle = this.color;
        let finalOpacity;

        if (this.isShootingStar) {
            // Draw the trail
            for (let i = 0; i < this.trail.length; i++) {
                const segment = this.trail[i];
                ctx.globalAlpha = (i / this.trail.length) * (this.life / this.maxLife);
                ctx.beginPath();
                ctx.arc(segment.x, segment.y, this.size * (i / this.trail.length), 0, Math.PI * 2);
                ctx.fill();
            }
            finalOpacity = this.life / this.maxLife;
        } else {
            finalOpacity = this.opacity;
        }
        ctx.globalAlpha = finalOpacity;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

function handleStars() {
    for (let i = starsArray.length - 1; i >= 0; i--) {
        starsArray[i].update();
        starsArray[i].draw();
        if (starsArray[i].isShootingStar && starsArray[i].life <= 0) {
            starsArray.splice(i, 1);
        }
    }
}

function animate() {
    // 1. Clear the canvas completely. This is crucial to prevent ghosting of static stars.
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    handleStars();
    animationFrameId = requestAnimationFrame(animate);
}

const handleResize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    starsArray = [];
    for (let i = 0; i < DENSITY_MAP[currentDensity]; i++) starsArray.push(new Star());
};

const handleThemeChange = () => {
    setTimeout(() => {
        const newColor = getComputedStyle(document.documentElement).getPropertyValue('--accent-gold-light').trim() || '#f3e5ab';
        if (newColor) starsArray.forEach(s => s.color = newColor);
    }, 50);
};

function start(density = 'medium') {
    canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    currentDensity = density;
    ctx = canvas.getContext('2d');
    handleResize();
    animate();

    shootingStarInterval = setInterval(() => {
        if (starsArray.length < DENSITY_MAP[currentDensity] + 50) starsArray.push(new Star(true));
    }, 1500); // Increased frequency

    window.addEventListener('resize', handleResize);
    document.getElementById('theme-select').addEventListener('change', handleThemeChange);
}

function stop() {
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    if (shootingStarInterval) clearInterval(shootingStarInterval);
    starsArray = [];
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);

    window.removeEventListener('resize', handleResize);
    const themeSelect = document.getElementById('theme-select');
    if (themeSelect) themeSelect.removeEventListener('change', handleThemeChange);
}

export const shootingStarsFx = { start, stop };