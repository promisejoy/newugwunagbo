// Configuration
const CONFIG = {
    apiBaseUrl: window.location.origin,
    isProduction: true
};

// Data storage (fallback to localStorage if API fails)
let leaders = JSON.parse(localStorage.getItem('ugwunagbo_leaders')) || [];
let news = JSON.parse(localStorage.getItem('ugwunagbo_news')) || [];
let contactRequests = JSON.parse(localStorage.getItem('ugwunagbo_contacts')) || [];

// API Service Functions
const apiService = {
    // Leaders API
    async getLeaders() {
        try {
            const response = await fetch('/api/leaders');
            if (!response.ok) throw new Error('Failed to fetch leaders');
            return await response.json();
        } catch (error) {
            console.error('API Error - using localStorage fallback:', error);
            return leaders;
        }
    },

    async addLeader(leaderData) {
        try {
            const formData = new FormData();
            Object.keys(leaderData).forEach(key => {
                if (key === 'image' && leaderData[key] instanceof File) {
                    formData.append('image', leaderData[key]);
                } else {
                    formData.append(key, leaderData[key]);
                }
            });

            const response = await fetch('/api/leaders', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) throw new Error('Failed to add leader');
            return await response.json();
        } catch (error) {
            console.error('API Error - using localStorage fallback:', error);
            // Fallback to localStorage
            const newLeader = {
                id: leaders.length > 0 ? Math.max(...leaders.map(l => l.id)) + 1 : 1,
                ...leaderData,
                image: leaderData.image instanceof File ? URL.createObjectURL(leaderData.image) : leaderData.image
            };
            leaders.push(newLeader);
            localStorage.setItem('ugwunagbo_leaders', JSON.stringify(leaders));
            return newLeader;
        }
    },

    async updateLeader(id, leaderData) {
        try {
            const formData = new FormData();
            Object.keys(leaderData).forEach(key => {
                if (key === 'image' && leaderData[key] instanceof File) {
                    formData.append('image', leaderData[key]);
                } else {
                    formData.append(key, leaderData[key]);
                }
            });

            const response = await fetch(`/api/leaders/${id}`, {
                method: 'PUT',
                body: formData
            });
            
            if (!response.ok) throw new Error('Failed to update leader');
            return await response.json();
        } catch (error) {
            console.error('API Error - using localStorage fallback:', error);
            // Fallback to localStorage
            const leaderIndex = leaders.findIndex(l => l.id === id);
            if (leaderIndex !== -1) {
                leaders[leaderIndex] = { id, ...leaderData };
                localStorage.setItem('ugwunagbo_leaders', JSON.stringify(leaders));
            }
            return { message: 'Leader updated in localStorage' };
        }
    },

    async deleteLeader(id) {
        try {
            const response = await fetch(`/api/leaders/${id}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) throw new Error('Failed to delete leader');
            return await response.json();
        } catch (error) {
            console.error('API Error - using localStorage fallback:', error);
            // Fallback to localStorage
            leaders = leaders.filter(leader => leader.id !== id);
            localStorage.setItem('ugwunagbo_leaders', JSON.stringify(leaders));
            return { message: 'Leader deleted from localStorage' };
        }
    },

    // News API
    async getNews() {
        try {
            const response = await fetch('/api/news');
            if (!response.ok) throw new Error('Failed to fetch news');
            return await response.json();
        } catch (error) {
            console.error('API Error - using localStorage fallback:', error);
            return news;
        }
    },

    async addNews(newsData) {
        try {
            const formData = new FormData();
            Object.keys(newsData).forEach(key => {
                if (key === 'image' && newsData[key] instanceof File) {
                    formData.append('image', newsData[key]);
                } else {
                    formData.append(key, newsData[key]);
                }
            });

            const response = await fetch('/api/news', {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) throw new Error('Failed to add news');
            return await response.json();
        } catch (error) {
            console.error('API Error - using localStorage fallback:', error);
            // Fallback to localStorage
            const newNews = {
                id: news.length > 0 ? Math.max(...news.map(n => n.id)) + 1 : 1,
                ...newsData,
                image: newsData.image instanceof File ? URL.createObjectURL(newsData.image) : newsData.image
            };
            news.push(newNews);
            localStorage.setItem('ugwunagbo_news', JSON.stringify(news));
            return newNews;
        }
    },

    async updateNews(id, newsData) {
        try {
            const formData = new FormData();
            Object.keys(newsData).forEach(key => {
                if (key === 'image' && newsData[key] instanceof File) {
                    formData.append('image', newsData[key]);
                } else {
                    formData.append(key, newsData[key]);
                }
            });

            const response = await fetch(`/api/news/${id}`, {
                method: 'PUT',
                body: formData
            });
            
            if (!response.ok) throw new Error('Failed to update news');
            return await response.json();
        } catch (error) {
            console.error('API Error - using localStorage fallback:', error);
            // Fallback to localStorage
            const newsIndex = news.findIndex(n => n.id === id);
            if (newsIndex !== -1) {
                news[newsIndex] = { id, ...newsData };
                localStorage.setItem('ugwunagbo_news', JSON.stringify(news));
            }
            return { message: 'News updated in localStorage' };
        }
    },

    async deleteNews(id) {
        try {
            const response = await fetch(`/api/news/${id}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) throw new Error('Failed to delete news');
            return await response.json();
        } catch (error) {
            console.error('API Error - using localStorage fallback:', error);
            // Fallback to localStorage
            news = news.filter(newsItem => newsItem.id !== id);
            localStorage.setItem('ugwunagbo_news', JSON.stringify(news));
            return { message: 'News deleted from localStorage' };
        }
    },

    // Contacts API
    async getContacts() {
        try {
            const response = await fetch('/api/contacts');
            if (!response.ok) throw new Error('Failed to fetch contacts');
            return await response.json();
        } catch (error) {
            console.error('API Error - using localStorage fallback:', error);
            return contactRequests;
        }
    },

    async addContact(contactData) {
        try {
            const response = await fetch('/api/contacts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(contactData)
            });
            
            if (!response.ok) throw new Error('Failed to submit contact');
            return await response.json();
        } catch (error) {
            console.error('API Error - using localStorage fallback:', error);
            // Fallback to localStorage
            const newContact = {
                id: Date.now(),
                ...contactData,
                date: new Date().toISOString()
            };
            contactRequests.unshift(newContact);
            if (contactRequests.length > 5) {
                contactRequests = contactRequests.slice(0, 5);
            }
            localStorage.setItem('ugwunagbo_contacts', JSON.stringify(contactRequests));
            return newContact;
        }
    },

    // Admin Login
    async adminLogin(credentials) {
        try {
            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials)
            });
            
            const result = await response.json();
            if (!response.ok) throw new Error(result.error);
            return result;
        } catch (error) {
            console.error('API Error - using local authentication:', error);
            // Fallback to local authentication
            if (credentials.username === 'admin' && credentials.password === 'admin123') {
                return { success: true, message: 'Login successful' };
            } else {
                throw new Error('Invalid credentials');
            }
        }
    }
};

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded and parsed');
    
    // DOM Elements
    const adminLoginBtn = document.getElementById('adminLoginBtn');
    const loginModal = document.getElementById('loginModal');
    const closeLoginModal = document.getElementById('closeLoginModal');
    const adminLoginForm = document.getElementById('adminLoginForm');
    const adminDashboard = document.getElementById('adminDashboard');
    const closeAdminDashboard = document.getElementById('closeAdminDashboard');

    // Set current year in footer
    document.getElementById('currentYear').textContent = new Date().getFullYear();

    // Admin Button Click
    if (adminLoginBtn) {
        adminLoginBtn.addEventListener('click', function(e) {
            console.log('Admin button clicked!');
            e.preventDefault();
            e.stopPropagation();
            
            if (loginModal) {
                loginModal.style.display = 'flex';
                console.log('Login modal displayed');
            }
        });
    }

    // Close Login Modal
    if (closeLoginModal) {
        closeLoginModal.addEventListener('click', function() {
            if (loginModal) {
                loginModal.style.display = 'none';
            }
        });
    }

    // Close modal when clicking outside
    if (loginModal) {
        loginModal.addEventListener('click', function(e) {
            if (e.target === loginModal) {
                loginModal.style.display = 'none';
            }
        });
    }

    // Admin Login Form Submission
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('Login form submitted!');
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            try {
                const result = await apiService.adminLogin({ username, password });
                
                if (result.success) {
                    console.log('Login successful!');
                    
                    // Hide login modal
                    if (loginModal) {
                        loginModal.style.display = 'none';
                    }
                    
                    // Show admin dashboard
                    if (adminDashboard) {
                        adminDashboard.style.display = 'block';
                        console.log('Admin dashboard displayed');
                        
                        // Load admin data
                        loadAdminData();
                    }
                }
            } catch (error) {
                alert(error.message || 'Login failed. Use: admin / admin123');
            }
        });
    }

    // Close Admin Dashboard
    if (closeAdminDashboard) {
        closeAdminDashboard.addEventListener('click', function() {
            if (adminDashboard) {
                adminDashboard.style.display = 'none';
            }
        });
    }

    // Close admin dashboard when clicking outside
    if (adminDashboard) {
        adminDashboard.addEventListener('click', function(e) {
            if (e.target === adminDashboard) {
                adminDashboard.style.display = 'none';
            }
        });
    }

    // Initialize other functionality
    initializeWebsite();
});

