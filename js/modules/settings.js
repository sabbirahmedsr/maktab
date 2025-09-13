/**
 * ============================================================================
 * Settings Module
 * ============================================================================
 * Handles all functionality related to the settings panel, including theme
 * and font selection, persistence with localStorage, and UI events.
 */

// DOM elements for settings
const settingsTrigger = document.getElementById('settings-trigger');
const settingsPanel = document.getElementById('settings-panel');
const settingsClose = document.getElementById('settings-close');
const themeSelect = document.getElementById('theme-select');
const bengaliFontSelect = document.getElementById('bengali-font-select');
const arabicFontSelect = document.getElementById('arabic-font-select');

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
 * Reads theme and font settings from localStorage and applies them to the UI.
 */
function applySavedSettings() {
    const savedTheme = localStorage.getItem('appTheme');
    const savedBengaliFont = localStorage.getItem('bengaliFont') || "'Amiri', serif";
    const savedArabicFont = localStorage.getItem('arabicFont') || "'Noto Naskh Arabic', serif";

    updateTheme(savedTheme || 'light');

    document.documentElement.style.setProperty('--font-bengali', savedBengaliFont);
    bengaliFontSelect.value = savedBengaliFont;
    document.documentElement.style.setProperty('--font-arabic', savedArabicFont);
    arabicFontSelect.value = savedArabicFont;
}

/**
 * Initializes all settings panel functionality and event listeners.
 */
export function initSettings() {
    applySavedSettings();

    settingsTrigger.addEventListener('click', () => settingsPanel.classList.remove('collapsed'));
    settingsClose.addEventListener('click', () => settingsPanel.classList.add('collapsed'));

    themeSelect.addEventListener('change', (e) => {
        updateTheme(e.target.value);
        localStorage.setItem('appTheme', e.target.value);
    });

    bengaliFontSelect.addEventListener('change', (e) => {
        document.documentElement.style.setProperty('--font-bengali', e.target.value);
        localStorage.setItem('bengaliFont', e.target.value);
    });

    arabicFontSelect.addEventListener('change', (e) => {
        document.documentElement.style.setProperty('--font-arabic', e.target.value);
        localStorage.setItem('arabicFont', e.target.value);
    });
}