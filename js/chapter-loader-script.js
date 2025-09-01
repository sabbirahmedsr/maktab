/* *********************************************************
    Module 1.0.0 : Chapter Loader
    Description: Manages fetching and injecting chapter content into the main viewer. It also handles setting up the navigation listener.
************************************************************ */

/**
 * Gets the base path for the repository, which is necessary for GitHub Pages.
 * @returns {string} The base path, e.g., '/maktab/'.
 */
function getBasePath() {
    const isLocal = window.location.hostname === 'localhost';
    if (isLocal) {
        return ''; // No base path needed for local development
    } else {
        // Return the repository name for GitHub Pages
        const pathSegments = window.location.pathname.split('/');
        return pathSegments.length > 1 ? `/${pathSegments[1]}` : '';
    }
}

/**
 * Fetches and loads content into the main content area based on the file path.
 * It also builds and highlights the navigation list.
 * @param {string} finalPath - The full path to the chapter HTML file.
 */
export async function loadChapter(finalPath) {
    const contentArea = document.querySelector('#content-area');
    const navList = document.querySelector('.nav-list');
    
    // Clear previous content and nav links
    contentArea.innerHTML = '';
    if (navList) navList.innerHTML = '';

    const basePath = getBasePath();

    const response = await fetch(`${basePath}/data/nav-data.json`);
    const data = await response.json();
    
    const chapterName = finalPath.split('/').pop();

    // Dynamically load the letter card stylesheet if the chapter is the letter page.
    if (chapterName === 'all-harf.html') {
        const head = document.head;
        let link = document.querySelector(`link[href="${basePath}/css/letter-card-style.css"]`);
        if (!link) {
            link = document.createElement('link');
            link.type = 'text/css';
            link.rel = 'stylesheet';
            link.href = `${basePath}/css/letter-card-style.css`; // Corrected to use the base path
            head.appendChild(link);
        }
    }

    // Build the navigation list dynamically
    data.forEach(item => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        
        // Link to the main page with a query parameter for the chapter
        a.href = `${basePath}/book-view.html?chapter=${item.url.split('/').pop()}`;
        a.textContent = item.title;
        
        // Check if the current link's URL matches the chapter path
        if (item.url.includes(chapterName)) {
            a.classList.add('active'); // Add the active class to the current link
        }
        
        li.appendChild(a);
        if (navList) navList.appendChild(li);
    });

    try {
        const chapterResponse = await fetch(`${basePath}/chapters/${chapterName}`);
        if (!chapterResponse.ok) throw new Error('Page not found');
        const content = await chapterResponse.text();
        
        // Use DOMParser to correctly parse and insert HTML content
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, 'text/html');
        
        const contentBody = doc.body.innerHTML;
        contentArea.innerHTML = contentBody;
        
    } catch (error) {
        contentArea.innerHTML = `<h2>Error</h2><p>Could not load the chapter content.</p>`;
        console.error(error);
    }
}

export function setupNavigationListener() {
    const navList = document.querySelector('.nav-list');
    if (navList) {
        navList.addEventListener('click', event => {
            const targetLink = event.target.closest('a');
            if (targetLink) {
                event.preventDefault();
                const chapterPath = targetLink.getAttribute('href').replace('/book-view.html?chapter=', '/chapters/');
                loadChapter(chapterPath);
            }
        });
    }
}