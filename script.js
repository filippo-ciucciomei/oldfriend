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
    
    // Generate image tags from 01 to 20 (skipping 05 as it's used elsewhere)
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

// Helper function to close the modal visually and unlock scroll
function closeModalVisuals() {
    if (modal) modal.classList.remove('active');
    document.body.classList.remove('modal-open');
}

// Open Modal and Fetch specific Menu + Allergens (with History Back Support)
window.openMenuModal = function(tabName, menuTitle, menuPrice) {
    document.body.classList.add('modal-open');
    modalContent.innerHTML = "Caricamento in corso...";
    modal.classList.add('active');

    // Push state so pressing mobile "Back" closes modal instead of navigating away
    history.pushState({ modalOpen: true }, "");

    Promise.all([
        fetch(baseCSVUrl + sheetGIDs[tabName]).then(res => res.text()),
        fetch(baseCSVUrl + sheetGIDs['ALLERGENI']).then(res => res.text())
    ]).then(([menuCsv, allergenCsv]) => {
        const menuRows = parseCSV(menuCsv);
        const allergenRows = parseCSV(allergenCsv);

        let allergenHtml = '<div class="allergen-footer"><strong>Allergeni:</strong><br>';
        for(let i=0; i<allergenRows.length; i++) {
            if(allergenRows[i][0]) allergenHtml += allergenRows[i][0] + ' &nbsp;&nbsp; ';
        }
        allergenHtml += '</div>';

        let html = `<h2 class="modal-title">${menuTitle}</h2>`;
        if(menuPrice) html += `<div class="modal-subtitle">${menuPrice} € per persona</div>`;

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
                html += `<div class="oppure">- oppure -</div>`;
                html += op2Html;
            }
        }
        modalContent.innerHTML = html + allergenHtml;
    }).catch(err => {
        modalContent.innerHTML = "Errore durante il caricamento del menu.";
        console.error(err);
    });
};

// Close modal when X is clicked (cleans up browser history state)
if (modalClose) {
    modalClose.addEventListener('click', () => {
        closeModalVisuals();
        if (history.state && history.state.modalOpen) {
            history.back();
        }
    });
}

// Catch mobile back gesture / hardware back button
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