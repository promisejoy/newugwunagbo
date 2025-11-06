// Configuration
const CONFIG = {
    apiBaseUrl: window.location.origin,
    isProduction: true
};

// Sweet Popup System
const SweetPopup = {
    init() {
        this.popup = document.getElementById('sweetPopup');
        this.title = this.popup.querySelector('.popup-title');
        this.message = this.popup.querySelector('.popup-message');
        this.icon = this.popup.querySelector('.popup-icon');
        this.buttons = this.popup.querySelector('.popup-buttons');
        
        // Close events
        this.popup.querySelector('.popup-close').addEventListener('click', () => this.hide());
        this.popup.addEventListener('click', (e) => {
            if (e.target === this.popup) this.hide();
        });
    },
    
    show(options = {}) {
        const {
            title = 'Notification',
            message = '',
            type = 'info', // success, error, warning, info
            showConfirmButton = true,
            confirmButtonText = 'OK',
            showCancelButton = false,
            cancelButtonText = 'Cancel',
            onConfirm = null,
            onCancel = null,
            timer = null
        } = options;

        // Set content
        this.title.textContent = title;
        this.message.textContent = message;
        
        // Set icon
        this.icon.className = 'popup-icon';
        this.icon.classList.add(type);
        this.icon.innerHTML = this.getIcon(type);
        
        // Create buttons
        this.buttons.innerHTML = '';
        
        if (showCancelButton) {
            const cancelBtn = document.createElement('button');
            cancelBtn.className = 'popup-btn cancel';
            cancelBtn.textContent = cancelButtonText;
            cancelBtn.onclick = () => {
                if (onCancel) onCancel();
                this.hide();
            };
            this.buttons.appendChild(cancelBtn);
        }
        
        if (showConfirmButton) {
            const confirmBtn = document.createElement('button');
            confirmBtn.className = `popup-btn ${type}`;
            confirmBtn.textContent = confirmButtonText;
            confirmBtn.onclick = () => {
                if (onConfirm) onConfirm();
                this.hide();
            };
            this.buttons.appendChild(confirmBtn);
        }

        // Show popup
        this.popup.classList.add('show');
        
        // Auto close if timer is set
        if (timer) {
            setTimeout(() => this.hide(), timer);
        }
    },
    
    hide() {
        this.popup.classList.remove('show');
    },
    
    getIcon(type) {
        const icons = {
            success: '<i class="fas fa-check-circle"></i>',
            error: '<i class="fas fa-exclamation-circle"></i>',
            warning: '<i class="fas fa-exclamation-triangle"></i>',
            info: '<i class="fas fa-info-circle"></i>'
        };
        return icons[type] || icons.info;
    },
    
    // Convenience methods
    success(message, title = 'Success!') {
        this.show({ title, message, type: 'success', timer: 3000 });
    },
    
    error(message, title = 'Error!') {
        this.show({ title, message, type: 'error' });
    },
    
    warning(message, title = 'Warning!') {
        this.show({ title, message, type: 'warning' });
    },
    
    info(message, title = 'Information') {
        this.show({ title, message, type: 'info', timer: 3000 });
    },
    
    confirm(message, title = 'Confirm Action', onConfirm, onCancel = null) {
        this.show({
            title,
            message,
            type: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No',
            onConfirm,
            onCancel
        });
    }
};

