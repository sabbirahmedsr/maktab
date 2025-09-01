/* *********************************************************
    Module 1.0.0 : Router Script
    Description: This script sets up client-side routing by intercepting link clicks and preventing a full page reload. It uses a query parameter approach to handle a simple server environment.
************************************************************ */

/**
 * Sets up client-side routing by intercepting link clicks.
 * @param {function} callback - The function to call when a new path is detected.
 */
export function setupRouter(callback) {
    document.body.addEventListener('click', e => {
        // Check if the clicked element is an <a> tag and is on the same page
        if (e.target.matches('a') && e.target.pathname === './book-view.html') {
            e.preventDefault();
            
            const newUrl = e.target.href;
            
            // Update the URL without reloading the page
            window.history.pushState({}, '', newUrl);
            
            // Call the callback with the new URL
            callback(newUrl);
        }
    });

    window.addEventListener('popstate', () => {
        callback(window.location.href);
    });
}