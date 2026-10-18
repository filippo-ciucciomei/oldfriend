// --- Language Translation Dictionary ---
const translations = {
    en: {
        navBooking: "Booking",
        navMenu: "Menu",
        navWho: "Who we are",
        navContact: "Contact",
        accordionMenu: "Menu",
        accordionWho: "Who we are",
        accordionContact: "Contact",
        loadingMenu: "Loading today's menus...",
        whoText: "A culinary concept shaped by Chef Dario Torabi's relentless research. An authentic, unadorned experience rooted in an obsession with exceptional ingredients, strict seasonality, and honoring every single element in its purest, most profound expression.",
        contactAddress: "Address",
        contactHeader: "Contact",
        contactReservations: "Reservations",
        contactBookTable: "Book a Table",
        perPerson: "per person",
        orDivider: "- or -"
    },
    it: {
        navBooking: "Prenotazioni",
        navMenu: "Menu",
        navWho: "Chi Siamo",
        navContact: "Contatti",
        accordionMenu: "Menu",
        accordionWho: "Chi Siamo",
        accordionContact: "Contatti",
        loadingMenu: "Caricamento menu del giorno...",
        whoText: "Un progetto di cucina guidato dalla ricerca continua dello chef Dario Torabi. Un’esperienza autentica e senza orpelli, fondata sull'ossessione per la materia prima d'eccellenza, la stagionalità assoluta e la valorizzazione di ogni singolo ingrediente nella sua espressione più pura e profonda.",
        contactAddress: "Indirizzo",
        contactHeader: "Contatti",
        contactReservations: "Prenotazioni",
        contactBookTable: "Prenota un Tavolo",
        perPerson: "a persona",
        orDivider: "- oppure -"
    }
};

let currentLang = 'en';

// Detect language on startup (localStorage -> browser language -> default EN)
function initLanguage() {
    const savedLang = localStorage.getItem('site_lang');
    if (savedLang) {
        currentLang = savedLang;
    } else {
        const userLang = navigator.language || navigator.userLanguage || 'en';
        currentLang = userLang.toLowerCase().startsWith('it') ? 'it' : 'en';
    }
    applyLanguage(currentLang);
}

// Update DOM elements with data-i18n attributes
function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('site_lang', lang);

    document.querySelectorAll('[data-i18n]').forEach(el => {
        // Skip updating the loading text if the food menu has already loaded into the container
        if (el.getAttribute('data-i18n') === 'loadingMenu' && !document.querySelector('[data-i18n="loadingMenu"]')) {
            return;
        }

        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) {
            el.innerHTML = translations[lang][key];
        }
    });

    // Update Language Buttons Active Class
    const btnEn = document.getElementById('lang-btn-en');
    const btnIt = document.getElementById('lang-btn-it');

    if (btnEn && btnIt) {
        if (lang === 'en') {
            btnEn.classList.add('active');
            btnIt.classList.remove('active');
        } else {
            btnIt.classList.add('active');
            btnEn.classList.remove('active');
        }
    }
}

// Initialize on DOM Load and register ENG / ITA click handlers
document.addEventListener('DOMContentLoaded', () => {
    initLanguage();

    const btnEn = document.getElementById('lang-btn-en');
    const btnIt = document.getElementById('lang-btn-it');

    if (btnEn) btnEn.addEventListener('click', () => applyLanguage('en'));
    if (btnIt) btnIt.addEventListener('click', () => applyLanguage('it'));
});

// --- Accordion Logic ---
const menuTitles = document.querySelectorAll('.menu-title');

menuTitles.forEach(title => {
    title.addEventListener('click', () => {
        title.classList.toggle('active');
    });
});

// --- Image Carousel Logic ---
const carouselTrack = document.getElementById('carousel-track');
const carouselContainer = document.getElementById('image-carousel');