// API Service Functions
const apiService = {
    // Governor API
    async getGovernor() {
        const response = await fetch('/api/governor');
        if (!response.ok) throw new Error('Failed to fetch governor');
        return await response.json();
    },

    async updateGovernor(governorData) {
        const formData = new FormData();
        Object.keys(governorData).forEach(key => {
            if (key === 'image' && governorData[key] instanceof File) {
                formData.append('image', governorData[key]);
            } else {
                formData.append(key, governorData[key]);
            }
        });

        const response = await fetch('/api/governor', {
            method: 'PUT',
            body: formData
        });
        
        if (!response.ok) throw new Error('Failed to update governor');
        return await response.json();
    },

    // Video API
    async getVideo() {
        const response = await fetch('/api/video');
        if (!response.ok) throw new Error('Failed to fetch video');
        return await response.json();
    },

    async updateVideo(videoData) {
        const formData = new FormData();
        Object.keys(videoData).forEach(key => {
            if (key === 'video' && videoData[key] instanceof File) {
                formData.append('video', videoData[key]);
            } else {
                formData.append(key, videoData[key]);
            }
        });

        const response = await fetch('/api/video', {
            method: 'PUT',
            body: formData
        });
        
        if (!response.ok) throw new Error('Failed to update video');
        return await response.json();
    },

    // Villages API
    async getVillages() {
        const response = await fetch('/api/villages');
        if (!response.ok) throw new Error('Failed to fetch villages');
        return await response.json();
    },

    async addVillage(villageData) {
        const response = await fetch('/api/villages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(villageData)
        });
        
        if (!response.ok) throw new Error('Failed to add village');
        return await response.json();
    },

    // Leaders API
    async getLeaders() {
        const response = await fetch('/api/leaders');
        if (!response.ok) throw new Error('Failed to fetch leaders');
        return await response.json();
    },

    async addLeader(leaderData) {
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
    },

    async updateLeader(id, leaderData) {
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
    },

    async deleteLeader(id) {
        const response = await fetch(`/api/leaders/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Failed to delete leader');
        return await response.json();
    },

    // News API
    async getNews() {
        const response = await fetch('/api/news');
        if (!response.ok) throw new Error('Failed to fetch news');
        return await response.json();
    },

    async addNews(newsData) {
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
    },

    async updateNews(id, newsData) {
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
    },

    async deleteNews(id) {
        const response = await fetch(`/api/news/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Failed to delete news');
        return await response.json();
    },

    // Contacts API
    async getContacts() {
        const response = await fetch('/api/contacts');
        if (!response.ok) throw new Error('Failed to fetch contacts');
        return await response.json();
    },

    async addContact(contactData) {
        const response = await fetch('/api/contacts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(contactData)
        });
        
        if (!response.ok) throw new Error('Failed to submit contact');
        return await response.json();
    },

    // Support API
    async getSupportRequests() {
        const response = await fetch('/api/support');
        if (!response.ok) throw new Error('Failed to fetch support requests');
        return await response.json();
    },

    async addSupportRequest(supportData) {
        const response = await fetch('/api/support', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(supportData)
        });
        
        if (!response.ok) throw new Error('Failed to submit support request');
        return await response.json();
    },

    async updateSupportStatus(id, status) {
        const response = await fetch(`/api/support/${id}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ status })
        });
        
        if (!response.ok) throw new Error('Failed to update support request status');
        return await response.json();
    },

    async deleteSupportRequest(id) {
        const response = await fetch(`/api/support/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Failed to delete support request');
        return await response.json();
    },

    // Password Change API
    async changePassword(passwordData) {
        const response = await fetch('/api/admin/password', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(passwordData)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to change password');
        }
        return await response.json();
    },

    // Admin Login
    async adminLogin(credentials) {
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
    },

    // Events API
    async getEvents() {
        const response = await fetch('/api/events');
        if (!response.ok) throw new Error('Failed to fetch events');
        return await response.json();
    },

    async addEvent(eventData) {
        const formData = new FormData();
        Object.keys(eventData).forEach(key => {
            if (key === 'image' && eventData[key] instanceof File) {
                formData.append('image', eventData[key]);
            } else {
                formData.append(key, eventData[key]);
            }
        });

        const response = await fetch('/api/events', {
            method: 'POST',
            body: formData
        });
        
        if (!response.ok) throw new Error('Failed to add event');
        return await response.json();
    },

    async updateEvent(id, eventData) {
        const formData = new FormData();
        Object.keys(eventData).forEach(key => {
            if (key === 'image' && eventData[key] instanceof File) {
                formData.append('image', eventData[key]);
            } else {
                formData.append(key, eventData[key]);
            }
        });

        const response = await fetch(`/api/events/${id}`, {
            method: 'PUT',
            body: formData
        });
        
        if (!response.ok) throw new Error('Failed to update event');
        return await response.json();
    },

    async deleteEvent(id) {
        const response = await fetch(`/api/events/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Failed to delete event');
        return await response.json();
    }
};

// Form submission trackers to prevent duplicates
let isSubmittingLeader = false;
let isSubmittingNews = false;

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded and parsed');
    
    // Initialize Sweet Popup
    SweetPopup.init();
    
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
                SweetPopup.error(error.message || 'Login failed');
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
    await loadGovernorData();
    await loadLeaderList();
    await loadVideoData();
    await loadVillagesList();
    await loadNewsList();
    await loadEventsList();
    await loadContactRequests();
    await loadSupportRequests();
    initializeAdminTabs();
    initializeAdminForms();
    initializePasswordForm();
    initializeSupportManagement();
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

// Initialize Admin Forms - FIXED VERSION (No Duplicates)
function initializeAdminForms() {
    console.log('Initializing admin forms...');
    
    // Governor Form
    const governorForm = document.getElementById('governorForm');
    const governorImage = document.getElementById('governorImage');
    const governorImagePreview = document.getElementById('governorImagePreview');

    if (governorForm && !governorForm.hasAttribute('data-initialized')) {
        governorForm.setAttribute('data-initialized', 'true');
        governorForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const name = document.getElementById('governorName').value;
            const imageFile = governorImage.files[0];
            
            const governorData = {
                name,
                image: imageFile
            };
            
            try {
                await apiService.updateGovernor(governorData);
                SweetPopup.success('Governor information updated successfully!');
                
                // Update UI
                await loadGovernor();
                
            } catch (error) {
                SweetPopup.error('Error updating governor: ' + error.message);
            }
        });
    }

    // Governor Image Preview
    if (governorImage && governorImagePreview) {
        governorImage.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    governorImagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                };
                reader.readAsDataURL(file);
            } else {
                governorImagePreview.innerHTML = '<span>No image selected</span>';
            }
        });
    }

    // Video Form
    const videoForm = document.getElementById('videoForm');
    const videoFile = document.getElementById('videoFile');

    if (videoForm && !videoForm.hasAttribute('data-initialized')) {
        videoForm.setAttribute('data-initialized', 'true');
        videoForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const title = document.getElementById('videoTitle').value;
            const description = document.getElementById('videoDescription').value;
            const video = videoFile.files[0];
            
            const videoData = {
                title,
                description,
                video: video
            };
            
            try {
                await apiService.updateVideo(videoData);
                SweetPopup.success('Video uploaded successfully!');
                
                // Update UI
                await loadVideo();
                
            } catch (error) {
                SweetPopup.error('Error uploading video: ' + error.message);
            }
        });
    }

    // Village Form
    const villageForm = document.getElementById('villageForm');

    if (villageForm && !villageForm.hasAttribute('data-initialized')) {
        villageForm.setAttribute('data-initialized', 'true');
        villageForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const name = document.getElementById('villageName').value;
            const description = document.getElementById('villageDescription').value;
            
            const villageData = {
                name,
                description
            };
            
            try {
                await apiService.addVillage(villageData);
                SweetPopup.success('Village added successfully!');
                
                // Update UI
                await loadVillagesList();
                
                // Reset form
                villageForm.reset();
                
            } catch (error) {
                SweetPopup.error('Error adding village: ' + error.message);
            }
        });
    }

    // Leader Form - FIXED (No Duplicate Submissions)
    const leaderForm = document.getElementById('leaderForm');
    const leaderImage = document.getElementById('leaderImage');
    const leaderImagePreview = document.getElementById('leaderImagePreview');
    const resetLeaderForm = document.getElementById('resetLeaderForm');
    const leaderIdInput = document.getElementById('leaderId');
    const cancelEdit = document.getElementById('cancelEdit');

    if (leaderForm && !leaderForm.hasAttribute('data-initialized')) {
        leaderForm.setAttribute('data-initialized', 'true');
        leaderForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Prevent duplicate submissions
            if (isSubmittingLeader) {
                console.log('Leader form submission already in progress');
                return;
            }
            
            isSubmittingLeader = true;
            
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
                    SweetPopup.success('Leader updated successfully!');
                } else {
                    // Add new leader
                    await apiService.addLeader(leaderData);
                    SweetPopup.success('Leader added successfully!');
                }
                
                // Update UI
                await loadLeaders();
                await loadLeaderList();
                resetLeaderFormToAddMode();
                
            } catch (error) {
                SweetPopup.error('Error saving leader: ' + error.message);
            } finally {
                isSubmittingLeader = false;
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
    if (resetLeaderForm && !resetLeaderForm.hasAttribute('data-initialized')) {
        resetLeaderForm.setAttribute('data-initialized', 'true');
        resetLeaderForm.addEventListener('click', resetLeaderFormToAddMode);
    }

    // Cancel Edit
    if (cancelEdit && !cancelEdit.hasAttribute('data-initialized')) {
        cancelEdit.setAttribute('data-initialized', 'true');
        cancelEdit.addEventListener('click', resetLeaderFormToAddMode);
    }

    // News Form - FIXED (No Duplicate Submissions)
    const newsForm = document.getElementById('newsForm');
    const newsImage = document.getElementById('newsImage');
    const newsImagePreview = document.getElementById('newsImagePreview');
    const resetNewsForm = document.getElementById('resetNewsForm');
    const newsIdInput = document.getElementById('newsId');
    const cancelNewsEdit = document.getElementById('cancelNewsEdit');

    if (newsForm && !newsForm.hasAttribute('data-initialized')) {
        newsForm.setAttribute('data-initialized', 'true');
        
        // Set default date
        document.getElementById('newsDate').valueAsDate = new Date();

        newsForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Prevent duplicate submissions
            if (isSubmittingNews) {
                console.log('News form submission already in progress');
                return;
            }
            
            isSubmittingNews = true;
            
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
                    SweetPopup.success('News updated successfully!');
                } else {
                    // Add new news
                    await apiService.addNews(newsData);
                    SweetPopup.success('News added successfully!');
                }
                
                // Update UI
                await loadNews();
                await loadNewsList();
                resetNewsFormToAddMode();
                
            } catch (error) {
                SweetPopup.error('Error saving news: ' + error.message);
            } finally {
                isSubmittingNews = false;
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
    if (resetNewsForm && !resetNewsForm.hasAttribute('data-initialized')) {
        resetNewsForm.setAttribute('data-initialized', 'true');
        resetNewsForm.addEventListener('click', resetNewsFormToAddMode);
    }

    // Cancel News Edit
    if (cancelNewsEdit && !cancelNewsEdit.hasAttribute('data-initialized')) {
        cancelNewsEdit.setAttribute('data-initialized', 'true');
        cancelNewsEdit.addEventListener('click', resetNewsFormToAddMode);
    }

    // Events Form
    const eventsForm = document.getElementById('eventsForm');
    const eventImage = document.getElementById('eventImage');
    const eventImagePreview = document.getElementById('eventImagePreview');
    const resetEventForm = document.getElementById('resetEventForm');
    const eventIdInput = document.getElementById('eventId');
    const cancelEventEdit = document.getElementById('cancelEventEdit');

    if (eventsForm && !eventsForm.hasAttribute('data-initialized')) {
        eventsForm.setAttribute('data-initialized', 'true');
        
        // Set default date to today
        document.getElementById('eventDate').valueAsDate = new Date();

        eventsForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const id = eventIdInput.value ? parseInt(eventIdInput.value) : null;
            const title = document.getElementById('eventTitle').value;
            const category = document.getElementById('eventCategory').value;
            const description = document.getElementById('eventDescription').value;
            const date = document.getElementById('eventDate').value;
            const time = document.getElementById('eventTime').value;
            const location = document.getElementById('eventLocation').value;
            const organizer = document.getElementById('eventOrganizer').value;
            const imageFile = eventImage.files[0];
            
            const eventData = {
                title,
                category,
                description,
                date,
                time,
                location,
                organizer,
                image: imageFile
            };
            
            try {
                if (id) {
                    await apiService.updateEvent(id, eventData);
                    SweetPopup.success('Event updated successfully!');
                } else {
                    await apiService.addEvent(eventData);
                    SweetPopup.success('Event added successfully!');
                }
                
                await loadEventsList();
                resetEventFormToAddMode();
                
            } catch (error) {
                SweetPopup.error('Error saving event: ' + error.message);
            }
        });
    }

    // Event Image Preview
    if (eventImage && eventImagePreview) {
        eventImage.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    eventImagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                };
                reader.readAsDataURL(file);
            } else {
                eventImagePreview.innerHTML = '<span>No image selected</span>';
            }
        });
    }

    // Reset Event Form
    if (resetEventForm && !resetEventForm.hasAttribute('data-initialized')) {
        resetEventForm.setAttribute('data-initialized', 'true');
        resetEventForm.addEventListener('click', resetEventFormToAddMode);
    }

    // Cancel Event Edit
    if (cancelEventEdit && !cancelEventEdit.hasAttribute('data-initialized')) {
        cancelEventEdit.setAttribute('data-initialized', 'true');
        cancelEventEdit.addEventListener('click', resetEventFormToAddMode);
    }
}

// Initialize Password Form
function initializePasswordForm() {
    const passwordForm = document.getElementById('passwordForm');
    const resetPasswordForm = document.getElementById('resetPasswordForm');

    if (passwordForm && !passwordForm.hasAttribute('data-initialized')) {
        passwordForm.setAttribute('data-initialized', 'true');
        passwordForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            // Validate password
            if (newPassword.length < 8) {
                SweetPopup.warning('Password must be at least 8 characters long');
                return;
            }
            
            if (newPassword !== confirmPassword) {
                SweetPopup.warning('New passwords do not match');
                return;
            }
            
            const passwordData = {
                currentPassword,
                newPassword
            };
            
            try {
                await apiService.changePassword(passwordData);
                SweetPopup.success('Password changed successfully!');
                passwordForm.reset();
            } catch (error) {
                SweetPopup.error('Error changing password: ' + error.message);
            }
        });
    }

    if (resetPasswordForm && !resetPasswordForm.hasAttribute('data-initialized')) {
        resetPasswordForm.setAttribute('data-initialized', 'true');
        resetPasswordForm.addEventListener('click', function() {
            passwordForm.reset();
        });
    }
}

// Load governor to the website
async function loadGovernor() {
    const governorContainer = document.getElementById('governorContainer');
    if (!governorContainer) return;
    
    try {
        const governorData = await apiService.getGovernor();
        
        if (governorData && governorData.name) {
            const imageUrl = governorData.image ? (governorData.image.startsWith('http') ? governorData.image : CONFIG.apiBaseUrl + governorData.image) : "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80";
            
            governorContainer.innerHTML = `
                <div class="governor-card">
                    <div class="governor-image">
                        <img src="${imageUrl}" alt="${governorData.name}">
                    </div>
                    <h3 class="governor-name">${governorData.name}</h3>
                    <p>Executive Governor of Abia State</p>
                </div>
            `;
        } else {
            governorContainer.innerHTML = `
                <div class="no-governor">
                    <i class="fas fa-user-circle fa-5x"></i>
                    <p>Governor information will appear here once uploaded</p>
                </div>
            `;
        }
    } catch (error) {
        governorContainer.innerHTML = '<p>Error loading governor information.</p>';
        console.error('Error loading governor:', error);
    }
}

// Load governor data to admin panel
async function loadGovernorData() {
    try {
        const governorData = await apiService.getGovernor();
        
        if (governorData && governorData.name) {
            document.getElementById('governorName').value = governorData.name;
            
            // Update image preview
            const governorImagePreview = document.getElementById('governorImagePreview');
            if (governorImagePreview) {
                const imageUrl = governorData.image ? (governorData.image.startsWith('http') ? governorData.image : CONFIG.apiBaseUrl + governorData.image) : "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80";
                governorImagePreview.innerHTML = `<img src="${imageUrl}" alt="Preview">`;
            }
        }
    } catch (error) {
        console.error('Error loading governor data:', error);
    }
}

// Load video to the website
async function loadVideo() {
    const videoContainer = document.getElementById('videoContainer');
    if (!videoContainer) return;
    
    try {
        const videoData = await apiService.getVideo();
        
        if (videoData && videoData.video) {
            const videoUrl = videoData.video.startsWith('http') ? videoData.video : CONFIG.apiBaseUrl + videoData.video;
            
            videoContainer.innerHTML = `
                <video controls>
                    <source src="${videoUrl}" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
                <div class="video-info">
                    <h3 class="video-title">${videoData.title || 'Ugwunagbo in Pictures'}</h3>
                    <p>${videoData.description || 'A visual journey through our communities and culture'}</p>
                </div>
            `;
        } else {
            videoContainer.innerHTML = `
                <div class="no-video">
                    <i class="fas fa-video fa-5x"></i>
                    <p>A video showcasing Ugwunagbo will appear here once uploaded</p>
                </div>
            `;
        }
    } catch (error) {
        videoContainer.innerHTML = '<p>Error loading video.</p>';
        console.error('Error loading video:', error);
    }
}

// Load video data to admin panel
async function loadVideoData() {
    try {
        const videoData = await apiService.getVideo();
        
        if (videoData) {
            document.getElementById('videoTitle').value = videoData.title || '';
            document.getElementById('videoDescription').value = videoData.description || '';
            
            // Display current video
            const currentVideoContainer = document.getElementById('currentVideoContainer');
            if (currentVideoContainer && videoData.video) {
                const videoUrl = videoData.video.startsWith('http') ? videoData.video : CONFIG.apiBaseUrl + videoData.video;
                currentVideoContainer.innerHTML = `
                    <p><strong>Current Video:</strong> ${videoData.title || 'Untitled'}</p>
                    <video controls width="300">
                        <source src="${videoUrl}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                `;
            }
        }
    } catch (error) {
        console.error('Error loading video data:', error);
    }
}

