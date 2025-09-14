/**
 * ============================================================================
 * FX Controller Module
 * ============================================================================
 * Manages the active background visual effect.
 */

import { sparklesFx } from '../fx/sparkles.js';
import { shootingStarsFx } from '../fx/shooting-stars.js';
import { constellationsFx } from './../fx/constellations.js';

const canvasContainer = document.getElementById('particle-canvas');

const effects = {
    'none': { module: { start: () => {}, stop: () => {} } },
    'sparkles': { module: sparklesFx },
    'shooting-stars': { module: shootingStarsFx },
    'constellations': { module: constellationsFx },
};





let currentFxName = 'none';

export function setActiveFx(fxName = 'none', density = 'medium') {
    // Stop the currently running effect
    if (effects[currentFxName] && effects[currentFxName].module) {
        effects[currentFxName].module.stop();
    }

    // Start the new effect
    if (fxName === 'none') {
        // This is the 'none' case, so hide the canvas.
        canvasContainer.style.display = 'none';
    } else {
        const newEffect = effects[fxName];
        if (newEffect && newEffect.module) {
            canvasContainer.style.display = 'block';
            newEffect.module.start(density);
        }
    }

     currentFxName = fxName;
}