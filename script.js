// Select all the menu titles
const menuTitles = document.querySelectorAll('.menu-title');

// Add a click event to each title
menuTitles.forEach(title => {
    title.addEventListener('click', () => {
        // Find the content div immediately following the clicked title
        const content = title.nextElementSibling;
        
        // Toggle the 'active' class on the title to change the font
        title.classList.toggle('active');
        
        // Toggle its display between 'block' (visible) and 'none' (hidden)
        if (content.style.display === "block") {
            content.style.display = "none";
        } else {
            content.style.display = "block";
        }
    });
});




// --- Image Carousel Logic ---
const carouselTrack = document.getElementById('carousel-track');
const carouselContainer = document.getElementById('image-carousel');

if (carouselTrack && carouselContainer) {
    let imageHTML = '';
    
    // Generate image tags from 01 to 20
    for (let i = 1; i <= 20; i++) {
        if (i === 5) continue; // Skip image 06 (the booking image)
        
        // Ensure numbers 1-9 have a leading zero (e.g., '01', '02')
        let num = i < 10 ? `0${i}` : i;
        imageHTML += `<img src="media/photos/image ${num}.jpeg" alt="Old Friend Gallery">`;
    }
    
    // Inject the set of images TWICE. 
    // This allows the CSS to translate 50% left and seamlessly restart the loop.
    carouselTrack.innerHTML = imageHTML + imageHTML;

    // Interaction 1: Mouse Clicks (Toggle pause/play)
    let isMousePaused = false;
    carouselContainer.addEventListener('click', (e) => {
        // Ignore touch events here so mobile behavior isn't triggered twice
        if (e.pointerType === 'touch') return; 
        
        isMousePaused = !isMousePaused;
        if (isMousePaused) {
            carouselTrack.classList.add('paused');
        } else {
            carouselTrack.classList.remove('paused');
        }
    });

    // Interaction 2: Touch Screens (Hold to pause, release to play)
    carouselContainer.addEventListener('touchstart', () => {
        carouselTrack.classList.add('paused');
    }, { passive: true });

    carouselContainer.addEventListener('touchend', () => {
        // Only resume if it wasn't explicitly paused by a mouse click
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

// 1. ADD YOUR TAB GIDs HERE:
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

// Close modal when X is clicked
if(modalClose) modalClose.addEventListener('click', () => modal.classList.remove('active'));

// Robust CSV Parser
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

// Converts ^1 or ^{1,7} into superscript HTML
function formatAllergens(text) {
    return text.replace(/\^\{?([\d, ]+)\}?/g, '<sup class="allergen-sup">$1</sup>');
}

// Initial Load: Fetch Settings Tab
if (menuContainer) {
    fetch(baseCSVUrl + sheetGIDs['Setting'])
        .then(res => res.text())
        .then(csvText => {
            const rows = parseCSV(csvText);
            let html = '';
            let hasAllaCarta = false;
            let degustazioneHtml = '';

            // Loop through settings (skipping header)
            for (let i = 1; i < rows.length; i++) {
                if (rows[i].length < 6) continue;
                const [tipo, tab, nome, desc, costo, visibile] = rows[i];
                
                if (visibile.toUpperCase() !== 'TRUE') continue; // Only show visible items

                if (tipo === 'Alla Carta') {
                    hasAllaCarta = true;
                    html += `<div class="menu-link" onclick="openMenuModal('${tab}', 'Alla Carta', '')">
                                <div class="menu-link-header">Alla Carta</div>
                             </div>`;
                } else if (tipo === 'Degustazione') {
                    degustazioneHtml += `
                        <div class="menu-link" onclick="openMenuModal('${tab}', '${nome}', '${costo}')">
                            <div class="menu-link-header">
                                <span>- ${nome}</span>
                                <span>${costo ? '€' + costo : ''}</span>
                            </div>
                            <p class="menu-link-desc">&nbsp;&nbsp;${desc}</p>
                        </div>`;
                }
            }

            if (degustazioneHtml) {
                html += `<h3 class="menu-category-title">Degustazione</h3>` + degustazioneHtml;
            }
            menuContainer.innerHTML = html;
        });
}

// Open Modal and Fetch specific Menu + Allergens
window.openMenuModal = function(tabName, menuTitle, menuPrice) {
    modalContent.innerHTML = "Caricamento in corso...";
    modal.classList.add('active');

    // Fetch the specific menu tab AND the allergen tab at the same time
    Promise.all([
        fetch(baseCSVUrl + sheetGIDs[tabName]).then(res => res.text()),
        fetch(baseCSVUrl + sheetGIDs['ALLERGENI']).then(res => res.text())
    ]).then(([menuCsv, allergenCsv]) => {
        const menuRows = parseCSV(menuCsv);
        const allergenRows = parseCSV(allergenCsv);

        // Build Allergen Footer
        let allergenHtml = '<div class="allergen-footer"><strong>Allergeni:</strong><br>';
        for(let i=0; i<allergenRows.length; i++) {
            if(allergenRows[i][0]) allergenHtml += allergenRows[i][0] + ' &nbsp;&nbsp; ';
        }
        allergenHtml += '</div>';

        // Build Modal HTML
        let html = `<h2 class="modal-title">${menuTitle}</h2>`;
        if(menuPrice) html += `<div class="modal-subtitle">${menuPrice} € per persona</div>`;

        if (tabName === 'Alla Carta') {
            // Render Alla Carta (Dish on left, Price on right)
            for(let i=1; i<menuRows.length; i++) {
                const dish = menuRows[i][0];
                const price = menuRows[i][2] || menuRows[i][1]; // Check col B or C for price
                if(dish && price) {
                    html += `<div class="dish-item-alla-carta">
                                <span>${formatAllergens(dish)}</span>
                                <strong>€${price}</strong>
                             </div>`;
                }
            }
        } else {
            // Render Degustazione (Opzione 1 and Opzione 2)
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