// Admin Data Loading Functions
async function loadAdminData() {
    console.log('Loading admin data...');
    await loadLeaderList();
    await loadNewsList();
    await loadContactRequests();
    initializeAdminTabs();
    initializeAdminForms();
}

// Initialize Admin Tabs
function initializeAdminTabs() {
    const adminTabs = document.querySelectorAll('.admin-tab');
    const tabContents = document.querySelectorAll('.tab-content');

    if (adminTabs.length > 0) {
        adminTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabId = tab.getAttribute('data-tab');
                
                // Remove active class from all tabs and contents
                adminTabs.forEach(t => t.classList.remove('active'));
                tabContents.forEach(c => c.classList.remove('active'));
                
                // Add active class to clicked tab and corresponding content
                tab.classList.add('active');
                const targetTab = document.getElementById(`${tabId}Tab`);
                if (targetTab) {
                    targetTab.classList.add('active');
                }
                
                console.log(`Switched to ${tabId} tab`);
            });
        });
    }
}

// Initialize Admin Forms
function initializeAdminForms() {
    // Leader Form
    const leaderForm = document.getElementById('leaderForm');
    const leaderImage = document.getElementById('leaderImage');
    const leaderImagePreview = document.getElementById('leaderImagePreview');
    const resetLeaderForm = document.getElementById('resetLeaderForm');
    const leaderIdInput = document.getElementById('leaderId');
    const cancelEdit = document.getElementById('cancelEdit');

    if (leaderForm) {
        leaderForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const id = leaderIdInput.value ? parseInt(leaderIdInput.value) : null;
            const name = document.getElementById('leaderName').value;
            const position = document.getElementById('leaderPosition').value;
            const bio = document.getElementById('leaderBio').value;
            const email = document.getElementById('leaderEmail').value;
            const phone = document.getElementById('leaderPhone').value;
            const twitter = document.getElementById('leaderTwitter').value;
            const facebook = document.getElementById('leaderFacebook').value;
            const linkedin = document.getElementById('leaderLinkedin').value;
            const imageFile = leaderImage.files[0];
            
            const leaderData = {
                name,
                position,
                bio,
                email,
                phone,
                twitter,
                facebook,
                linkedin,
                image: imageFile
            };
            
            try {
                if (id) {
                    // Update existing leader
                    await apiService.updateLeader(id, leaderData);
                    alert('Leader updated successfully!');
                } else {
                    // Add new leader
                    await apiService.addLeader(leaderData);
                    alert('Leader added successfully!');
                }
                
                // Update UI
                await loadLeaders();
                await loadLeaderList();
                resetLeaderFormToAddMode();
                
            } catch (error) {
                alert('Error saving leader: ' + error.message);
            }
        });
    }

    // Leader Image Preview
    if (leaderImage && leaderImagePreview) {
        leaderImage.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    leaderImagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                };
                reader.readAsDataURL(file);
            } else {
                leaderImagePreview.innerHTML = '<span>No image selected</span>';
            }
        });
    }

    // Reset Leader Form
    if (resetLeaderForm) {
        resetLeaderForm.addEventListener('click', resetLeaderFormToAddMode);
    }

    // Cancel Edit
    if (cancelEdit) {
        cancelEdit.addEventListener('click', resetLeaderFormToAddMode);
    }

    // News Form
    const newsForm = document.getElementById('newsForm');
    const newsImage = document.getElementById('newsImage');
    const newsImagePreview = document.getElementById('newsImagePreview');
    const resetNewsForm = document.getElementById('resetNewsForm');
    const newsIdInput = document.getElementById('newsId');
    const cancelNewsEdit = document.getElementById('cancelNewsEdit');

    if (newsForm) {
        // Set default date
        document.getElementById('newsDate').valueAsDate = new Date();

        newsForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const id = newsIdInput.value ? parseInt(newsIdInput.value) : null;
            const title = document.getElementById('newsTitle').value;
            const content = document.getElementById('newsContent').value;
            const date = document.getElementById('newsDate').value;
            const imageFile = newsImage.files[0];
            
            const newsData = {
                title,
                content,
                date,
                image: imageFile
            };
            
            try {
                if (id) {
                    // Update existing news
                    await apiService.updateNews(id, newsData);
                    alert('News updated successfully!');
                } else {
                    // Add new news
                    await apiService.addNews(newsData);
                    alert('News added successfully!');
                }
                
                // Update UI
                await loadNews();
                await loadNewsList();
                resetNewsFormToAddMode();
                
            } catch (error) {
                alert('Error saving news: ' + error.message);
            }
        });
    }

    // News Image Preview
    if (newsImage && newsImagePreview) {
        newsImage.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    newsImagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                };
                reader.readAsDataURL(file);
            } else {
                newsImagePreview.innerHTML = '<span>No image selected</span>';
            }
        });
    }

    // Reset News Form
    if (resetNewsForm) {
        resetNewsForm.addEventListener('click', resetNewsFormToAddMode);
    }

    // Cancel News Edit
    if (cancelNewsEdit) {
        cancelNewsEdit.addEventListener('click', resetNewsFormToAddMode);
    }
}