// Load villages to admin panel - FIXED VERSION
async function loadVillagesList() {
    const villagesListContainer = document.getElementById('villagesListContainer');
    if (!villagesListContainer) {
        console.error('Villages list container not found!');
        return;
    }
    
    console.log('Loading villages list...');
    villagesListContainer.innerHTML = '<p>Loading villages...</p>';
    
    try {
        const villagesData = await apiService.getVillages();
        console.log('Loaded villages data:', villagesData);
        
        villagesListContainer.innerHTML = '';
        
        if (villagesData.length === 0) {
            villagesListContainer.innerHTML = '<p>No villages added yet.</p>';
            return;
        }
        
        villagesData.forEach(village => {
            const villageItem = document.createElement('div');
            villageItem.className = 'village-item-admin';
            villageItem.setAttribute('data-village-id', village.id);
            villageItem.innerHTML = `
                <div>
                    <h4>${village.name}</h4>
                    <p>${village.description || 'No description'}</p>
                </div>
                <div class="item-actions">
                    <button class="delete-btn" data-id="${village.id}">Delete</button>
                </div>
            `;
            villagesListContainer.appendChild(villageItem);
        });

        // Use event delegation to prevent duplicate listeners
        villagesListContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-btn')) {
                const villageId = parseInt(e.target.getAttribute('data-id'));
                console.log('Delete button clicked for village ID:', villageId);
                if (villageId && !isNaN(villageId)) {
                    deleteVillage(villageId);
                } else {
                    SweetPopup.error('Invalid village ID');
                }
            }
        });
        
        console.log('Villages list loaded successfully with', villagesData.length, 'items');
        
    } catch (error) {
        console.error('Error loading villages list:', error);
        villagesListContainer.innerHTML = '<p>Error loading villages. Please try again.</p>';
    }
}

