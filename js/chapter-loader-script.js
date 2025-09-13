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

    const response = await fetch('./data/nav-data.json');
    const data = await response.json();
    
    const chapterName = finalPath.split('/').pop();

    // Build the navigation list dynamically
    data.forEach(item => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        
        // Link to the main page with a query parameter for the chapter
        a.href = `./book-view.html?chapter=${item.url.split('/').pop()}`;
        a.textContent = item.title;
        
        // Check if the current link's URL matches the chapter path
        if (item.url.includes(chapterName)) {
            a.classList.add('active'); // Add the active class to the current link
        }
        
        li.appendChild(a);
        if (navList) navList.appendChild(li);
    });

    try {
        const chapterResponse = await fetch(finalPath);
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

/**
 * Sets up a click listener on the navigation list to handle dynamic chapter loading.
 */
export function setupNavigationListener() {
    const navList = document.querySelector('.nav-list');
    if (navList) {
        navList.addEventListener('click', event => {
            const targetLink = event.target.closest('a');
            if (targetLink) {
                event.preventDefault();
                const chapterPath = targetLink.getAttribute('href').replace('./book-view.html?chapter=', './chapters/');
                loadChapter(chapterPath);
            }
        });
    }
}