function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    const phonesContainer = document.getElementById('phonesContainer');
    
    if (!searchInput) return;
    
    // Debounce function to avoid excessive API calls
    function debounce(func, delay) {
        let debounceTimer;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => func.apply(context, args), delay);
        };
    }
    
    // Function to perform search
    const performSearch = debounce(function(query) {
        if (query.length < 2) {
            searchResults.innerHTML = '';
            searchResults.classList.add('d-none');
            phonesContainer.classList.remove('d-none');
            return;
        }
        
        fetch(`/search?q=${encodeURIComponent(query)}`)
            .then(response => response.json())
            .then(data => {
                if (data.count > 0) {
                    displaySearchResults(data.results);
                } else {
                    const lang = localStorage.getItem('language') || 'en';
                    searchResults.innerHTML = `
                        <div class="alert alert-info">
                            <span class="en-content">No phones found matching your search.</span>
                            <span class="bn-content">আপনার অনুসন্ধানের সাথে মিলে এমন কোন ফোন পাওয়া যায়নি।</span>
                        </div>
                    `;
                    applyLanguage(lang);
                }
                searchResults.classList.remove('d-none');
                phonesContainer.classList.add('d-none');
            })
            .catch(error => {
                console.error('Search error:', error);
                searchResults.innerHTML = `
                    <div class="alert alert-danger">
                        <span class="en-content">An error occurred during search. Please try again.</span>
                        <span class="bn-content">অনুসন্ধানের সময় একটি ত্রুটি ঘটেছে। অনুগ্রহ করে আবার চেষ্টা করুন।</span>
                    </div>
                `;
                searchResults.classList.remove('d-none');
            });
    }, 300);
    
    // Function to display search results
    function displaySearchResults(phones) {
        searchResults.innerHTML = '';
        
        const resultsContainer = document.createElement('div');
        resultsContainer.className = 'list-group shadow';
        
        phones.forEach(phone => {
            const isUpcoming = phone.file_path.toLowerCase().includes('upcoming');
            
            const phoneElement = document.createElement('a');
            phoneElement.href = `/phone/${phone.file_path}`;
            phoneElement.className = 'list-group-item list-group-item-action';
            
            const upcoming = isUpcoming 
                ? `<span class="badge bg-warning float-end">
                     <span class="en-content">Upcoming</span>
                     <span class="bn-content">আসন্ন</span>
                   </span>` 
                : '';
            
            phoneElement.innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h5 class="mb-1">
                            <span class="en-content">${phone.title}</span>
                            <span class="bn-content">${phone.title_bn || phone.title}</span>
                        </h5>
                        <p class="mb-1 text-muted">
                            <span class="en-content">${phone.brand}</span>
                            <span class="bn-content">${phone.brand_bn || phone.brand}</span>
                        </p>
                    </div>
                    <div>
                        ${upcoming}
                        <span class="badge bg-primary">
                            ${phone.price ? '৳ ' + phone.price : 'TBA'}
                        </span>
                    </div>
                </div>
            `;
            
            resultsContainer.appendChild(phoneElement);
        });
        
        searchResults.appendChild(resultsContainer);
        
        // Apply current language to results
        applyLanguage(localStorage.getItem('language') || 'en');
    }
    
    // Clear search results when clicking outside
    document.addEventListener('click', function(event) {
        if (!searchInput.contains(event.target) && !searchResults.contains(event.target)) {
            searchResults.innerHTML = '';
            searchResults.classList.add('d-none');
            if (searchInput.value.length < 2) {
                phonesContainer.classList.remove('d-none');
            }
        }
    });
    
    // Event listener for search input
    searchInput.addEventListener('input', function() {
        const query = this.value.trim();
        performSearch(query);
    });
    
    // Clear button functionality
    const clearSearchBtn = document.getElementById('clearSearch');
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', function() {
            searchInput.value = '';
            searchResults.innerHTML = '';
            searchResults.classList.add('d-none');
            phonesContainer.classList.remove('d-none');
            searchInput.focus();
        });
    }
}
