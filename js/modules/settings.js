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
import { bouncingBallsFx } from '../fx/bouncing-balls.js';

// References to all the interactive elements inside the settings panel.
const settingsTrigger = document.getElementById('settings-trigger');
const settingsPanel = document.getElementById('settings-panel');
const settingsClose = document.getElementById('settings-close');
const themeSelect = document.getElementById('theme-select');
const backgroundSelect = document.getElementById('background-select');
const bengaliFontSelect = document.getElementById('bengali-font-select');
const arabicFontSelect = document.getElementById('arabic-font-select');
const fxSelect = document.getElementById('fx-select');
const cursorFxSelect = document.getElementById('cursor-fx-select');
const fxDensityButtons = document.getElementById('fx-density-buttons');


/**
 * Changes the application's visual theme.
 * It works by removing any existing theme class from the `<body>` tag
 * and then adding the new one (e.g., 'dark-theme', 'sepia-theme').
 * The actual colors for UI components are defined in themes.css.
 * @param {string} themeName The name of the theme to apply ('light', 'dark', 'sepia').
 */
function updateTheme(themeName) {
    // Preserve background and other utility classes, only remove theme classes
    const classes = document.body.className.split(' ').filter(c => !c.endsWith('-theme'));
    document.body.className = classes.join(' ');

    if (themeName && themeName !== 'light') {
        document.body.classList.add(themeName + '-theme');
    }
    themeSelect.value = themeName;
}

/**
 * Updates the body's background. It can be the theme's default or a custom one.
 * @param {HTMLSelectElement} selectElement The background <select> element itself.
 */
function updateBackground(selectElement) {
    let selectedOption = selectElement.options[selectElement.selectedIndex];

    // If no option is selected (e.g., due to a stale value in localStorage),
    // gracefully default to the first option to prevent errors.
    if (!selectedOption) {
        selectElement.selectedIndex = 0;
        selectedOption = selectElement.options[0];
    }

    const bgValue = selectedOption.value;
    const isDark = selectedOption.dataset.isDark === 'true';

    // Reset styles first
    document.body.style.backgroundImage = '';
    document.body.classList.remove('image-background', 'dark-image-background');

    if (bgValue === 'default') {
        // For default, do nothing extra. The theme's --bg-main will be used by the CSS.
    } else {
        // For images, apply the URL directly and add the helper classes.
        document.body.style.backgroundImage = `url('${bgValue}')`;
        document.body.classList.add('image-background');
        if (isDark) {
            document.body.classList.add('dark-image-background');
        }
    }
    backgroundSelect.value = bgValue;
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
    const savedTheme = localStorage.getItem('appTheme') || 'light';
    const savedBackground = localStorage.getItem('appBackground') || 'default';
    const savedBengaliFont = localStorage.getItem('bengaliFont') || "'Amiri', serif";
    const savedArabicFont = localStorage.getItem('arabicFont') || "'Noto Naskh Arabic', serif";
    let savedFx = localStorage.getItem('backgroundFx') || 'sparkles';
    const savedCursorFx = localStorage.getItem('cursorFx') || 'none';
    const savedFxDensity = localStorage.getItem('particleDensity') || 'medium';

    // Apply settings
    updateTheme(savedTheme);
    // To apply the saved background, we first set the dropdown's value, then call updateBackground
    // so it can read the correct option's data attributes.
    backgroundSelect.value = savedBackground;
    updateBackground(backgroundSelect);


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
    cursorFxSelect.value = savedCursorFx;
    setActiveFx(savedFx, savedFxDensity);

    // Apply saved cursor effect
    if (savedCursorFx === 'fireflies') {
        firefliesFx.start();
    } else if (savedCursorFx === 'bouncing-balls') {
        bouncingBallsFx.start();
    }

    // Apply saved density
    const densityButtons = fxDensityButtons.querySelectorAll('button');
    densityButtons.forEach(button => {
        button.classList.remove('active');
        if (button.dataset.density === savedFxDensity) {
            button.classList.add('active');
        }
    });
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

    // When the user chooses a new background...
    backgroundSelect.addEventListener('change', (e) => {
        updateBackground(e.target); // e.target is the <select> element
        localStorage.setItem('appBackground', e.target.value); // Save the new value
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

    // When the user changes the particle effect...
    fxSelect.addEventListener('change', (e) => {
        const newFx = e.target.value;
        const currentDensity = localStorage.getItem('particleDensity') || 'medium';
        setActiveFx(newFx, currentDensity);
        localStorage.setItem('backgroundFx', newFx);
    });

    // When the user changes the cursor effect...
    cursorFxSelect.addEventListener('change', (e) => {
        const newCursorFx = e.target.value;
        localStorage.setItem('cursorFx', newCursorFx);

        // Stop all cursor effects first
        firefliesFx.stop();
        bouncingBallsFx.stop();

        // Then start the selected one
        if (newCursorFx === 'fireflies') {
            firefliesFx.start();
        } else if (newCursorFx === 'bouncing-balls') {
            bouncingBallsFx.start();
        }
    });

    // When the user clicks a density button...
    fxDensityButtons.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            const newDensity = e.target.dataset.density;
            fxDensityButtons.querySelector('.active')?.classList.remove('active');
            e.target.classList.add('active');

            const currentFx = fxSelect.value;
            setActiveFx(currentFx, newDensity);
            localStorage.setItem('particleDensity', newDensity);
        }
    });
}