if (carouselTrack && carouselContainer) {
    let imageHTML = '';
    
    for (let i = 1; i <= 20; i++) {
        if (i === 5) continue;
        let num = i < 10 ? `0${i}` : i;
        imageHTML += `<img src="media/photos/image ${num}.jpeg" alt="Old Friend Gallery">`;
    }
    
    carouselTrack.innerHTML = imageHTML + imageHTML;

    let isMousePaused = false;
    carouselContainer.addEventListener('click', (e) => {
        if (e.pointerType === 'touch') return; 
        
        isMousePaused = !isMousePaused;
        if (isMousePaused) {
            carouselTrack.classList.add('paused');
        } else {
            carouselTrack.classList.remove('paused');
        }
    });

    carouselContainer.addEventListener('touchstart', () => {
        carouselTrack.classList.add('paused');
    }, { passive: true });

    carouselContainer.addEventListener('touchend', () => {
        if (!isMousePaused) {
            carouselTrack.classList.remove('paused');
        }
    });
    
    carouselContainer.addEventListener('touchcancel', () => {
        if (!isMousePaused) {
            carouselTrack.classList.remove('paused');
        }
    });
}

// --- Advanced Menu & Modal Logic ---
const sheetGIDs = {
    'Setting': '1364472520',
    'Alla Carta': '0',
    'Degustazione 1': '529150115',
    'Degustazione 2': '1827317788',
    'Degustazione 3': '554996654',
    'ALLERGENI': '439586197'
};

const baseCSVUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRKlfcjrngSDJkUAmdC9-nt0fYUDeAwY6ehx9SsTptREEkfhxtn2KVcVQfpMnniuM-VE22aditWtY00/pub?single=true&output=csv&gid=";

const menuContainer = document.getElementById('dynamic-menu-container');
const modal = document.getElementById('menu-modal');
const modalContent = document.getElementById('modal-content');
const modalClose = document.getElementById('modal-close');

function parseCSV(text) {
    const rows = [];
    let cur = '', inQuotes = false, row = [];
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char === '"') { inQuotes = !inQuotes; }
        else if (char === ',' && !inQuotes) { row.push(cur.trim()); cur = ''; }
        else if (char === '\n' && !inQuotes) { row.push(cur.trim()); rows.push(row); row = []; cur = ''; }
        else { cur += char; }
    }
    row.push(cur.trim()); rows.push(row);
    return rows;
}

function formatAllergens(text) {
    return text.replace(/\^\{?([\d, ]+)\}?/g, '<sup class="allergen-sup">$1</sup>');
}

// Initial Load: Fetch Settings Tab
if (menuContainer) {
    fetch(baseCSVUrl + sheetGIDs['Setting'])
        .then(res => res.text())
        .then(csvText => {
            const rows = parseCSV(csvText);
            let allaCartaHtml = '';
            let degustazioneHtml = '';

            for (let i = 1; i < rows.length; i++) {
                if (rows[i].length < 6) continue;
                const [tipo, tab, nome, desc, costo, visibile] = rows[i];
                
                if (visibile.toUpperCase() !== 'TRUE') continue;

                if (tipo === 'Alla Carta') {
                    allaCartaHtml += `
                        <div class="menu-category-title" onclick="openMenuModal('${tab}', 'Alla Carta', '')" style="cursor:pointer;">
                            <span>Alla Carta <span class="plus-icon">+</span></span>
                        </div>`;
                } else if (tipo === 'Degustazione') {
                    degustazioneHtml += `
                        <div class="menu-link" onclick="openMenuModal('${tab}', '${nome}', '${costo}')">
                            <div class="menu-link-header">
                                <span>${nome} <span class="plus-icon">+</span></span>
                                <span class="menu-link-price">${costo ? '€' + costo : ''}</span>
                            </div>
                            <p class="menu-link-desc">${desc}</p>
                        </div>`;
                }
            }

            let finalHtml = '';
            if (allaCartaHtml) finalHtml += allaCartaHtml;
            if (degustazioneHtml) finalHtml += `<div class="menu-category-title">Degustazione</div>` + degustazioneHtml;
            
            menuContainer.innerHTML = finalHtml;
        });
}

function closeModalVisuals() {
    if (modal) modal.classList.remove('active');
    document.body.classList.remove('modal-open');
}

