/**
 * ============================================================================
 * Settings Module
 * ============================================================================
 * Handles all functionality related to the settings panel, including theme
 * and font selection, persistence with localStorage, and UI events.
 */

import { setActiveFx } from './fx-controller.js';
import { firefliesFx } from '../fx/fireflies.js';

// DOM elements for settings
const settingsTrigger = document.getElementById('settings-trigger');
const settingsPanel = document.getElementById('settings-panel');
const settingsClose = document.getElementById('settings-close');
const themeSelect = document.getElementById('theme-select');
const bengaliFontSelect = document.getElementById('bengali-font-select');
const arabicFontSelect = document.getElementById('arabic-font-select');
const fxSelect = document.getElementById('fx-select');
const fxDensitySelect = document.getElementById('fx-density-select');
const mouseTrailToggle = document.getElementById('mouse-trail-toggle');


/**
 * Updates the theme by adding/removing the correct class on the body.
 * @param {string} themeName The name of the theme to apply ('light', 'dark', 'sepia').
 */
function updateTheme(themeName) {
    document.body.classList.remove('dark-theme', 'sepia-theme', 'gold-theme', 'emerald-theme', 'midnight-theme');
    if (themeName !== 'light') {
        document.body.classList.add(themeName + '-theme');
    }
    themeSelect.value = themeName;
}

/**
 * Handles closing the settings panel when a click occurs outside of it.
 * @param {MouseEvent} e The click event.
 */
function handleClickOutsideSettings(e) {
    if (!settingsPanel.contains(e.target) && !settingsTrigger.contains(e.target)) {
        closeSettingsPanel();
    }
}

function openSettingsPanel() {
    settingsPanel.classList.remove('collapsed');
    document.addEventListener('click', handleClickOutsideSettings);
}

function closeSettingsPanel() {
    settingsPanel.classList.add('collapsed');
    document.removeEventListener('click', handleClickOutsideSettings);
}

/**
 * Reads theme and font settings from localStorage and applies them to the UI.
 */
function applySavedSettings() {
    const savedTheme = localStorage.getItem('appTheme');
    const savedBengaliFont = localStorage.getItem('bengaliFont') || "'Amiri', serif";
    const savedArabicFont = localStorage.getItem('arabicFont') || "'Noto Naskh Arabic', serif";
    let savedFx = localStorage.getItem('backgroundFx') || 'sparkles';
    const savedFxDensity = localStorage.getItem('backgroundFxDensity') || 'medium';
    const savedMouseTrail = localStorage.getItem('mouseTrail') === 'true';
    const mouseTrailToggleContainer = mouseTrailToggle.closest('.setting-item');

    updateTheme(savedTheme || 'light');

    document.documentElement.style.setProperty('--font-bengali', savedBengaliFont);
    bengaliFontSelect.value = savedBengaliFont;
    document.documentElement.style.setProperty('--font-arabic', savedArabicFont);
    arabicFontSelect.value = savedArabicFont;

    // Validate that the saved effect still exists in the dropdown
    const validFxOptions = Array.from(fxSelect.options).map(opt => opt.value);
    if (!validFxOptions.includes(savedFx)) {
        savedFx = 'sparkles'; // Fallback to a safe default if the saved one is invalid
    }

    fxSelect.value = savedFx;
    fxDensitySelect.value = savedFxDensity;
    setActiveFx(savedFx, savedFxDensity);

    // Disable toggle if initial background is 'none'
    if (savedFx === 'none') {
        mouseTrailToggle.disabled = true;
        if (mouseTrailToggleContainer) mouseTrailToggleContainer.style.opacity = '0.5';
    }

    // Apply saved mouse trail setting
    mouseTrailToggle.checked = savedMouseTrail;
    if (savedMouseTrail && savedFx !== 'none') {
        firefliesFx.start();
    }
}

/**
 * Initializes all settings panel functionality and event listeners.
 */
export function initSettings() {
    applySavedSettings();

    settingsTrigger.addEventListener('click', openSettingsPanel);
    settingsClose.addEventListener('click', closeSettingsPanel);

    themeSelect.addEventListener('change', (e) => {
        const newTheme = e.target.value;
        updateTheme(newTheme);
        localStorage.setItem('appTheme', newTheme);
    });

    bengaliFontSelect.addEventListener('change', (e) => {
        document.documentElement.style.setProperty('--font-bengali', e.target.value);
        localStorage.setItem('bengaliFont', e.target.value);
    });

    arabicFontSelect.addEventListener('change', (e) => {
        document.documentElement.style.setProperty('--font-arabic', e.target.value);
        localStorage.setItem('arabicFont', e.target.value);
    });

    fxSelect.addEventListener('change', (e) => {
        const newFx = e.target.value;
        const currentDensity = fxDensitySelect.value;
        setActiveFx(newFx, currentDensity);
        localStorage.setItem('backgroundFx', newFx);

        const mouseTrailToggleContainer = mouseTrailToggle.closest('.setting-item');

        // Disable/enable mouse trail based on background effect
        if (newFx === 'none') {
            firefliesFx.stop();
            mouseTrailToggle.disabled = true;
            if (mouseTrailToggleContainer) mouseTrailToggleContainer.style.opacity = '0.5';
        } else {
            if (mouseTrailToggle.checked) {
                firefliesFx.start();
            }
            mouseTrailToggle.disabled = false;
            if (mouseTrailToggleContainer) mouseTrailToggleContainer.style.opacity = '1';
        }
    });

    fxDensitySelect.addEventListener('change', (e) => {
        const newDensity = e.target.value;
        const currentFx = fxSelect.value;
        setActiveFx(currentFx, newDensity);
        localStorage.setItem('backgroundFxDensity', newDensity);
    });

    mouseTrailToggle.addEventListener('change', (e) => {
        const isEnabled = e.target.checked;
        localStorage.setItem('mouseTrail', isEnabled);
        if (isEnabled && fxSelect.value !== 'none') {
            firefliesFx.start();
        } else {
            firefliesFx.stop();
        }
    });
}