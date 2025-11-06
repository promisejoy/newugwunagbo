        // Set current year in footer
        document.getElementById('currentYear').textContent = new Date().getFullYear();

        // Load villages data
       // In newvillages.js - UPDATE the loadVillages function
async function loadVillages() {
    const villagesContainer = document.getElementById('villagesContainer');
    if (!villagesContainer) {
        console.error('❌ Villages container not found');
        return;
    }
    
    console.log('🏡 Loading villages with cache busting...');
    villagesContainer.innerHTML = '<p><i class="fas fa-spinner fa-spin"></i> Loading villages...</p>';
    
    try {
        // Add cache busting parameter
        const response = await fetch('/api/villages?' + new Date().getTime());
        console.log('📥 Villages API response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const villagesData = await response.json();
        console.log('✅ Villages data received:', villagesData.length, 'villages');
        
        villagesContainer.innerHTML = '';
        
        if (villagesData.length > 0) {
            // Update stats
            const totalVillagesElement = document.getElementById('totalVillages');
            if (totalVillagesElement) {
                totalVillagesElement.textContent = villagesData.length;
            }
            
            // Add villages to grid
            villagesData.forEach(village => {
                const villageCard = document.createElement('div');
                villageCard.className = 'village-card';
                villageCard.setAttribute('data-village-id', village.id);
                villageCard.innerHTML = `
                    <div class="village-name">
                        <i class="fas fa-map-marker-alt"></i>
                        ${village.name}
                    </div>
                    <div class="village-description">
                        ${village.description || 'A vibrant community in Ugwunagbo Local Government Area.'}
                    </div>
                    <div class="village-id" style="font-size: 0.8em; color: #888; margin-top: 10px;">
                        ID: ${village.id}
                    </div>
                `;
                villagesContainer.appendChild(villageCard);
            });
            
            console.log(`✅ Displayed ${villagesData.length} villages`);
        } else {
            villagesContainer.innerHTML = `
                <div class="no-villages">
                    <i class="fas fa-map-marker-alt"></i>
                    <h3>No Villages Added Yet</h3>
                    <p>Village information will appear here once added by the administrator</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('❌ Error loading villages:', error);
        villagesContainer.innerHTML = `
            <div class="no-villages">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error Loading Villages</h3>
                <p>Please try again later or contact the administrator</p>
                <p><strong>Error:</strong> ${error.message}</p>
                <button onclick="loadVillages()" class="btn btn-primary">Retry</button>
            </div>
        `;
    }
}

// Add a manual refresh function
function refreshVillages() {
    console.log('🔄 Manually refreshing villages list...');
    loadVillages();
}


        // Search functionality
        function initializeSearch() {
            const searchInput = document.getElementById('villageSearch');
            if (!searchInput) return;

            searchInput.addEventListener('input', function(e) {
                const searchTerm = e.target.value.toLowerCase();
                const villageCards = document.querySelectorAll('.village-card');
                
                villageCards.forEach(card => {
                    const villageName = card.querySelector('.village-name').textContent.toLowerCase();
                    if (villageName.includes(searchTerm)) {
                        card.style.display = 'block';
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        }

        // Scroll to top functionality
        function initializeScrollToTop() {
            const scrollToTopBtn = document.getElementById('scrollToTop');
            
            if (!scrollToTopBtn) return;

            scrollToTopBtn.style.display = 'none';
            
            window.addEventListener('scroll', () => {
                if (window.pageYOffset > 300) {
                    scrollToTopBtn.style.display = 'block';
                    scrollToTopBtn.classList.add('show');
                } else {
                    scrollToTopBtn.style.display = 'none';
                    scrollToTopBtn.classList.remove('show');
                }
            });

            scrollToTopBtn.addEventListener('click', () => {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            });
        }

        // Initialize everything when page loads
        document.addEventListener('DOMContentLoaded', function() {
            console.log('🏡 Newvillage page loaded, initializing...');
            loadVillages();
            initializeSearch();
            initializeScrollToTop();
        });