// Load leaders to the website
async function loadLeaders() {
    const leadershipContainer = document.getElementById('leadershipContainer');
    if (!leadershipContainer) return;
    
    leadershipContainer.innerHTML = '<p>Loading leaders...</p>';
    
    try {
        const leadersData = await apiService.getLeaders();
        
        leadershipContainer.innerHTML = '';
        
        if (leadersData.length === 0) {
            leadershipContainer.innerHTML = '<p>No leadership information available.</p>';
            return;
        }
        
        leadersData.forEach(leader => {
            const leaderCard = document.createElement('div');
            leaderCard.className = 'leader-card';
            
            let socialMediaHTML = '';
            if (leader.twitter || leader.facebook || leader.linkedin) {
                socialMediaHTML = '<div class="social-media-icons">';
                if (leader.twitter) {
                    socialMediaHTML += `<a href="${leader.twitter}" class="twitter" target="_blank"><i class="fab fa-twitter"></i></a>`;
                }
                if (leader.facebook) {
                    socialMediaHTML += `<a href="${leader.facebook}" class="facebook" target="_blank"><i class="fab fa-facebook-f"></i></a>`;
                }
                if (leader.linkedin) {
                    socialMediaHTML += `<a href="${leader.linkedin}" class="linkedin" target="_blank"><i class="fab fa-linkedin-in"></i></a>`;
                }
                socialMediaHTML += '</div>';
            }
            
            const imageUrl = leader.image ? (leader.image.startsWith('http') ? leader.image : CONFIG.apiBaseUrl + leader.image) : "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80";
            
            leaderCard.innerHTML = `
                <div class="leader-image">
                    <img src="${imageUrl}" alt="${leader.name}">
                </div>
                <div class="leader-content">
                    <h3>${leader.name}</h3>
                    <span class="leader-position">${leader.position}</span>
                    <p class="leader-bio">${leader.bio}</p>
                    <div class="leader-contact">
                        ${leader.email ? `<a href="mailto:${leader.email}"><i class="fas fa-envelope"></i></a>` : ''}
                        ${leader.phone ? `<a href="tel:${leader.phone}"><i class="fas fa-phone"></i></a>` : ''}
                    </div>
                    ${socialMediaHTML}
                </div>
            `;
            leadershipContainer.appendChild(leaderCard);
        });
    } catch (error) {
        leadershipContainer.innerHTML = '<p>Error loading leaders. Please try again later.</p>';
        console.error('Error loading leaders:', error);
    }
}