// Delete village - FIXED VERSION
// Delete village - ENHANCED VERSION with better error handling
async function deleteVillage(id) {
  console.log('🔄 Starting delete process for village ID:', id);
  
  SweetPopup.confirm(
    'Are you sure you want to delete this village?',
    'Confirm Deletion',
    async () => {
      try {
        console.log('🗑️ Confirmed deletion for village ID:', id);
        
        const response = await fetch(`/api/villages/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        console.log('📡 Delete response status:', response.status);
        
        const result = await response.json();
        console.log('📡 Delete response data:', result);

        if (!response.ok) {
          throw new Error(result.error || `Server returned ${response.status}`);
        }

        if (result.success) {
          console.log('✅ Village deletion successful');
          SweetPopup.success('Village deleted successfully!');
          
          // Refresh the villages list
          await loadVillagesList();
        } else {
          throw new Error(result.error || 'Failed to delete village');
        }
      } catch (error) {
        console.error('❌ Error deleting village:', error);
        SweetPopup.error('Error deleting village: ' + error.message);
      }
    },
    () => {
      console.log('❌ Village deletion cancelled by user');
    }
  );
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

// Load leaders to admin panel - FIXED VERSION (No Duplicate Listeners)
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

        // Use event delegation instead of multiple event listeners
        leaderListContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('edit-btn')) {
                const leaderId = parseInt(e.target.getAttribute('data-id'));
                editLeader(leaderId);
            }
            
            if (e.target.classList.contains('delete-btn')) {
                const leaderId = parseInt(e.target.getAttribute('data-id'));
                deleteLeader(leaderId);
            }
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

// Load news to admin panel - FIXED VERSION (No Duplicate Listeners)
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

        // Use event delegation instead of multiple event listeners
        newsListContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('edit-btn')) {
                const newsId = parseInt(e.target.getAttribute('data-id'));
                editNews(newsId);
            }
            
            if (e.target.classList.contains('delete-btn')) {
                const newsId = parseInt(e.target.getAttribute('data-id'));
                deleteNews(newsId);
            }
        });
    } catch (error) {
        newsListContainer.innerHTML = '<p>Error loading news.</p>';
        console.error('Error loading news list:', error);
    }
}

// Load events to admin panel
async function loadEventsList() {
    const eventsListContainer = document.getElementById('eventsListContainer');
    if (!eventsListContainer) return;
    
    eventsListContainer.innerHTML = '<p>Loading...</p>';
    
    try {
        const eventsData = await apiService.getEvents();
        
        eventsListContainer.innerHTML = '';
        
        if (eventsData.length === 0) {
            eventsListContainer.innerHTML = '<p>No events added yet.</p>';
            return;
        }
        
        eventsData.forEach(event => {
            const eventItem = document.createElement('div');
            eventItem.className = 'event-item';
            eventItem.innerHTML = `
                <div>
                    <h4>${event.title}</h4>
                    <p><strong>Date:</strong> ${formatDate(event.date)} ${event.time ? 'at ' + event.time : ''}</p>
                    <p><strong>Category:</strong> ${event.category}</p>
                    <p><strong>Location:</strong> ${event.location}</p>
                </div>
                <div class="item-actions">
                    <button class="edit-btn" data-id="${event.id}">Edit</button>
                    <button class="delete-btn" data-id="${event.id}">Delete</button>
                </div>
            `;
            eventsListContainer.appendChild(eventItem);
        });

        // Use event delegation for event actions
        eventsListContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('edit-btn')) {
                const eventId = parseInt(e.target.getAttribute('data-id'));
                editEvent(eventId);
            }
            
            if (e.target.classList.contains('delete-btn')) {
                const eventId = parseInt(e.target.getAttribute('data-id'));
                deleteEvent(eventId);
            }
        });
    } catch (error) {
        eventsListContainer.innerHTML = '<p>Error loading events.</p>';
        console.error('Error loading events list:', error);
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

// Load support requests to admin panel
async function loadSupportRequests() {
    const supportRequestsContainer = document.getElementById('supportRequestsContainer');
    if (!supportRequestsContainer) return;
    
    supportRequestsContainer.innerHTML = '<p>Loading support requests...</p>';
    
    try {
        const supportData = await apiService.getSupportRequests();
        
        supportRequestsContainer.innerHTML = '';
        
        if (supportData.length === 0) {
            supportRequestsContainer.innerHTML = '<p>No support requests yet.</p>';
            updateSupportStats(0, 0, 0);
            return;
        }
        
        // Calculate stats
        const total = supportData.length;
        const pending = supportData.filter(req => req.status === 'pending').length;
        const resolved = supportData.filter(req => req.status === 'resolved').length;
        
        updateSupportStats(total, pending, resolved);
        
        // Display support requests
        supportData.forEach(request => {
            const requestElement = document.createElement('div');
            requestElement.className = 'support-item';
            requestElement.innerHTML = `
                <div class="support-header">
                    <div class="support-name">${request.fullName}</div>
                    <div class="support-meta">
                        <span class="support-type">${request.issueType}</span>
                        <span class="support-priority priority-${request.priority.toLowerCase()}">${request.priority}</span>
                        <span class="support-status status-${request.status}">${request.status}</span>
                        <span>${formatDate(request.date)}</span>
                    </div>
                </div>
                <div class="support-subject">${request.subject}</div>
                <div class="support-description">${request.description}</div>
                ${request.suggestions ? `<div class="support-suggestions"><strong>Suggestions:</strong> ${request.suggestions}</div>` : ''}
                <div class="support-contact">
                    <span><strong>Email:</strong> ${request.email}</span>
                    ${request.phone ? `<span><strong>Phone:</strong> ${request.phone}</span>` : ''}
                    <span><strong>Village:</strong> ${request.village}</span>
                </div>
                <div class="support-actions">
                    ${request.status === 'pending' ? 
                        `<button class="btn btn-success resolve-btn" data-id="${request.id}">Mark Resolved</button>` : 
                        `<button class="btn btn-warning pending-btn" data-id="${request.id}">Mark Pending</button>`
                    }
                    <button class="btn btn-danger delete-support-btn" data-id="${request.id}">Delete</button>
                </div>
            `;
            supportRequestsContainer.appendChild(requestElement);
        });

        // Use event delegation for support actions
        supportRequestsContainer.addEventListener('click', async (e) => {
            if (e.target.classList.contains('resolve-btn')) {
                const requestId = parseInt(e.target.getAttribute('data-id'));
                await updateSupportRequestStatus(requestId, 'resolved');
            }
            
            if (e.target.classList.contains('pending-btn')) {
                const requestId = parseInt(e.target.getAttribute('data-id'));
                await updateSupportRequestStatus(requestId, 'pending');
            }
            
            if (e.target.classList.contains('delete-support-btn')) {
                const requestId = parseInt(e.target.getAttribute('data-id'));
                await deleteSupportRequest(requestId);
            }
        });
    } catch (error) {
        supportRequestsContainer.innerHTML = '<p>Error loading support requests.</p>';
        console.error('Error loading support requests:', error);
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
        SweetPopup.error('Error loading leader data: ' + error.message);
    }
}

// Delete leader
async function deleteLeader(id) {
    SweetPopup.confirm(
        'Are you sure you want to delete this leader?',
        'Confirm Deletion',
        async () => {
            try {
                await apiService.deleteLeader(id);
                await loadLeaders();
                await loadLeaderList();
                SweetPopup.success('Leader deleted successfully!');
            } catch (error) {
                SweetPopup.error('Error deleting leader: ' + error.message);
            }
        }
    );
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
        SweetPopup.error('Error loading news data: ' + error.message);
    }
}

// Delete news
async function deleteNews(id) {
    SweetPopup.confirm(
        'Are you sure you want to delete this news article?',
        'Confirm Deletion',
        async () => {
            try {
                await apiService.deleteNews(id);
                await loadNews();
                await loadNewsList();
                SweetPopup.success('News deleted successfully!');
            } catch (error) {
                SweetPopup.error('Error deleting news: ' + error.message);
            }
        }
    );
}

// Edit event
async function editEvent(id) {
    try {
        const eventsData = await apiService.getEvents();
        const event = eventsData.find(e => e.id === id);
        if (!event) return;
        
        document.getElementById('eventTitle').value = event.title;
        document.getElementById('eventCategory').value = event.category;
        document.getElementById('eventDescription').value = event.description;
        document.getElementById('eventDate').value = event.date;
        document.getElementById('eventTime').value = event.time || '';
        document.getElementById('eventLocation').value = event.location;
        document.getElementById('eventOrganizer').value = event.organizer || '';
        document.getElementById('eventId').value = event.id;
        
        // Update image preview
        const eventImagePreview = document.getElementById('eventImagePreview');
        if (eventImagePreview && event.image) {
            const imageUrl = event.image.startsWith('http') ? event.image : CONFIG.apiBaseUrl + event.image;
            eventImagePreview.innerHTML = `<img src="${imageUrl}" alt="Preview">`;
        }
        
        // Update form title and button
        document.getElementById('eventsFormTitle').textContent = 'Edit Event';
        document.getElementById('eventSubmitBtn').textContent = 'Update Event';
        document.getElementById('cancelEventEdit').style.display = 'inline-block';
    } catch (error) {
        SweetPopup.error('Error loading event data: ' + error.message);
    }
}

// Delete event
async function deleteEvent(id) {
    SweetPopup.confirm(
        'Are you sure you want to delete this event?',
        'Confirm Deletion',
        async () => {
            try {
                await apiService.deleteEvent(id);
                await loadEventsList();
                SweetPopup.success('Event deleted successfully!');
            } catch (error) {
                SweetPopup.error('Error deleting event: ' + error.message);
            }
        }
    );
}

// Update support request status
async function updateSupportRequestStatus(id, status) {
    try {
        await apiService.updateSupportStatus(id, status);
        await loadSupportRequests();
        SweetPopup.success(`Support request marked as ${status} successfully!`);
    } catch (error) {
        SweetPopup.error('Error updating support request: ' + error.message);
    }
}

// Delete support request
async function deleteSupportRequest(id) {
    SweetPopup.confirm(
        'Are you sure you want to delete this support request?',
        'Confirm Deletion',
        async () => {
            try {
                await apiService.deleteSupportRequest(id);
                await loadSupportRequests();
                SweetPopup.success('Support request deleted successfully!');
            } catch (error) {
                SweetPopup.error('Error deleting support request: ' + error.message);
            }
        }
    );
}

// Reset leader form to add mode
function resetLeaderFormToAddMode() {
    const leaderForm = document.getElementById('leaderForm');
    if (leaderForm) {
        leaderForm.reset();
        // Clear file input specifically
        document.getElementById('leaderImage').value = '';
    }
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
    if (newsForm) {
        newsForm.reset();
        // Clear file input specifically
        document.getElementById('newsImage').value = '';
    }
    document.getElementById('newsId').value = '';
    const newsImagePreview = document.getElementById('newsImagePreview');
    if (newsImagePreview) newsImagePreview.innerHTML = '<span>No image selected</span>';
    document.getElementById('newsFormTitle').textContent = 'Add News Article';
    document.getElementById('newsSubmitBtn').textContent = 'Add News';
    document.getElementById('cancelNewsEdit').style.display = 'none';
    document.getElementById('newsDate').valueAsDate = new Date();
}

// Reset event form to add mode
function resetEventFormToAddMode() {
    const eventsForm = document.getElementById('eventsForm');
    if (eventsForm) {
        eventsForm.reset();
        document.getElementById('eventImage').value = '';
    }
    document.getElementById('eventId').value = '';
    const eventImagePreview = document.getElementById('eventImagePreview');
    if (eventImagePreview) eventImagePreview.innerHTML = '<span>No image selected</span>';
    document.getElementById('eventsFormTitle').textContent = 'Add New Event';
    document.getElementById('eventSubmitBtn').textContent = 'Add Event';
    document.getElementById('cancelEventEdit').style.display = 'none';
    document.getElementById('eventDate').valueAsDate = new Date();
}

// Update support statistics
function updateSupportStats(total, pending, resolved) {
    const totalElement = document.getElementById('totalRequests');
    const pendingElement = document.getElementById('pendingRequests');
    const resolvedElement = document.getElementById('resolvedRequests');
    
    if (totalElement) totalElement.textContent = total;
    if (pendingElement) pendingElement.textContent = pending;
    if (resolvedElement) resolvedElement.textContent = resolved;
}

// Initialize support management
function initializeSupportManagement() {
    const refreshSupport = document.getElementById('refreshSupport');
    const clearSupport = document.getElementById('clearSupport');
    const supportFilter = document.getElementById('supportFilter');
    
    if (refreshSupport && !refreshSupport.hasAttribute('data-initialized')) {
        refreshSupport.setAttribute('data-initialized', 'true');
        refreshSupport.addEventListener('click', async () => {
            await loadSupportRequests();
        });
    }
    
    if (clearSupport && !clearSupport.hasAttribute('data-initialized')) {
        clearSupport.setAttribute('data-initialized', 'true');
        clearSupport.addEventListener('click', async () => {
            SweetPopup.confirm(
                'Are you sure you want to clear all support requests? This action cannot be undone.',
                'Clear All Support Requests',
                () => {
                    SweetPopup.info('Clear all functionality would be implemented here');
                }
            );
        });
    }
    
    if (supportFilter && !supportFilter.hasAttribute('data-initialized')) {
        supportFilter.setAttribute('data-initialized', 'true');
        supportFilter.addEventListener('change', (e) => {
            // Filter functionality can be implemented here
            console.log('Filter changed to:', e.target.value);
        });
    }
}

// Initialize support form
function initializeSupportForm() {
    const supportForm = document.getElementById('supportForm');
    if (!supportForm) return;

    supportForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(supportForm);
        const supportData = {
            fullName: formData.get('fullName'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            village: formData.get('village'),
            issueType: formData.get('issueType'),
            priority: formData.get('priority'),
            subject: formData.get('subject'),
            description: formData.get('description'),
            suggestions: formData.get('suggestions'),
            date: new Date().toISOString().split('T')[0]
        };
        
        try {
            await apiService.addSupportRequest(supportData);
            SweetPopup.success('Support request submitted successfully! We will get back to you soon.');
            supportForm.reset();
        } catch (error) {
            SweetPopup.error('Error submitting support request: ' + error.message);
        }
    });
}

// Load events to the events page
async function loadEvents() {
    const eventsContainer = document.getElementById('eventsContainer');
    if (!eventsContainer) return;
    
    eventsContainer.innerHTML = '<p>Loading events...</p>';
    
    try {
        const eventsData = await apiService.getEvents();
        
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
        
        eventsData.forEach(event => {
            const eventCard = document.createElement('div');
            eventCard.className = 'event-card';
            eventCard.setAttribute('data-category', event.category);
            
            const imageUrl = event.image ? (event.image.startsWith('http') ? event.image : CONFIG.apiBaseUrl + event.image) : "https://images.unsplash.com/photo-1511578314322-379afb476865?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80";
            
            eventCard.innerHTML = `
                <div class="event-image">
                    <img src="${imageUrl}" alt="${event.title}">
                </div>
                <div class="event-content">
                    <div class="event-date">${formatDate(event.date)}</div>
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
            eventsContainer.appendChild(eventCard);
        });
    } catch (error) {
        eventsContainer.innerHTML = '<p>Error loading events. Please try again later.</p>';
        console.error('Error loading events:', error);
    }
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
    // Mobile menu functionality
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');

if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', function() {
        navLinks.classList.toggle('active');
        this.setAttribute('aria-expanded', 
            this.getAttribute('aria-expanded') === 'true' ? 'false' : 'true'
        );
    });
    
    // Close mobile menu when clicking on a link
    const navItems = navLinks.querySelectorAll('a');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navLinks.classList.remove('active');
            mobileMenuBtn.setAttribute('aria-expanded', 'false');
        });
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!event.target.closest('nav') && navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            mobileMenuBtn.setAttribute('aria-expanded', 'false');
        }
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
                SweetPopup.success('Thank you for your message. We will get back to you soon!');
                this.reset();
            } catch (error) {
                SweetPopup.error('Error submitting message: ' + error.message);
            }
        });
    }

    // Initialize support form if on support page
    initializeSupportForm();

    // Initialize hero slider
    initializeHeroSlider();
    
    // Initialize scroll to top
    initializeScrollToTop();
    
    // Load initial data (villages removed from main page)
    await loadGovernor();
    await loadLeaders();
    await loadVideo();
    await loadNews();
}

// Hero Slider Functionality
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

// Scroll to Top Functionality - FIXED VERSION
function initializeScrollToTop() {
    const scrollToTopBtn = document.getElementById('scrollToTop');
    
    if (!scrollToTopBtn) {
        console.error('Scroll to top button not found!');
        return;
    }

    // Initially hide the button
    scrollToTopBtn.style.display = 'none';
    
    // Add scroll event listener
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollToTopBtn.style.display = 'block';
            scrollToTopBtn.classList.add('show');
        } else {
            scrollToTopBtn.style.display = 'none';
            scrollToTopBtn.classList.remove('show');
        }
    });

    // Add click event listener
    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    console.log('✅ Scroll to top button initialized');
}

console.log('Website scripts loaded successfully');