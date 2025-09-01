/* *********************************************************
    Module 1.0.0 : Theme Manager
    Description: Manages the application's theme switching, ensuring the correct stylesheet is loaded and the corresponding button is active. This module can be used on any page.
************************************************************ */

/**
 * Adds the 'active-option' class to the clicked button and removes it from its siblings.
 * @param {HTMLElement} button - The button element that was clicked.
 */
function setActiveButton(button) {
    const parent = button.parentElement;
    if (parent) {
        const buttons = parent.querySelectorAll('button');
        buttons.forEach(btn => btn.classList.remove('active-option'));
        button.classList.add('active-option');
    }
}

/**
 * Switches the application's theme by changing the stylesheet link.
 * @param {string} themeName - The name of the theme file (e.g., 'theme-light', 'theme-dark').
 * @param {HTMLElement} clickedButton - The button element that was clicked.
 */
export function setTheme(themeName, clickedButton) {
    const themeStylesheet = document.getElementById('theme-stylesheet');
    if (themeStylesheet) {
        themeStylesheet.href = `./css/themes/${themeName}.css`;
        setActiveButton(clickedButton);
    }
}

/**
 * Reads the current theme from the linked stylesheet on page load and sets the corresponding button as active.
 * This function should be called when the DOM is ready.
 */
export function setInitialThemeButton() {
    const themeStylesheet = document.getElementById('theme-stylesheet');
    const themeButtons = document.querySelectorAll('.theme-options button');
    
    if (themeStylesheet && themeButtons.length > 0) {
        const currentThemeName = themeStylesheet.href.split('/').pop().replace('.css', '');
        
        themeButtons.forEach(button => {
            if (button.innerText.toLowerCase() === currentThemeName.replace('theme-', '')) {
                button.classList.add('active-option');
            } else {
                button.classList.remove('active-option');
            }
        });
    }
}