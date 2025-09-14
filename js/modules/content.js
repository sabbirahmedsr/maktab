/**
 * ============================================================================
 * Content Processing Module
 * ============================================================================
 * Handles fetching markdown files, parsing them, and applying custom
 * styling and functionality to the content.
 */

import { openLetterModal } from './ui.js';

const contentDiv = document.getElementById('markdown-content');

/**
 * Traverses a DOM element, finds text nodes containing Arabic letters,
 * and wraps each consecutive sequence of Arabic letters in a styled,
 * clickable <span> card.
 * @param {HTMLElement} element The parent element to process.
 */
function wrapArabicLetters(element) {
    const arabicSequenceRegex = /([\u0600-\u06FF]+)/;
    const childNodes = Array.from(element.childNodes);

    childNodes.forEach(node => {
        if (node.nodeType === 3) { // Text node
            const text = node.textContent;
            const parts = text.split(arabicSequenceRegex);

            if (parts.length > 1) {
                const fragment = document.createDocumentFragment();
                parts.forEach(part => {
                    if (!part) return;

                    if (arabicSequenceRegex.test(part)) {
                        const card = document.createElement('span');
                        card.className = 'arabic-letter-card';
                        card.textContent = part;
                        
                        card.addEventListener('click', () => {
                            openLetterModal(part);
                        });
                        fragment.appendChild(card);
                    } else {
                        fragment.appendChild(document.createTextNode(part));
                    }
                });
                element.replaceChild(fragment, node);
            }
        } else if (node.nodeType === 1 && node.tagName.toLowerCase() !== 'code') { 
            // Element node, but ignore content inside <code> tags
            wrapArabicLetters(node); // Recurse into child elements
        }
    });
}

/**
 * Finds block elements (like <p>) that contain primarily Arabic text
 * and sets their direction to RTL for correct rendering.
 * @param {HTMLElement} container The parent element to process.
 */
function setRtlDirection(container) {
    const arabicRegex = /[\u0600-\u06FF]/;
    const nonArabicRegex = /[a-zA-Zа-яА-Яঅ-ৎ]/;

    container.querySelectorAll('p, li, blockquote').forEach(el => {
        const text = el.textContent || '';
        if (arabicRegex.test(text) && !nonArabicRegex.test(text)) {
            el.style.direction = 'rtl';
            el.style.textAlign = text.includes('-') ? 'right' : 'center';
        }
    });
}

/**
 * Styles lines with mixed Bengali and Arabic text. It wraps the Bengali
 * and Arabic parts in separate spans and uses flexbox to align them
 * to the left and right respectively.
 * @param {HTMLElement} container The parent element to process.
 */
function styleMixedLanguageLines(container) {
    const bengaliRegex = /[অ-ৎ]/;

    container.querySelectorAll('p, li').forEach(el => {
        const hasArabicCard = el.querySelector('.arabic-letter-card');
        const hasBengaliText = bengaliRegex.test(el.textContent);

        if (hasArabicCard && hasBengaliText && el.lastElementChild?.classList.contains('arabic-letter-card')) {
            const rightAlignWrapper = document.createElement('span');
            rightAlignWrapper.className = 'arabic-group';

            while (el.lastChild) {
                const last = el.lastChild;
                if ((last.nodeType === 1 && last.classList.contains('arabic-letter-card')) || (last.nodeType === 3 && last.textContent.trim() === '')) {
                    rightAlignWrapper.prepend(last); // This preserves the visual order by prepending
                } else {
                    break;
                }
            }

            if (rightAlignWrapper.hasChildNodes()) {
                const leftTextWrapper = document.createElement('span');
                leftTextWrapper.className = 'bengali-text';
                while (el.firstChild) {
                    leftTextWrapper.appendChild(el.firstChild);
                }
                el.appendChild(leftTextWrapper);
                el.appendChild(rightAlignWrapper);
                el.classList.add('mixed-language-line');

                // Set direction to RTL for the Arabic group to ensure correct rendering order
                rightAlignWrapper.dir = 'rtl';
            }
        }
    });
}

/**
 * Fetches a markdown file, processes it, and renders it into the main content area.
 * @param {string} filename The name of the markdown file to load.
 * @returns {Promise<HTMLElement>} A promise that resolves with the container of the processed content.
 */
export function loadMarkdown(filename) {
    return fetch(`chapters/${filename}`)
        .then(res => {
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return res.text();
        })
        .then(md => {
            const mdSections = md.split(/\n\s*---\s*\n/);
            const allCardsHtml = mdSections
                .map(sectionMd => sectionMd.trim() === '' ? '' : `<div class="content-card">${marked.parse(sectionMd)}</div>`)
                .join('');

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
            console.error("Failed to load markdown:", err);
            contentDiv.innerHTML = `<em>Failed to load file: ${filename}.</em>`;
            return contentDiv;
        });
}