/**
 * ============================================================================
 * Main Application Entry Point
 * ============================================================================
 * This script orchestrates the application by initializing modules and
 * building the main navigation.
 */

import { initSettings } from './modules/settings.js';
import { loadMarkdown } from './modules/content.js';
import { setActiveChapter } from './modules/ui.js';

document.addEventListener('DOMContentLoaded', () => {

    // ========================================================================
    // 1. DOM Element References
    // ========================================================================
    const chapterList = document.getElementById('chapter-list');
    const contentDiv = document.getElementById('markdown-content');

    // ========================================================================
    // 2. Navigation Building
    // ========================================================================

    /**
     * Creates the sub-chapter navigation list for a given chapter.
     * @param {HTMLElement} contentContainer - The container with the chapter's content.
     * @param {HTMLLIElement} chapterLi - The parent chapter's list item.
     * @param {string} filename - The filename of the chapter for unique IDs.
     */
    function buildSubChapterNav(contentContainer, chapterLi, filename) {
        const existingSubList = chapterLi.querySelector('.sub-chapter-list');
        if (existingSubList) existingSubList.remove();

        const headings = contentContainer.querySelectorAll('h3');
        if (headings.length > 0) {
            const subChapterList = document.createElement('ul');
            chapterLi.classList.add('has-sub-chapters');
            subChapterList.className = 'sub-chapter-list collapsed';

            headings.forEach((h3, index) => {
                const headingId = `sub-heading-${filename}-${index}`;
                h3.id = headingId;
                const subLi = document.createElement('li');
                subLi.textContent = h3.textContent.replace(':', '').trim();
                
                subLi.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const targetHeading = document.getElementById(headingId);
                    targetHeading.scrollIntoView({ behavior: 'smooth', block: 'center' });

                    const targetCard = targetHeading.closest('.content-card');
                    if (targetCard) {
                        targetCard.classList.remove('pulse-once');
                        void targetCard.offsetWidth; // Force reflow to restart animation
                        targetCard.classList.add('pulse-once');
                        targetCard.addEventListener('animationend', () => targetCard.classList.remove('pulse-once'), { once: true });
                    }
                });
                subChapterList.appendChild(subLi);
            });
            chapterLi.appendChild(subChapterList);
        }
    }


    // ========================================================================
    // 3. Initialisation
    // ========================================================================

    initSettings();

    fetch('chapters/chapters.json')
        .then(res => res.json())
        .then(data => {
            const chapters = data.chapters || [];
            if (chapters.length === 0) {
                chapterList.innerHTML = '<li>No chapters found.</li>';
                return;
            }

            chapters.forEach(chapter => {
                const li = document.createElement('li');
                li.innerHTML = `<div class="chapter-item-header"><span>${chapter.title}</span><i class="fas fa-chevron-right expand-icon"></i></div>`;
                li.dataset.file = chapter.file;
                li.addEventListener('click', (e) => {
                    if (e.target.closest('.sub-chapter-list')) return;

                    if (li.classList.contains('active')) {
                        const subList = li.querySelector('.sub-chapter-list');
                        if (subList) {
                            li.classList.toggle('expanded');
                            subList.classList.toggle('collapsed');
                        }
                    } else { // It's a new chapter, load it
                        setActiveChapter(li);
                        loadMarkdown(chapter.file).then(contentContainer => {
                            buildSubChapterNav(contentContainer, li, chapter.file);
                        });
                    }
                });
                chapterList.appendChild(li);
            });

            const firstChapterLi = chapterList.querySelector('li');
            if (firstChapterLi) firstChapterLi.click();
        })
        .catch(err => {
            console.error("Failed to load chapters.json:", err);
            contentDiv.innerHTML = "<em>Could not load chapter list. Make sure 'chapters/chapters.json' exists and is valid.</em>";
        });
});