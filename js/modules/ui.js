/**
 * ============================================================================
 * UI Module
 * ============================================================================
 * Handles general UI interactions like modals and navigation state.
 */

// DOM elements that this module interacts with
const letterModalOverlay = document.getElementById('letter-modal-overlay');
const letterModalBody = document.getElementById('letter-modal-body');
const letterModalClose = document.getElementById('letter-modal-close');

/**
 * Opens the letter modal with the specified letter.
 * @param {string} letter The letter or sequence to display.
 */
export function openLetterModal(letter) {
    letterModalBody.textContent = letter;
    letterModalOverlay.classList.remove('modal-hidden');
    setTimeout(() => letterModalOverlay.classList.add('visible'), 10);

    letterModalClose.addEventListener('click', closeLetterModal);
    letterModalOverlay.addEventListener('click', closeLetterModalOnClickOutside);
    window.addEventListener('keydown', closeLetterModalOnEscape);
}

/**
 * Closes the letter modal and cleans up event listeners.
 */
function closeLetterModal() {
    letterModalOverlay.classList.remove('visible');
    setTimeout(() => letterModalOverlay.classList.add('modal-hidden'), 300);

    letterModalClose.removeEventListener('click', closeLetterModal);
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