// Open Modal & Fetch Specific Menu + Allergens (with History Back Support)
window.openMenuModal = function(tabName, menuTitle, menuPrice) {
    document.body.classList.add('modal-open');
    modalContent.innerHTML = currentLang === 'it' ? "Caricamento in corso..." : "Loading...";
    modal.classList.add('active');

    history.pushState({ modalOpen: true }, "");

    Promise.all([
        fetch(baseCSVUrl + sheetGIDs[tabName]).then(res => res.text()),
        fetch(baseCSVUrl + sheetGIDs['ALLERGENI']).then(res => res.text())
    ]).then(([menuCsv, allergenCsv]) => {
        const menuRows = parseCSV(menuCsv);
        const allergenRows = parseCSV(allergenCsv);

        let allergenHtml = `<div class="allergen-footer"><strong>Allergeni:</strong><br>`;
        for(let i=0; i<allergenRows.length; i++) {
            if(allergenRows[i][0]) allergenHtml += allergenRows[i][0] + ' &nbsp;&nbsp; ';
        }
        allergenHtml += '</div>';

        let html = `<h2 class="modal-title">${menuTitle}</h2>`;
        if(menuPrice) {
            const perPersonStr = translations[currentLang].perPerson;
            html += `<div class="modal-subtitle">${menuPrice} € ${perPersonStr}</div>`;
        }

        if (tabName === 'Alla Carta') {
            for(let i=1; i<menuRows.length; i++) {
                const dish = menuRows[i][0];
                const price = menuRows[i][2] || menuRows[i][1]; 
                if(dish && price) {
                    html += `<div class="dish-item-alla-carta">
                                <span>${formatAllergens(dish)}</span>
                                <strong>€${price}</strong>
                             </div>`;
                }
            }
        } else {
            let op1Html = '';
            let op2Html = '';
            for(let i=1; i<menuRows.length; i++) {
                const op1 = menuRows[i][0];
                const op2 = menuRows[i][1];
                if(op1) op1Html += `<div class="dish-item">${formatAllergens(op1)}</div>`;
                if(op2) op2Html += `<div class="dish-item">${formatAllergens(op2)}</div>`;
            }
            html += op1Html;
            if(op2Html) {
                const orStr = translations[currentLang].orDivider;
                html += `<div class="oppure">${orStr}</div>`;
                html += op2Html;
            }
        }
        modalContent.innerHTML = html + allergenHtml;
    }).catch(err => {
        modalContent.innerHTML = currentLang === 'it' ? "Errore durante il caricamento del menu." : "Error loading menu.";
        console.error(err);
    });
};

if (modalClose) {
    modalClose.addEventListener('click', () => {
        closeModalVisuals();
        if (history.state && history.state.modalOpen) {
            history.back();
        }
    });
}

window.addEventListener('popstate', () => {
    if (modal && modal.classList.contains('active')) {
        closeModalVisuals();
    }
});

// --- Header Background Logic ---
const michelinWrapper = document.getElementById('michelin-wrapper');
const fixedLogoContainer = document.querySelector('.fixed-logo-container');
const hamburgerBtn = document.getElementById('hamburger-btn');
const fullscreenMenu = document.getElementById('fullscreen-menu');

window.addEventListener('scroll', () => {
    if (michelinWrapper) {
        const rect = michelinWrapper.getBoundingClientRect();
        
        if (rect.top <= 80) {
            if (fixedLogoContainer) fixedLogoContainer.classList.add('scrolled-bg');
            if (hamburgerBtn) hamburgerBtn.classList.add('scrolled-bg');
        } else {
            if (fixedLogoContainer) fixedLogoContainer.classList.remove('scrolled-bg');
            if (hamburgerBtn) hamburgerBtn.classList.remove('scrolled-bg');
        }
    }
});

// --- Hamburger Menu Logic ---
if (hamburgerBtn) {
    hamburgerBtn.addEventListener('click', () => {
        hamburgerBtn.classList.toggle('open');
        if (fullscreenMenu) fullscreenMenu.classList.toggle('active');
        document.body.classList.toggle('modal-open');
    });
}

// --- Menu Navigation & Auto-Open Accordions ---
const navLinks = document.querySelectorAll('.nav-link');

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('data-target');
        const targetAccordion = document.getElementById(targetId);

        hamburgerBtn.classList.remove('open');
        if (fullscreenMenu) fullscreenMenu.classList.remove('active');
        document.body.classList.remove('modal-open');

        if (targetAccordion) {
            targetAccordion.scrollIntoView({ behavior: 'smooth', block: 'start' });

            if (!targetAccordion.classList.contains('active')) {
                setTimeout(() => {
                    targetAccordion.click();
                }, 300);
            }
        }
    });
});