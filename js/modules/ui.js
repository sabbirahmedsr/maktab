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
 * A comprehensive data map for each Arabic letter, including its Makhraj number
 * and name in multiple languages. This structure is scalable for future additions
 * like audio files.
 */
const letterData = {
    'ا': { makhraj: 16, name: { bengali: 'আলিফ', english: 'Alif', arabic: 'ألف' } },
    'ب': { makhraj: 15, name: { bengali: 'বা', english: 'Ba', arabic: 'باء' } },
    'ت': { makhraj: 11, name: { bengali: 'তা', english: 'Ta', arabic: 'تاء' } },
    'ث': { makhraj: 13, name: { bengali: 'ছা', english: 'Tha', arabic: 'ثاء' } },
    'ج': { makhraj: 6, name: { bengali: 'জিম', english: 'Jim', arabic: 'جيم' } },
    'ح': { makhraj: 2, name: { bengali: 'হা', english: 'Ha', arabic: 'حاء' } },
    'خ': { makhraj: 3, name: { bengali: 'খ', english: 'Kha', arabic: 'خاء' } },
    'د': { makhraj: 11, name: { bengali: 'দাল', english: 'Dal', arabic: 'دال' } },
    'ذ': { makhraj: 13, name: { bengali: 'যাল', english: 'Dhal', arabic: 'ذال' } },
    'ر': { makhraj: 10, name: { bengali: 'র', english: 'Ra', arabic: 'راء' } },
    'ز': { makhraj: 12, name: { bengali: 'যা', english: 'Zay', arabic: 'زاي' } },
    'س': { makhraj: 12, name: { bengali: 'সিন', english: 'Sin', arabic: 'سين' } },
    'ش': { makhraj: 6, name: { bengali: 'শিন', english: 'Shin', arabic: 'شين' } },
    'ص': { makhraj: 12, name: { bengali: 'সদ', english: 'Sad', arabic: 'صاد' } },
    'ض': { makhraj: 7, name: { bengali: 'দদ', english: 'Dad', arabic: 'ضاد' } },
    'ط': { makhraj: 11, name: { bengali: 'ত', english: 'Ta\'', arabic: 'طاء' } },
    'ظ': { makhraj: 13, name: { bengali: 'য', english: 'Dha\'', arabic: 'ظاء' } },
    'ع': { makhraj: 2, name: { bengali: 'আইন', english: 'Ayn', arabic: 'عين' } },
    'غ': { makhraj: 3, name: { bengali: 'গইন', english: 'Ghayn', arabic: 'غين' } },
    'ف': { makhraj: 14, name: { bengali: 'ফা', english: 'Fa', arabic: 'فاء' } },
    'ق': { makhraj: 4, name: { bengali: 'কফ', english: 'Qaf', arabic: 'قاف' } },
    'ك': { makhraj: 5, name: { bengali: 'কাফ', english: 'Kaf', arabic: 'كاف' } },
    'ل': { makhraj: 8, name: { bengali: 'লাম', english: 'Lam', arabic: 'لام' } },
    'م': { makhraj: 15, name: { bengali: 'মিম', english: 'Mim', arabic: 'ميم' } },
    'ن': { makhraj: 9, name: { bengali: 'নুন', english: 'Nun', arabic: 'نون' } },
    'و': { makhraj: 15, name: { bengali: 'ওয়াও', english: 'Waw', arabic: 'واو' } },
    'ه': { makhraj: 1, name: { bengali: 'হা', english: 'Ha', arabic: 'هاء' } },
    'ء': { makhraj: 1, name: { bengali: 'হামজা', english: 'Hamza', arabic: 'همزة' } },
    'ي': { makhraj: 6, name: { bengali: 'ইয়া', english: 'Ya', arabic: 'ياء' } },
};

/**
 * Converts an Arabic numeral string/number to Bengali numerals.
 * @param {string|number} num The number to convert.
 * @returns {string} The number represented in Bengali script.
 */
function toBengaliNumerals(num) {
    const bengaliNumerals = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return String(num).split('').map(digit => bengaliNumerals[parseInt(digit)]).join('');
}

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

        const data = letterData[letter];
        const makhrajNumber = data?.makhraj;
        const bengaliMakhraj = makhrajNumber ? toBengaliNumerals(makhrajNumber) : '';
        const makhrajHtml = bengaliMakhraj ? `<div class="makhraj-box">${bengaliMakhraj}</div>` : '';
        
        const letterNames = data?.name;
        let letterNameHtml = '';
        if (letterNames) {
            letterNameHtml = `
                <div class="letter-names-group">
                    <div class="letter-name-item arabic-name">${letterNames.arabic}</div>
                    <div class="letter-name-item bengali-name">${letterNames.bengali}</div>
                    <div class="letter-name-item english-name">${letterNames.english}</div>
                </div>
            `;
        }

        const alif = 'ا';
        const waw = 'و';
        const ya = 'ي';

        // Create the HTML structure for the single letter and its combinations
        letterModalBody.innerHTML = `
            <div class="letter-header">
                ${letterNameHtml}
                <div class="single-letter-display">${letter}</div>
            </div>
            <div class="examples-container">
                <div class="combination-examples">
                    <span class="example">${letter + alif}</span>
                    <span class="example">${letter + waw}</span>
                    <span class="example">${letter + ya}</span>
                </div>
                <div class="positional-form-container">
                    <div class="positional-form-example">${letter + letter + letter}</div>
                    ${makhrajHtml}
                </div>
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