 // Initialize the news detail page
        document.addEventListener('DOMContentLoaded', function() {
            console.log('News detail page loaded');
            
            // Initialize mobile menu
            initializeMobileMenu();
            
            // Initialize scroll to top
            initializeScrollToTop();
            
            // Set current year in footer
            document.getElementById("currentYear").textContent = new Date().getFullYear();
            
            // Get news ID from URL parameters
            const urlParams = new URLSearchParams(window.location.search);
            const newsId = urlParams.get('id');
            
            if (newsId) {
                console.log('Loading news article with ID:', newsId);
                loadSingleNews(newsId);
            } else {
                showError('No news article specified. Please go back and select a news article.');
            }
            
            // Initialize share button
            document.getElementById('shareNewsBtn').addEventListener('click', shareNews);
        });

        // Mobile Menu Functionality
        function initializeMobileMenu() {
            const mobileMenuBtn = document.querySelector(".mobile-menu-btn");
            const navLinks = document.querySelector(".nav-links");

            if (mobileMenuBtn && navLinks) {
                mobileMenuBtn.addEventListener("click", function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    navLinks.classList.toggle("active");
                    const isExpanded = navLinks.classList.contains("active");
                    this.setAttribute("aria-expanded", isExpanded.toString());
                });

                // Close mobile menu when clicking on a link
                const navItems = navLinks.querySelectorAll("a");
                navItems.forEach((item) => {
                    item.addEventListener("click", () => {
                        navLinks.classList.remove("active");
                        mobileMenuBtn.setAttribute("aria-expanded", "false");
                    });
                });

                // Close mobile menu when clicking outside
                document.addEventListener("click", function(event) {
                    if (!event.target.closest("nav") && navLinks.classList.contains("active")) {
                        navLinks.classList.remove("active");
                        mobileMenuBtn.setAttribute("aria-expanded", "false");
                    }
                });

                // Close on escape key
                document.addEventListener("keydown", function(event) {
                    if (event.key === "Escape" && navLinks.classList.contains("active")) {
                        navLinks.classList.remove("active");
                        mobileMenuBtn.setAttribute("aria-expanded", "false");
                    }
                });
            }
        }

        // Scroll to Top Functionality
        function initializeScrollToTop() {
            const scrollToTopBtn = document.getElementById("scrollToTop");

            if (scrollToTopBtn) {
                scrollToTopBtn.style.display = "none";

                window.addEventListener("scroll", () => {
                    if (window.pageYOffset > 300) {
                        scrollToTopBtn.style.display = "block";
                        scrollToTopBtn.classList.add("show");
                    } else {
                        scrollToTopBtn.style.display = "none";
                        scrollToTopBtn.classList.remove("show");
                    }
                });

                scrollToTopBtn.addEventListener("click", () => {
                    window.scrollTo({
                        top: 0,
                        behavior: "smooth",
                    });
                });
            }
        }

        // Load single news article
        async function loadSingleNews(newsId) {
            const container = document.getElementById('newsDetailContainer');
            
            try {
                console.log('Fetching news article with ID:', newsId);
                
                const response = await fetch(`/api/news/${newsId}`);
                
                if (!response.ok) {
                    if (response.status === 404) {
                        throw new Error('News article not found');
                    }
                    throw new Error(`Server returned ${response.status}`);
                }
                
                const newsItem = await response.json();
                console.log('News article loaded:', newsItem);
                
                displaySingleNews(newsItem);
                
            } catch (error) {
                console.error('Error loading news article:', error);
                showError(`Error loading news article: ${error.message}`);
            }
        }

        // Display single news article
        function displaySingleNews(newsItem) {
            const container = document.getElementById('newsDetailContainer');
            const newsActions = document.getElementById('newsActions');
            
            // Handle image URL
            let imageUrl = "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80";
            
            if (newsItem.image) {
                if (newsItem.image.startsWith("http")) {
                    imageUrl = newsItem.image;
                } else if (newsItem.image.startsWith("/")) {
                    imageUrl = window.location.origin + newsItem.image;
                } else {
                    imageUrl = window.location.origin + '/' + newsItem.image;
                }
            }

            // Handle content
            let contentHTML = '';
            if (typeof newsItem.content === 'string') {
                contentHTML = newsItem.content.split('\n').map(paragraph => 
                    paragraph.trim() ? `<p>${paragraph.trim()}</p>` : ''
                ).join('');
            } else {
                contentHTML = '<p>No content available.</p>';
            }

            const newsHTML = `
                <article class="news-article">
                    <div class="news-header">
                        <h1 class="news-title">${newsItem.title || 'Untitled Article'}</h1>
                        <div class="news-meta">
                            <span class="news-date">
                                <i class="fas fa-calendar-alt"></i>
                                ${formatDate(newsItem.date || new Date().toISOString())}
                            </span>
                        </div>
                    </div>
                    
                    <div class="news-image-full">
                        <img src="${imageUrl}" alt="${newsItem.title || 'News Image'}" loading="lazy">
                    </div>
                    
                    <div class="news-content-full">
                        ${contentHTML}
                    </div>
                </article>
            `;

            container.innerHTML = newsHTML;
            newsActions.style.display = 'flex';
            
            // Update page title
            document.title = `${newsItem.title} - Ugwunagbo LGA`;
        }

        // Show error message
        function showError(message) {
            const container = document.getElementById('newsDetailContainer');
            container.innerHTML = `
                <div class="error">
                    <h3><i class="fas fa-exclamation-triangle"></i> Unable to Load Article</h3>
                    <p>${message}</p>
                    <a href="index.html#news" class="btn btn-primary" style="margin-top: 15px;">
                        <i class="fas fa-arrow-left"></i> Back to News
                    </a>
                </div>
            `;
        }

        // Share news function
        function shareNews() {
            const title = document.querySelector('.news-title')?.textContent || 'News Article';
            const url = window.location.href;
            
            if (navigator.share) {
                navigator.share({
                    title: title,
                    text: `Check out this news from Ugwunagbo LGA: ${title}`,
                    url: url
                })
                .then(() => console.log('News shared successfully'))
                .catch(error => console.log('Error sharing news:', error));
            } else {
                // Fallback: copy to clipboard
                const tempInput = document.createElement('input');
                tempInput.value = `${title} - ${url}`;
                document.body.appendChild(tempInput);
                tempInput.select();
                document.execCommand('copy');
                document.body.removeChild(tempInput);
                
                // Show temporary feedback
                const shareBtn = document.getElementById('shareNewsBtn');
                const originalText = shareBtn.innerHTML;
                shareBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                shareBtn.disabled = true;
                
                setTimeout(() => {
                    shareBtn.innerHTML = originalText;
                    shareBtn.disabled = false;
                }, 2000);
            }
        }

        // Format date function
        function formatDate(dateString) {
            try {
                const options = { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric'
                };
                return new Date(dateString).toLocaleDateString('en-US', options);
            } catch (error) {
                return 'Date not available';
            }
        }