/**
 * ============================================================================
 * Settings Module
 * ============================================================================
 * This module manages everything related to the settings panel. It handles
 * opening and closing the panel, changing themes and fonts, and saving the
 * user's choices to their browser's local storage so they are remembered.
 * Handles all functionality related to the settings panel, including theme
 * and font selection, persistence with localStorage, and UI events.
 */

import { setActiveFx } from './fx-controller.js';
import { firefliesFx } from '../fx/fireflies.js';

// References to all the interactive elements inside the settings panel.
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
 * Changes the application's visual theme.
 * It works by removing any existing theme class from the `<body>` tag
 * and then adding the new one (e.g., 'dark-theme', 'sepia-theme').
 * The actual colors and styles for each theme are defined in the CSS files.
 * @param {string} themeName The name of the theme to apply ('light', 'dark', 'sepia').
 */
function updateTheme(themeName) {
    // First, clear any theme class that might already be there.
    document.body.className = ''; // Clear all theme classes
    if (themeName && themeName !== 'light') {
        document.body.classList.add(themeName + '-theme');
    }
    themeSelect.value = themeName;
}

/**
 * A helper function to close the settings panel if the user clicks anywhere
 * outside of it. This provides an intuitive way to dismiss the panel.
 * @param {MouseEvent} e The click event.
 */
function handleClickOutsideSettings(e) {
    if (!settingsPanel.contains(e.target) && !settingsTrigger.contains(e.target)) {
        closeSettingsPanel();
    }
}

/**
 * Opens the settings panel and sets up a listener to detect clicks outside.
 */
function openSettingsPanel() {
    settingsPanel.classList.remove('collapsed');
    document.addEventListener('click', handleClickOutsideSettings);
}

/**
 * Closes the settings panel and removes the "click outside" listener to save resources.
 */
function closeSettingsPanel() {
    settingsPanel.classList.add('collapsed');
    document.removeEventListener('click', handleClickOutsideSettings);
}

/**
 * This function runs when the application first starts. It checks the browser's
 * `localStorage` to see if the user has any saved preferences from a previous
 * session. If so, it applies them.
 *
 * `localStorage` is a simple way for a website to store small pieces of data
 * (like 'appTheme: "dark"') on the user's computer.
 */
function applySavedSettings() {
    // Read each setting from localStorage, providing a sensible default if not found.
    const savedTheme = localStorage.getItem('appTheme');
    const savedBengaliFont = localStorage.getItem('bengaliFont') || "'Amiri', serif";
    const savedArabicFont = localStorage.getItem('arabicFont') || "'Noto Naskh Arabic', serif";
    let savedFx = localStorage.getItem('backgroundFx') || 'sparkles';
    const savedFxDensity = localStorage.getItem('backgroundFxDensity') || 'medium';
    const savedMouseTrail = localStorage.getItem('mouseTrail') === 'true';
    const mouseTrailToggleContainer = mouseTrailToggle.closest('.setting-item');

    // Apply the saved theme.
    updateTheme(savedTheme || 'light');

    // Apply the saved fonts by setting CSS variables on the root element.
    document.documentElement.style.setProperty('--font-bengali', savedBengaliFont);
    bengaliFontSelect.value = savedBengaliFont;
    document.documentElement.style.setProperty('--font-arabic', savedArabicFont);
    arabicFontSelect.value = savedArabicFont;

    // Validate that the saved effect still exists in the dropdown
    // This prevents errors if an effect was removed in an update.
    const validFxOptions = Array.from(fxSelect.options).map(opt => opt.value);
    if (!validFxOptions.includes(savedFx)) {
        savedFx = 'sparkles'; // Fallback to a safe default if the saved one is invalid
    }

    fxSelect.value = savedFx;
    fxDensitySelect.value = savedFxDensity;
    setActiveFx(savedFx, savedFxDensity);

    // If the background effect is 'none', the mouse trail toggle should be disabled.
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
 * The main initialization function for this module.
 * It's called once when the app starts. It applies saved settings and then
 * sets up "event listeners" for all the buttons, dropdowns, and toggles.
 * An event listener waits for a user action (like a 'click' or 'change')
 * and then runs a specific function.
 */
export function initSettings() {
    // First, apply any settings the user has saved from last time.
    applySavedSettings();

    // --- Event Listeners ---

    // When the "Settings" button is clicked, open the panel.
    settingsTrigger.addEventListener('click', openSettingsPanel);
    settingsClose.addEventListener('click', closeSettingsPanel);

    // When the user chooses a new theme from the dropdown...
    themeSelect.addEventListener('change', (e) => {
        const newTheme = e.target.value;
        updateTheme(newTheme); // ...apply it visually...
        localStorage.setItem('appTheme', newTheme); // ...and save the choice.
    });

    // When the user chooses a new Bengali font...
    bengaliFontSelect.addEventListener('change', (e) => {
        document.documentElement.style.setProperty('--font-bengali', e.target.value);
        localStorage.setItem('bengaliFont', e.target.value);
    });

    // When the user chooses a new Arabic font...
    arabicFontSelect.addEventListener('change', (e) => {
        document.documentElement.style.setProperty('--font-arabic', e.target.value);
        localStorage.setItem('arabicFont', e.target.value);
    });

    // When the user changes the background effect...
    fxSelect.addEventListener('change', (e) => {
        const newFx = e.target.value;
        const currentDensity = fxDensitySelect.value;
        setActiveFx(newFx, currentDensity);
        localStorage.setItem('backgroundFx', newFx);

        const mouseTrailToggleContainer = mouseTrailToggle.closest('.setting-item');

        // If the effect is 'none', disable the mouse trail option.
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

    // When the user changes the density of the background effect...
    fxDensitySelect.addEventListener('change', (e) => {
        const newDensity = e.target.value;
        const currentFx = fxSelect.value;
        setActiveFx(currentFx, newDensity);
        localStorage.setItem('backgroundFxDensity', newDensity);
    });

    // When the user toggles the mouse trail effect on or off...
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