// Load leaders to admin panel
async function loadLeaderList() {
    const leaderListContainer = document.getElementById('leaderListContainer');
    if (!leaderListContainer) return;
    
    leaderListContainer.innerHTML = '<p>Loading...</p>';
    
    try {
        const leadersData = await apiService.getLeaders();
        
        leaderListContainer.innerHTML = '';
        
        if (leadersData.length === 0) {
            leaderListContainer.innerHTML = '<p>No leaders added yet.</p>';
            return;
        }
        
        leadersData.forEach(leader => {
            const leaderItem = document.createElement('div');
            leaderItem.className = 'leader-item';
            leaderItem.innerHTML = `
                <div>
                    <h4>${leader.name}</h4>
                    <p>${leader.position}</p>
                </div>
                <div class="item-actions">
                    <button class="edit-btn" data-id="${leader.id}">Edit</button>
                    <button class="delete-btn" data-id="${leader.id}">Delete</button>
                </div>
            `;
            leaderListContainer.appendChild(leaderItem);
        });

        // Add event listeners to edit and delete buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const leaderId = parseInt(e.target.getAttribute('data-id'));
                editLeader(leaderId);
            });
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const leaderId = parseInt(e.target.getAttribute('data-id'));
                deleteLeader(leaderId);
            });
        });
    } catch (error) {
        leaderListContainer.innerHTML = '<p>Error loading leaders.</p>';
        console.error('Error loading leader list:', error);
    }
}

