// Select all the menu titles
const menuTitles = document.querySelectorAll('.menu-title');

// Add a click event to each title
menuTitles.forEach(title => {
    title.addEventListener('click', () => {
        // Find the content div immediately following the clicked title
        const content = title.nextElementSibling;
        
        // Toggle its display between 'block' (visible) and 'none' (hidden)
        if (content.style.display === "block") {
            content.style.display = "none";
        } else {
            content.style.display = "block";
        }
    });
});