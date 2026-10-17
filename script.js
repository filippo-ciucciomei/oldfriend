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

// Fetch and display the Google Sheet Menu
// Fetch and display the Google Sheet Menu
const menuUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRKlfcjrngSDJkUAmdC9-nt0fYUDeAwY6ehx9SsTptREEkfhxtn2KVcVQfpMnniuM-VE22aditWtY00/pub?gid=0&single=true&output=csv';
const menuContainer = document.getElementById('dynamic-menu-container');

if (menuContainer) {
    fetch(menuUrl)
        .then(response => response.text())
        .then(csvText => {
            const rows = csvText.split('\n');
            let html = '';

            // Loop through each row (skipping the first header row)
            for (let i = 1; i < rows.length; i++) {
                if (!rows[i].trim()) continue; // Skip completely empty rows

                // A smarter CSV reader that ignores commas if they are inside a single dish name
                let columns = [];
                let inQuotes = false;
                let currentString = '';
                
                for (let char of rows[i]) {
                    if (char === '"') {
                        inQuotes = !inQuotes; // Ignore the hidden quotes Google adds
                    } else if (char === ',' && !inQuotes) {
                        columns.push(currentString);
                        currentString = '';
                    } else {
                        currentString += char;
                    }
                }
                columns.push(currentString);
                
                // Make sure we have at least columns A, B, and C
                if (columns.length >= 3) {
                    const dish = columns[0].trim();
                    const price = columns[2].trim(); // Price is in column C

                    // Only generate the HTML if a dish and price actually exist on this row
                    if (dish && price) {
                        html += `
                            <div class="menu-item" style="margin-bottom: 20px;">
                                <div style="display: flex; justify-content: space-between; align-items: baseline;">
                                    <h3 style="margin: 0; font-family: 'Bodoni Moda', serif; font-size: 1.2rem; font-weight: normal;">${dish}</h3>
                                    <span style="font-weight: bold; white-space: nowrap; margin-left: 15px;">€${price}</span>
                                </div>
                            </div>
                        `;
                    }
                }
            }
            // Inject the generated HTML into the page
            menuContainer.innerHTML = html;
        })
        .catch(error => {
            console.error('Error loading menu:', error);
            menuContainer.innerHTML = 'Menu temporarily unavailable. Please check back later.';
        });
}



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