// Load news to the website
async function loadNews() {
    const newsContainer = document.getElementById('newsContainer');
    if (!newsContainer) return;
    
    newsContainer.innerHTML = '<p>Loading news...</p>';
    
    try {
        const newsData = await apiService.getNews();
        
        newsContainer.innerHTML = '';
        
        if (newsData.length === 0) {
            newsContainer.innerHTML = '<p>No news available at this time.</p>';
            return;
        }
        
        newsData.forEach(newsItem => {
            const newsCard = document.createElement('div');
            newsCard.className = 'news-card';
            
            const imageUrl = newsItem.image ? (newsItem.image.startsWith('http') ? newsItem.image : CONFIG.apiBaseUrl + newsItem.image) : "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80";
            
            newsCard.innerHTML = `
                <div class="news-image">
                    <img src="${imageUrl}" alt="${newsItem.title}">
                </div>
                <div class="news-content">
                    <div class="news-date">${formatDate(newsItem.date)}</div>
                    <h3>${newsItem.title}</h3>
                    <p>${newsItem.content}</p>
                    <a href="#" class="read-more">Read More <i class="fas fa-arrow-right"></i></a>
                </div>
            `;
            newsContainer.appendChild(newsCard);
        });
    } catch (error) {
        newsContainer.innerHTML = '<p>Error loading news. Please try again later.</p>';
        console.error('Error loading news:', error);
    }
}

