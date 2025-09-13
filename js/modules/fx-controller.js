/**
 * ============================================================================
 * FX Controller Module
 * ============================================================================
 * Manages the active background visual effect.
 */

import { sparklesFx } from '../fx/sparkles.js';
import { shootingStarsFx } from '../fx/shooting-stars.js';

const effects = {
    'none': { start: () => {}, stop: () => {} },
    'sparkles': sparklesFx,
    'shooting-stars': shootingStarsFx,
};

let currentFxName = 'none';
const canvas = document.getElementById('particle-canvas');

export function setActiveFx(fxName = 'none', density = 'medium') {
    // Stop the current effect
    effects[currentFxName].stop();

    // Hide or show the canvas based on the selected effect
    if (canvas) {
        canvas.style.display = fxName === 'none' ? 'none' : 'block';
    }

    // Start the new effect
    currentFxName = fxName;
    if (effects[currentFxName]) {
        effects[currentFxName].start(density);
    }
}