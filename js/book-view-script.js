/* *********************************************************
    Module 1.0.0 : Main Application Script
    Description: Orchestrates the loading and functionality of the book viewer by importing and running the necessary modules.
************************************************************ */
// Import functions from the specialized modules
import { loadChapter, setupNavigationListener } from './chapter-loader-script.js';
import { setTheme, setInitialThemeButton } from './theme-manager.js';

/**
 * Sets up click listeners for the theme buttons.
 */
function setupThemeButtons() {
    const themeButtonsContainer = document.querySelector('.theme-options');
    if (themeButtonsContainer) {
        themeButtonsContainer.addEventListener('click', event => {
            const clickedButton = event.target.closest('button');
            if (clickedButton) {
                const themeName = clickedButton.getAttribute('data-theme');
                setTheme(themeName, clickedButton);
            }
        });
    }
}

// Event listener for initial page load
document.addEventListener('DOMContentLoaded', () => {
    // Set up the navigation listener
    setupNavigationListener();

    // Set up the theme button listeners
    setupThemeButtons();

    // Set the initial active theme button based on the linked stylesheet
    setInitialThemeButton();
    
    // Determine the initial chapter from the URL query parameter
    const params = new URLSearchParams(window.location.search);
    const initialChapter = params.get('chapter');

    // Load the initial chapter, defaulting to 'all-harf.html' if none is specified
    const initialPath = initialChapter ? `/chapters/${initialChapter}` : '/chapters/all-harf.html';
    loadChapter(initialPath);
});