// Load news to admin panel
async function loadNewsList() {
    const newsListContainer = document.getElementById('newsListContainer');
    if (!newsListContainer) return;
    
    newsListContainer.innerHTML = '<p>Loading...</p>';
    
    try {
        const newsData = await apiService.getNews();
        
        newsListContainer.innerHTML = '';
        
        if (newsData.length === 0) {
            newsListContainer.innerHTML = '<p>No news added yet.</p>';
            return;
        }
        
        newsData.forEach(newsItem => {
            const newsListItem = document.createElement('div');
            newsListItem.className = 'news-item';
            newsListItem.innerHTML = `
                <div>
                    <h4>${newsItem.title}</h4>
                    <p>${formatDate(newsItem.date)}</p>
                </div>
                <div class="item-actions">
                    <button class="edit-btn" data-id="${newsItem.id}">Edit</button>
                    <button class="delete-btn" data-id="${newsItem.id}">Delete</button>
                </div>
            `;
            newsListContainer.appendChild(newsListItem);
        });

        // Add event listeners to edit and delete buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const newsId = parseInt(e.target.getAttribute('data-id'));
                editNews(newsId);
            });
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const newsId = parseInt(e.target.getAttribute('data-id'));
                deleteNews(newsId);
            });
        });
    } catch (error) {
        newsListContainer.innerHTML = '<p>Error loading news.</p>';
        console.error('Error loading news list:', error);
    }
}

// Load contact requests to admin panel
async function loadContactRequests() {
    const contactRequestsContainer = document.getElementById('contactRequestsContainer');
    if (!contactRequestsContainer) return;
    
    contactRequestsContainer.innerHTML = '<p>Loading...</p>';
    
    try {
        const contactsData = await apiService.getContacts();
        
        contactRequestsContainer.innerHTML = '';
        
        if (contactsData.length === 0) {
            contactRequestsContainer.innerHTML = '<p>No contact requests yet.</p>';
            return;
        }
        
        contactsData.forEach(request => {
            const requestElement = document.createElement('div');
            requestElement.className = 'contact-request';
            requestElement.innerHTML = `
                <div class="contact-request-header">
                    <div class="contact-request-name">${request.name}</div>
                    <div class="contact-request-date">${formatDate(request.date)}</div>
                </div>
                <div class="contact-request-subject">${request.subject}</div>
                <div class="contact-request-message">${request.message}</div>
                <div class="contact-request-email">${request.email}</div>
            `;
            contactRequestsContainer.appendChild(requestElement);
        });
    } catch (error) {
        contactRequestsContainer.innerHTML = '<p>Error loading contact requests.</p>';
        console.error('Error loading contact requests:', error);
    }
}

