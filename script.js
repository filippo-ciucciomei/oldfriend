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
const menuUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRKlfcjrngSDJkUAmdC9-nt0fYUDeAwY6ehx9SsTptREEkfhxtn2KVcVQfpMnniuM-VE22aditWtY00/pub?gid=0&single=true&output=csv';
const menuContainer = document.getElementById('dynamic-menu-container');

if (menuContainer) {
    fetch(menuUrl)
        .then(response => response.text())
        .then(csvText => {
            // Split the raw CSV text into rows
            const rows = csvText.split('\n');
            let html = '';

            // Loop through each row (skipping the first header row)
            for (let i = 1; i < rows.length; i++) {
                // Split each row into its 3 columns (Dish, Description, Price)
                const columns = rows[i].split(',');
                
                if (columns.length >= 3) {
                    const dish = columns[0].trim();
                    const desc = columns[1].trim();
                    const price = columns[2].trim();

                    // Create the HTML for each item using your site's style
                    html += `
                        <div class="menu-item" style="margin-bottom: 20px;">
                            <div style="display: flex; justify-content: space-between; align-items: baseline;">
                                <h3 style="margin: 0; font-family: 'Bodoni Moda', serif; font-size: 1.2rem;">${dish}</h3>
                                <span style="font-weight: bold;">${price}</span>
                            </div>
                            <p style="margin: 5px 0 0 0; font-size: 0.85rem; color: #555;">${desc}</p>
                        </div>
                    `;
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