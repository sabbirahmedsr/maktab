/**
 * ============================================================================
 * Content Processing Module
 * ============================================================================
 * Handles fetching markdown files, parsing them, and applying custom
 * styling and functionality to the content.
 */

import { openLetterModal } from './ui.js';

// This is the main area where the chapter's text will be displayed.
const contentDiv = document.getElementById('markdown-content');

/**
 * This is a core function that makes the Arabic letters interactive.
 * It carefully scans through all the text in a chapter. When it finds a
 * sequence of one or more Arabic letters, it wraps them in a special,
 * clickable "card" (a <span> element).
 *
 * This process is recursive, meaning it digs into all child elements to
 * ensure no text is missed, but it's smart enough to skip over parts
 * that are already styled as code, to prevent issues.
 * clickable <span> card.
 * @param {HTMLElement} element The parent element to process.
 */
function wrapArabicLetters(element) {
    const arabicSequenceRegex = /([\u0600-\u06FF]+)/;
    const childNodes = Array.from(element.childNodes);

    childNodes.forEach(node => {
        // We only care about text nodes (nodeType 3).
        if (node.nodeType === 3) { // Text node
            const text = node.textContent;
            // Split the text by sequences of Arabic letters.
            // For example, "Read: قل" becomes ["Read: ", "قل", ""].
            const parts = text.split(arabicSequenceRegex);

            if (parts.length > 1) {
                // A DocumentFragment is like a temporary, lightweight container.
                // It's more efficient to add many elements to it and then add it
                // to the main page once, rather than adding each element one by one.
                const fragment = document.createDocumentFragment();
                parts.forEach(part => {
                    if (!part) return;

                    if (arabicSequenceRegex.test(part)) { // If the part is Arabic...
                        const card = document.createElement('span');
                        card.className = 'arabic-letter-card';
                        card.textContent = part;
                        
                        card.addEventListener('click', () => {
                            openLetterModal(part);
                        });
                        fragment.appendChild(card);
                    } else {
                        // Otherwise, it's just regular text.
                        fragment.appendChild(document.createTextNode(part));
                    }
                });
                // Replace the original text node with our new fragment
                // that contains the mix of text and clickable cards.
                element.replaceChild(fragment, node);
            }
        } else if (node.nodeType === 1 && node.tagName.toLowerCase() !== 'code') {
            // Element node, but ignore content inside <code> tags
            wrapArabicLetters(node); // Do the same process for any child elements.
        }
    });
}

/**
 * Arabic is a right-to-left (RTL) language. This function finds paragraphs
 * or list items that are written entirely in Arabic and tells the browser
 * to align them correctly from right to left.
 * It also centers them if they look like standalone verses.
 * and sets their direction to RTL for correct rendering.
 * @param {HTMLElement} container The parent element to process.
 */
function setRtlDirection(container) {
    const arabicRegex = /[\u0600-\u06FF]/;
    const nonArabicRegex = /[a-zA-Zа-яА-Яঅ-ৎ]/;

    container.querySelectorAll('p, li, blockquote').forEach(el => {
        // If the element has Arabic letters but no letters from other
        // major languages, we assume it's an RTL block.
        const text = el.textContent || '';
        if (arabicRegex.test(text) && !nonArabicRegex.test(text)) {
            el.style.direction = 'rtl';
            el.style.textAlign = text.includes('-') ? 'right' : 'center';
        }
    });
}

/**
 * Handles lines that contain both Bengali and Arabic text (e.g., a translation).
 * This function is clever: it wraps all the Bengali text on the left into one
 * container, and all the Arabic text on the right into another.
 *
 * It then uses CSS Flexbox to align the Bengali part to the left and the Arabic
 * to the left and right respectively.
 * @param {HTMLElement} container The parent element to process.
 */
function styleMixedLanguageLines(container) {
    const bengaliRegex = /[অ-ৎ]/;

    container.querySelectorAll('p, li').forEach(el => {
        const hasArabicCard = el.querySelector('.arabic-letter-card');
        const hasBengaliText = bengaliRegex.test(el.textContent);

        if (hasArabicCard && hasBengaliText && el.lastElementChild?.classList.contains('arabic-letter-card')) {
            // This will hold the Arabic part of the line.
            const rightAlignWrapper = document.createElement('span');
            rightAlignWrapper.className = 'arabic-group';

            // Move all Arabic cards from the end of the line into the new wrapper.
            while (el.lastChild) {
                // We grab any Arabic cards and any whitespace around them.
                const last = el.lastChild;
                if ((last.nodeType === 1 && last.classList.contains('arabic-letter-card')) || (last.nodeType === 3 && last.textContent.trim() === '')) {
                    rightAlignWrapper.prepend(last); // This preserves the visual order by prepending
                } else {
                    break;
                }
            }

            if (rightAlignWrapper.hasChildNodes()) {
                // This will hold the remaining text (the Bengali part).
                const leftTextWrapper = document.createElement('span');
                leftTextWrapper.className = 'bengali-text';
                // Move the rest of the content into the "left" wrapper.
                while (el.firstChild) {
                    leftTextWrapper.appendChild(el.firstChild);
                }
                el.appendChild(leftTextWrapper);
                el.appendChild(rightAlignWrapper);
                // Add a class to the parent paragraph to apply the flexbox styling.
                el.classList.add('mixed-language-line');

                // Set direction to RTL for the Arabic group to ensure correct rendering order
                rightAlignWrapper.dir = 'rtl';
            }
        }
    });
}

/**
 * This is the main function for displaying a chapter. It does the following:
 * 1. Fetches the chapter file (which is written in Markdown).
 * 2. Splits the file into sections based on '---' separators.
 * 3. Wraps each section in a styled 'content-card'.
 * 4. Uses the 'marked' library to convert the Markdown text into HTML.
 * 5. Runs all the processing functions above (wrapArabicLetters, etc.) on the new HTML.
 * 6. Finally, it replaces the old content on the page with the new, fully-processed chapter.
 * @param {string} filename The name of the markdown file to load.
 * @returns {Promise<HTMLElement>} A promise that resolves with the container of the processed content.
 */
export function loadMarkdown(filename) {
    // Fetch the content from the 'chapters' folder.
    return fetch(`chapters/${filename}`)
        .then(res => {
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return res.text();
        })
        .then(md => {
            // A '---' in the file creates a new card.
            const mdSections = md.split(/\n\s*---\s*\n/);
            const allCardsHtml = mdSections
                .map(sectionMd => sectionMd.trim() === '' ? '' : `<div class="content-card">${marked.parse(sectionMd)}</div>`)
                .join('');

            // Create a temporary container to hold the new HTML.
            const tempContainer = document.createElement('div');
            tempContainer.innerHTML = allCardsHtml;

            // Process the newly created content
            wrapArabicLetters(tempContainer);
            styleMixedLanguageLines(tempContainer);
            setRtlDirection(tempContainer);

            // Replace the content of the main div.
            contentDiv.innerHTML = ''; // Clear previous content
            while (tempContainer.firstChild) {
                contentDiv.appendChild(tempContainer.firstChild);
            }
            return contentDiv;
        })
        .catch(err => {
            // If something goes wrong (e.g., file not found), show an error message.
            console.error("Failed to load markdown:", err);
            contentDiv.innerHTML = `<em>Failed to load file: ${filename}.</em>`;
            return contentDiv;
        });
}