// Edit leader
async function editLeader(id) {
    try {
        const leadersData = await apiService.getLeaders();
        const leader = leadersData.find(l => l.id === id);
        if (!leader) return;
        
        document.getElementById('leaderName').value = leader.name;
        document.getElementById('leaderPosition').value = leader.position;
        document.getElementById('leaderBio').value = leader.bio;
        document.getElementById('leaderEmail').value = leader.email || '';
        document.getElementById('leaderPhone').value = leader.phone || '';
        document.getElementById('leaderTwitter').value = leader.twitter || '';
        document.getElementById('leaderFacebook').value = leader.facebook || '';
        document.getElementById('leaderLinkedin').value = leader.linkedin || '';
        document.getElementById('leaderId').value = leader.id;
        
        // Update image preview
        const leaderImagePreview = document.getElementById('leaderImagePreview');
        if (leaderImagePreview) {
            const imageUrl = leader.image ? (leader.image.startsWith('http') ? leader.image : CONFIG.apiBaseUrl + leader.image) : "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80";
            leaderImagePreview.innerHTML = `<img src="${imageUrl}" alt="Preview">`;
        }
        
        // Update form title and button
        document.getElementById('leaderFormTitle').textContent = 'Edit Leader';
        document.getElementById('leaderSubmitBtn').textContent = 'Update Leader';
        document.getElementById('cancelEdit').style.display = 'inline-block';
    } catch (error) {
        alert('Error loading leader data: ' + error.message);
    }
}

// Delete leader
async function deleteLeader(id) {
    if (confirm('Are you sure you want to delete this leader?')) {
        try {
            await apiService.deleteLeader(id);
            await loadLeaders();
            await loadLeaderList();
            alert('Leader deleted successfully!');
        } catch (error) {
            alert('Error deleting leader: ' + error.message);
        }
    }
}

// Edit news
async function editNews(id) {
    try {
        const newsData = await apiService.getNews();
        const newsItem = newsData.find(n => n.id === id);
        if (!newsItem) return;
        
        document.getElementById('newsTitle').value = newsItem.title;
        document.getElementById('newsContent').value = newsItem.content;
        document.getElementById('newsDate').value = newsItem.date;
        document.getElementById('newsId').value = newsItem.id;
        
        // Update image preview
        const newsImagePreview = document.getElementById('newsImagePreview');
        if (newsImagePreview) {
            const imageUrl = newsItem.image ? (newsItem.image.startsWith('http') ? newsItem.image : CONFIG.apiBaseUrl + newsItem.image) : "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80";
            newsImagePreview.innerHTML = `<img src="${imageUrl}" alt="Preview">`;
        }
        
        // Update form title and button
        document.getElementById('newsFormTitle').textContent = 'Edit News Article';
        document.getElementById('newsSubmitBtn').textContent = 'Update News';
        document.getElementById('cancelNewsEdit').style.display = 'inline-block';
    } catch (error) {
        alert('Error loading news data: ' + error.message);
    }
}

// Delete news
async function deleteNews(id) {
    if (confirm('Are you sure you want to delete this news article?')) {
        try {
            await apiService.deleteNews(id);
            await loadNews();
            await loadNewsList();
            alert('News deleted successfully!');
        } catch (error) {
            alert('Error deleting news: ' + error.message);
        }
    }
}

// Reset leader form to add mode
function resetLeaderFormToAddMode() {
    const leaderForm = document.getElementById('leaderForm');
    if (leaderForm) leaderForm.reset();
    document.getElementById('leaderId').value = '';
    const leaderImagePreview = document.getElementById('leaderImagePreview');
    if (leaderImagePreview) leaderImagePreview.innerHTML = '<span>No image selected</span>';
    document.getElementById('leaderFormTitle').textContent = 'Add New Leader';
    document.getElementById('leaderSubmitBtn').textContent = 'Add Leader';
    document.getElementById('cancelEdit').style.display = 'none';
}

// Reset news form to add mode
function resetNewsFormToAddMode() {
    const newsForm = document.getElementById('newsForm');
    if (newsForm) newsForm.reset();
    document.getElementById('newsId').value = '';
    const newsImagePreview = document.getElementById('newsImagePreview');
    if (newsImagePreview) newsImagePreview.innerHTML = '<span>No image selected</span>';
    document.getElementById('newsFormTitle').textContent = 'Add News Article';
    document.getElementById('newsSubmitBtn').textContent = 'Add News';
    document.getElementById('cancelNewsEdit').style.display = 'none';
    document.getElementById('newsDate').valueAsDate = new Date();
}

