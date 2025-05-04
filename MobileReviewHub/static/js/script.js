document.addEventListener('DOMContentLoaded', function() {
    // Set default language if not set
    if (!localStorage.getItem('language')) {
        localStorage.setItem('language', 'en');
    }
    
    // Apply saved language preference
    applyLanguage(localStorage.getItem('language'));
    
    // Toggle language
    document.getElementById('langToggle').addEventListener('click', function() {
        const currentLang = localStorage.getItem('language');
        const newLang = currentLang === 'en' ? 'bn' : 'en';
        
        localStorage.setItem('language', newLang);
        applyLanguage(newLang);
    });
    
    // Initialize search functionality
    initializeSearch();
    
    // Initialize tooltips
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
});

// Apply language to the UI
function applyLanguage(lang) {
    // Update body class
    document.body.classList.remove('lang-en', 'lang-bn');
    document.body.classList.add('lang-' + lang);
    
    // Update toggle button text
    const toggleBtn = document.getElementById('langToggle');
    if (lang === 'en') {
        toggleBtn.textContent = 'বাংলা';
    } else {
        toggleBtn.textContent = 'English';
    }
    
    // Update the document title based on language
    if (lang === 'en') {
        document.title = document.querySelector('.en-title').textContent || 'Mobile Review Site';
    } else {
        document.title = document.querySelector('.bn-title').textContent || 'মোবাইল রিভিউ সাইট';
    }
}

// Format price with commas and currency
function formatPrice(price, currency = '৳') {
    return currency + ' ' + price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Format date in the desired format
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', options);
}

// Generate star rating HTML
function generateRatingStars(rating) {
    let stars = '';
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
        stars += '<i class="fas fa-star"></i>';
    }
    
    if (halfStar) {
        stars += '<i class="fas fa-star-half-alt"></i>';
    }
    
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
        stars += '<i class="far fa-star"></i>';
    }
    
    return stars;
}
