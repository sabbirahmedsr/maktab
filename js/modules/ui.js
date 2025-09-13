/**
 * ============================================================================
 * UI Module
 * ============================================================================
 * Handles general UI interactions like modals and navigation state.
 */

// DOM elements that this module interacts with
const letterModalOverlay = document.getElementById('letter-modal-overlay');
const letterModalContainer = document.getElementById('letter-modal-container');
const letterModalBody = document.getElementById('letter-modal-body');

/**
 * Opens the letter modal with the specified letter.
 * @param {string} letter The letter or sequence to display.
 */
export function openLetterModal(letter) {
    // Reset modal body for new content
    letterModalBody.innerHTML = '';
    letterModalBody.className = 'letter-modal-body'; // Reset classes

    if (letter.length > 1) {
        // --- Combined Letter View ---
        // For combined letters, show the full composition equation
        letterModalBody.textContent = `${letter.split('').join(' + ')} = ${letter}`;
    } else {
        // --- Single Letter View ---
        letterModalBody.classList.add('single-letter-view');

        const alif = 'ا';
        const waw = 'و';
        const ya = 'ي';

        // Create the HTML structure for the single letter and its combinations
        letterModalBody.innerHTML = `
            <div class="single-letter-display">${letter}</div>
            <div class="examples-container">
                <div class="combination-examples">
                    <span class="example">${letter + alif}</span>
                    <span class="example">${letter + waw}</span>
                    <span class="example">${letter + ya}</span>
                </div>
                <div class="positional-form-example">${letter + letter + letter}</div>
            </div>
        `;
    }

    letterModalOverlay.classList.remove('modal-hidden');
    setTimeout(() => letterModalOverlay.classList.add('visible'), 10);

    letterModalOverlay.addEventListener('click', closeLetterModalOnClickOutside);
    window.addEventListener('keydown', closeLetterModalOnEscape);
}

/**
 * Closes the letter modal and cleans up event listeners.
 */
function closeLetterModal() {
    letterModalOverlay.classList.remove('visible');

    setTimeout(() => letterModalOverlay.classList.add('modal-hidden'), 300);

    letterModalOverlay.removeEventListener('click', closeLetterModalOnClickOutside);
    window.removeEventListener('keydown', closeLetterModalOnEscape);
}

function closeLetterModalOnClickOutside(e) { if (e.target === letterModalOverlay) closeLetterModal(); }
function closeLetterModalOnEscape(e) { if (e.key === 'Escape') closeLetterModal(); }

/**
 * Manages the 'active' state for the main chapter list items.
 * @param {HTMLLIElement | null} liElement The chapter list item to activate.
 */
export function setActiveChapter(liElement) {
    const currentActive = document.querySelector('#chapter-list > li.active');
    if (currentActive && currentActive !== liElement) {
        currentActive.classList.remove('active', 'expanded', 'has-sub-chapters');
        const oldSubList = currentActive.querySelector('.sub-chapter-list');
        if (oldSubList) oldSubList.remove();
    }
    if (liElement) {
        liElement.classList.add('active');
    }
}