// Format date for display
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Initialize website functionality
async function initializeWebsite() {
    console.log('Initializing website functionality...');
    
    // Mobile Menu Toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', function() {
            navLinks.classList.toggle('active');
        });
    }

    // Smooth Scrolling for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if(targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if(targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
                
                if (navLinks) navLinks.classList.remove('active');
            }
        });
    });

    // Contact Form Submission
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const subject = document.getElementById('subject').value;
            const message = document.getElementById('message').value;
            
            const contactData = {
                name,
                email,
                subject,
                message
            };
            
            try {
                await apiService.addContact(contactData);
                alert('Thank you for your message. We will get back to you soon!');
                this.reset();
            } catch (error) {
                alert('Error submitting message: ' + error.message);
            }
        });
    }

    // Initialize hero slider
    initializeHeroSlider();
    
    // Initialize scroll to top
    initializeScrollToTop();
    
    // Load initial data
    await loadLeaders();
    await loadNews();
}

// Hero Slider Functionality - SINGLE VERSION (removed duplicate)
function initializeHeroSlider() {
    console.log('🚀 Initializing hero slider...');
    
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.slider-dot');
    const prevBtn = document.querySelector('.prev-slide');
    const nextBtn = document.querySelector('.next-slide');
    
    console.log(`Found ${slides.length} slides, ${dots.length} dots`);
    
    if (slides.length === 0) {
        console.error('❌ No slides found!');
        return;
    }

    let currentSlide = 0;
    let slideInterval;

    function showSlide(n) {
        // Remove active class from all slides and dots
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        
        // Calculate new slide index
        currentSlide = (n + slides.length) % slides.length;
        
        // Add active class to current slide and dot
        slides[currentSlide].classList.add('active');
        dots[currentSlide].classList.add('active');
        
        console.log(`✅ Now showing slide ${currentSlide}`);
    }

    function nextSlide() {
        showSlide(currentSlide + 1);
    }

    function prevSlide() {
        showSlide(currentSlide - 1);
    }

    // Auto-advance slides
    function startAutoSlide() {
        slideInterval = setInterval(() => {
            nextSlide();
        }, 5000); // Change slide every 5 seconds
    }

    function stopAutoSlide() {
        if (slideInterval) {
            clearInterval(slideInterval);
        }
    }

    // Initialize the slider
    console.log('🎬 Starting slider...');
    
    // Show first slide
    showSlide(0);
    
    // Start auto-slide
    startAutoSlide();
    
    // Add event listeners for navigation buttons
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            nextSlide();
            stopAutoSlide();
            startAutoSlide();
        });
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            prevSlide();
            stopAutoSlide();
            startAutoSlide();
        });
    }

    // Add event listeners for dots
    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            const slideIndex = parseInt(dot.getAttribute('data-slide'));
            showSlide(slideIndex);
            stopAutoSlide();
            startAutoSlide();
        });
    });

    // Pause auto-slide on hover
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.addEventListener('mouseenter', stopAutoSlide);
        hero.addEventListener('mouseleave', startAutoSlide);
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            prevSlide();
            stopAutoSlide();
            startAutoSlide();
        }
        if (e.key === 'ArrowRight') {
            nextSlide();
            stopAutoSlide();
            startAutoSlide();
        }
    });
    
    console.log('✅ Hero slider initialized successfully');
}

// Scroll to Top Functionality
function initializeScrollToTop() {
    const scrollToTopBtn = document.getElementById('scrollToTop');
    
    if (!scrollToTopBtn) return;

    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollToTopBtn.style.display = 'block';
        } else {
            scrollToTopBtn.style.display = 'none';
        }
    });

    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

console.log('Website scripts loaded successfully');