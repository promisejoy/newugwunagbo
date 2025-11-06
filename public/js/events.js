// events.js - Load and display events on events.html page

document.addEventListener('DOMContentLoaded', function() {
    console.log('Events page loaded');
    loadEvents();
    initializeEventFilters();
});

// Load events from API and display them
async function loadEvents() {
    const eventsContainer = document.getElementById('eventsContainer');
    if (!eventsContainer) return;
    
    eventsContainer.innerHTML = '<p style="text-align: center; padding: 40px;">Loading events...</p>';
    
    try {
        const response = await fetch('/api/events');
        if (!response.ok) throw new Error('Failed to fetch events');
        
        const eventsData = await response.json();
        
        eventsContainer.innerHTML = '';
        
        if (eventsData.length === 0) {
            eventsContainer.innerHTML = `
                <div class="no-events">
                    <i class="fas fa-calendar-alt"></i>
                    <h3>No Events Available</h3>
                    <p>Events will appear here once uploaded through the admin dashboard</p>
                </div>
            `;
            return;
        }
        
        // Sort events by date (soonest first)
        const sortedEvents = eventsData.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        sortedEvents.forEach(event => {
            const eventCard = createEventCard(event);
            eventsContainer.appendChild(eventCard);
        });
        
        console.log(`Loaded ${eventsData.length} events`);
        
    } catch (error) {
        console.error('Error loading events:', error);
        eventsContainer.innerHTML = `
            <div class="no-events">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error Loading Events</h3>
                <p>Unable to load events. Please try again later.</p>
            </div>
        `;
    }
}

// Create event card HTML
function createEventCard(event) {
    const eventCard = document.createElement('div');
    eventCard.className = 'event-card';
    eventCard.setAttribute('data-category', event.category);
    
    const imageUrl = event.image ? 
        (event.image.startsWith('http') ? event.image : event.image) : 
        "https://images.unsplash.com/photo-1511578314322-379afb476865?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80";
    
    const eventDate = new Date(event.date);
    const formattedDate = formatEventDate(eventDate);
    
    eventCard.innerHTML = `
        <div class="event-image">
            <img src="${imageUrl}" alt="${event.title}" loading="lazy">
        </div>
        <div class="event-content">
            <div class="event-date">${formattedDate}</div>
            <h3 class="event-title">${event.title}</h3>
            <p class="event-description">${event.description}</p>
            <div class="event-details">
                <div class="event-detail">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${event.location}</span>
                </div>
                <div class="event-detail">
                    <i class="fas fa-clock"></i>
                    <span>${event.time || 'All day'}</span>
                </div>
                <div class="event-detail">
                    <i class="fas fa-tag"></i>
                    <span>${event.category}</span>
                </div>
            </div>
            ${event.organizer ? `<div class="event-detail"><i class="fas fa-user"></i><span>Organized by: ${event.organizer}</span></div>` : ''}
        </div>
    `;
    
    return eventCard;
}

// Format event date for display
function formatEventDate(date) {
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
}

// Initialize event filtering functionality
function initializeEventFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const eventsContainer = document.getElementById('eventsContainer');
    
    if (!filterButtons.length || !eventsContainer) return;
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            filterEvents(filter);
        });
    });
}

// Filter events by category
function filterEvents(category) {
    const eventCards = document.querySelectorAll('.event-card');
    
    eventCards.forEach(card => {
        if (category === 'all' || card.getAttribute('data-category') === category) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

// Initialize mobile menu for events page
function initializeMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', function() {
            navLinks.classList.toggle('active');
        });
    }
}

// Initialize scroll to top for events page
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

// Also initialize mobile menu and scroll to top
initializeMobileMenu();
initializeScrollToTop();