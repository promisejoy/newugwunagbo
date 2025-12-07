// Configuration
const CONFIG = {
  apiBaseUrl: window.location.origin,
  isProduction: true,
};

// Sweet Popup System
const SweetPopup = {
  init() {
    this.popup = document.getElementById("sweetPopup");
    this.title = this.popup.querySelector(".popup-title");
    this.message = this.popup.querySelector(".popup-message");
    this.icon = this.popup.querySelector(".popup-icon");
    this.buttons = this.popup.querySelector(".popup-buttons");

    // Close events
    this.popup
      .querySelector(".popup-close")
      .addEventListener("click", () => this.hide());
    this.popup.addEventListener("click", (e) => {
      if (e.target === this.popup) this.hide();
    });
  },

  show(options = {}) {
    const {
      title = "Notification",
      message = "",
      type = "info", // success, error, warning, info
      showConfirmButton = true,
      confirmButtonText = "OK",
      showCancelButton = false,
      cancelButtonText = "Cancel",
      onConfirm = null,
      onCancel = null,
      timer = null,
    } = options;

    // Set content
    this.title.textContent = title;
    this.message.textContent = message;

    // Set icon
    this.icon.className = "popup-icon";
    this.icon.classList.add(type);
    this.icon.innerHTML = this.getIcon(type);

    // Create buttons
    this.buttons.innerHTML = "";

    if (showCancelButton) {
      const cancelBtn = document.createElement("button");
      cancelBtn.className = "popup-btn cancel";
      cancelBtn.textContent = cancelButtonText;
      cancelBtn.onclick = () => {
        if (onCancel) onCancel();
        this.hide();
      };
      this.buttons.appendChild(cancelBtn);
    }

    if (showConfirmButton) {
      const confirmBtn = document.createElement("button");
      confirmBtn.className = `popup-btn ${type}`;
      confirmBtn.textContent = confirmButtonText;
      confirmBtn.onclick = () => {
        if (onConfirm) onConfirm();
        this.hide();
      };
      this.buttons.appendChild(confirmBtn);
    }

    // Show popup
    this.popup.classList.add("show");

    // Auto close if timer is set
    if (timer) {
      setTimeout(() => this.hide(), timer);
    }
  },

  hide() {
    this.popup.classList.remove("show");
  },

  getIcon(type) {
    const icons = {
      success: '<i class="fas fa-check-circle"></i>',
      error: '<i class="fas fa-exclamation-circle"></i>',
      warning: '<i class="fas fa-exclamation-triangle"></i>',
      info: '<i class="fas fa-info-circle"></i>',
    };
    return icons[type] || icons.info;
  },

  // Convenience methods
  success(message, title = "Success!") {
    this.show({ title, message, type: "success", timer: 3000 });
  },

  error(message, title = "Error!") {
    this.show({ title, message, type: "error" });
  },

  warning(message, title = "Warning!") {
    this.show({ title, message, type: "warning" });
  },

  info(message, title = "Information") {
    this.show({ title, message, type: "info", timer: 3000 });
  },

  confirm(message, title = "Confirm Action", onConfirm, onCancel = null) {
    this.show({
      title,
      message,
      type: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "No",
      onConfirm,
      onCancel,
    });
  },
};

// API Service Functions
const apiService = {
  // Governor API
  async getGovernor() {
    const response = await fetch("/api/governor");
    if (!response.ok) throw new Error("Failed to fetch governor");
    return await response.json();
  },

  async updateGovernor(governorData) {
    const formData = new FormData();
    Object.keys(governorData).forEach((key) => {
      if (key === "image" && governorData[key] instanceof File) {
        formData.append("image", governorData[key]);
      } else {
        formData.append(key, governorData[key]);
      }
    });

    const response = await fetch("/api/governor", {
      method: "PUT",
      body: formData,
    });

    if (!response.ok) throw new Error("Failed to update governor");
    return await response.json();
  },

  // Video API
  async getVideo() {
    const response = await fetch("/api/video");
    if (!response.ok) throw new Error("Failed to fetch video");
    return await response.json();
  },

  async updateVideo(videoData) {
    const formData = new FormData();
    Object.keys(videoData).forEach((key) => {
      if (key === "video" && videoData[key] instanceof File) {
        formData.append("video", videoData[key]);
      } else {
        formData.append(key, videoData[key]);
      }
    });

    const response = await fetch("/api/video", {
      method: "PUT",
      body: formData,
    });

    if (!response.ok) throw new Error("Failed to update video");
    return await response.json();
  },

  // Villages API
  async getVillages() {
    const response = await fetch("/api/villages");
    if (!response.ok) throw new Error("Failed to fetch villages");
    return await response.json();
  },

  async addVillage(villageData) {
    const response = await fetch("/api/villages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(villageData),
    });

    if (!response.ok) throw new Error("Failed to add village");
    return await response.json();
  },

  async deleteVillage(id) {
    const response = await fetch(`/api/villages/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) throw new Error("Failed to delete village");
    return await response.json();
  },

  // Leaders API
  async getLeaders() {
    const response = await fetch("/api/leaders");
    if (!response.ok) throw new Error("Failed to fetch leaders");
    return await response.json();
  },

  async addLeader(leaderData) {
    const formData = new FormData();
    Object.keys(leaderData).forEach((key) => {
      if (key === "image" && leaderData[key] instanceof File) {
        formData.append("image", leaderData[key]);
      } else {
        formData.append(key, leaderData[key]);
      }
    });

    const response = await fetch("/api/leaders", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Failed to add leader");
    return await response.json();
  },

  async updateLeader(id, leaderData) {
    const formData = new FormData();
    Object.keys(leaderData).forEach((key) => {
      if (key === "image" && leaderData[key] instanceof File) {
        formData.append("image", leaderData[key]);
      } else {
        formData.append(key, leaderData[key]);
      }
    });

    const response = await fetch(`/api/leaders/${id}`, {
      method: "PUT",
      body: formData,
    });

    if (!response.ok) throw new Error("Failed to update leader");
    return await response.json();
  },

  async deleteLeader(id) {
    const response = await fetch(`/api/leaders/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) throw new Error("Failed to delete leader");
    return await response.json();
  },










  








  // News API
  async getNews() {
    const response = await fetch("/api/news");
    if (!response.ok) throw new Error("Failed to fetch news");
    return await response.json();
  },

  // Leadership History API
  async getLeadershipHistory() {
    const response = await fetch("/api/leadership-history");
    if (!response.ok) throw new Error("Failed to fetch leadership history");
    const result = await response.json();
    return result.data || result; // Handle both formats
  },

 

  async updateLeadership(id, leaderData) {
    const formData = new FormData();

    Object.keys(leaderData).forEach((key) => {
      if (key === "image" && leaderData[key] instanceof File) {
        formData.append("image", leaderData[key]);
      } else if (key !== "image") {
        formData.append(key, leaderData[key]);
      }
    });

    const response = await fetch(`/api/leadership-history/${id}`, {
      method: "PUT",
      body: formData,
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(
        result.error || result.message || "Failed to update leader"
      );
    }
    return result;
  },

  async deleteLeadership(id) {
    const response = await fetch(`/api/leadership-history/${id}`, {
      method: "DELETE",
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(
        result.error || result.message || "Failed to delete leader"
      );
    }
    return result;
  },

  // Leadership History API
  async getLeadershipHistory() {
    const response = await fetch("/api/leadership-history");
    if (!response.ok) throw new Error("Failed to fetch leadership history");
    return await response.json();
  },

  // Leadership History API - UPDATE THIS FUNCTION
async addLeadership(leaderData) {
    try {
        const formData = new FormData();
        
        console.log('Sending leader data:', leaderData);
        
        // Add text fields
        Object.keys(leaderData).forEach((key) => {
            if (key === 'image' && leaderData[key] instanceof File) {
                console.log('Adding image file:', leaderData[key].name);
                formData.append("image", leaderData[key]);
            } else if (key !== 'image') {
                console.log(`Adding ${key}:`, leaderData[key]);
                formData.append(key, leaderData[key]);
            }
        });

        console.log('Sending request to /api/leadership-history');
        
        const response = await fetch("/api/leadership-history", {
            method: "POST",
            body: formData,
            // Don't set Content-Type header for FormData - browser sets it automatically
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        
        let result;
        try {
            result = await response.json();
            console.log('Response data:', result);
        } catch (jsonError) {
            console.error('Failed to parse JSON response:', jsonError);
            const text = await response.text();
            console.error('Raw response:', text);
            throw new Error('Invalid JSON response from server');
        }

        if (!response.ok) {
            throw new Error(result.error || result.message || `Server returned ${response.status}`);
        }
        
        return result;
    } catch (error) {
        console.error('Error in addLeadership:', error);
        throw error; // Re-throw so the calling function can handle it
    }
},





  async updateLeadership(id, leaderData) {
    const formData = new FormData();
    Object.keys(leaderData).forEach((key) => {
      if (key === "image" && leaderData[key] instanceof File) {
        formData.append("image", leaderData[key]);
      } else {
        formData.append(key, leaderData[key]);
      }
    });

    const response = await fetch(`/api/leadership-history/${id}`, {
      method: "PUT",
      body: formData,
    });

    if (!response.ok) throw new Error("Failed to update leader");
    return await response.json();
  },

  async deleteLeadership(id) {
    const response = await fetch(`/api/leadership-history/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) throw new Error("Failed to delete leader");
    return await response.json();
  },

  async getNewsById(id) {
    const response = await fetch(`/api/news/${id}`);
    if (!response.ok) throw new Error("Failed to fetch news article");
    return await response.json();
  },
  async addNews(newsData) {
    const formData = new FormData();
    Object.keys(newsData).forEach((key) => {
      if (key === "image" && newsData[key] instanceof File) {
        formData.append("image", newsData[key]);
      } else {
        formData.append(key, newsData[key]);
      }
    });

    const response = await fetch("/api/news", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Failed to add news");
    return await response.json();
  },

  async updateNews(id, newsData) {
    const formData = new FormData();
    Object.keys(newsData).forEach((key) => {
      if (key === "image" && newsData[key] instanceof File) {
        formData.append("image", newsData[key]);
      } else {
        formData.append(key, newsData[key]);
      }
    });

    const response = await fetch(`/api/news/${id}`, {
      method: "PUT",
      body: formData,
    });

    if (!response.ok) throw new Error("Failed to update news");
    return await response.json();
  },

  async deleteNews(id) {
    const response = await fetch(`/api/news/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) throw new Error("Failed to delete news");
    return await response.json();
  },

  // Contacts API
  async getContacts() {
    const response = await fetch("/api/contacts");
    if (!response.ok) throw new Error("Failed to fetch contacts");
    return await response.json();
  },

  async addContact(contactData) {
    const response = await fetch("/api/contacts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(contactData),
    });

    if (!response.ok) throw new Error("Failed to submit contact");
    return await response.json();
  },

  // Support API
  async getSupportRequests() {
    const response = await fetch("/api/support");
    if (!response.ok) throw new Error("Failed to fetch support requests");
    return await response.json();
  },

  async addSupportRequest(supportData) {
    const response = await fetch("/api/support", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(supportData),
    });

    if (!response.ok) throw new Error("Failed to submit support request");
    return await response.json();
  },

  async updateSupportStatus(id, status) {
    const response = await fetch(`/api/support/${id}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok)
      throw new Error("Failed to update support request status");
    return await response.json();
  },

  async deleteSupportRequest(id) {
    const response = await fetch(`/api/support/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) throw new Error("Failed to delete support request");
    return await response.json();
  },











// Academia API functions - UPDATED
async getAcademia() {
  const response = await fetch("/api/academia");
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch academia");
  }
  return await response.json();
},

async addAcademician(academiaData) {
  const formData = new FormData();
  
  console.log('📤 Adding academician:', academiaData);
  
  // Add all fields to formData
  Object.keys(academiaData).forEach((key) => {
    if (key === "photo" && academiaData[key] instanceof File) {
      formData.append("photo", academiaData[key]);
      console.log('📸 Added photo file:', academiaData[key].name);
    } else if (key !== "photo") {
      formData.append(key, academiaData[key]);
      console.log(`📝 Added ${key}:`, academiaData[key]);
    }
  });

  const response = await fetch("/api/academia", {
    method: "POST",
    body: formData,
  });

  const result = await response.json();
  console.log('📥 Response:', result);
  
  if (!response.ok) {
    throw new Error(result.error || "Failed to add academician");
  }
  return result;
},

async deleteAcademician(id) {
  const response = await fetch(`/api/academia/${id}`, {
    method: "DELETE",
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || "Failed to delete academician");
  }
  return result;
},

// Gallery API functions - UPDATED
async getGallery() {
  const response = await fetch("/api/gallery");
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch gallery");
  }
  return await response.json();
},

async uploadGalleryItem(galleryData) {
  const formData = new FormData();
  
  console.log('📤 Uploading gallery item:', galleryData);
  
  // Add all fields to formData
  Object.keys(galleryData).forEach((key) => {
    if (key === "file" && galleryData[key] instanceof File) {
      formData.append("file", galleryData[key]);
      console.log('📁 Added file:', galleryData[key].name);
    } else if (key !== "file") {
      formData.append(key, galleryData[key]);
      console.log(`📝 Added ${key}:`, galleryData[key]);
    }
  });

  const response = await fetch("/api/gallery", {
    method: "POST",
    body: formData,
  });

  const result = await response.json();
  console.log('📥 Response:', result);
  
  if (!response.ok) {
    throw new Error(result.error || "Failed to upload gallery item");
  }
  return result;
},

async deleteGalleryItem(id) {
  const response = await fetch(`/api/gallery/${id}`, {
    method: "DELETE",
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error || "Failed to delete gallery item");
  }
  return result;
},
















  // Password Change API
  async changePassword(passwordData) {
    const response = await fetch("/api/admin/password", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(passwordData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to change password");
    }
    return await response.json();
  },

  // Admin Login
  async adminLogin(credentials) {
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error);
    return result;
  },

  // Events API
  async getEvents() {
    const response = await fetch("/api/events");
    if (!response.ok) throw new Error("Failed to fetch events");
    return await response.json();
  },

  async addEvent(eventData) {
    const formData = new FormData();
    Object.keys(eventData).forEach((key) => {
      if (key === "image" && eventData[key] instanceof File) {
        formData.append("image", eventData[key]);
      } else {
        formData.append(key, eventData[key]);
      }
    });

    const response = await fetch("/api/events", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) throw new Error("Failed to add event");
    return await response.json();
  },

  async updateEvent(id, eventData) {
    const formData = new FormData();
    Object.keys(eventData).forEach((key) => {
      if (key === "image" && eventData[key] instanceof File) {
        formData.append("image", eventData[key]);
      } else {
        formData.append(key, eventData[key]);
      }
    });

    const response = await fetch(`/api/events/${id}`, {
      method: "PUT",
      body: formData,
    });

    if (!response.ok) throw new Error("Failed to update event");
    return await response.json();
  },

  async deleteEvent(id) {
    const response = await fetch(`/api/events/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) throw new Error("Failed to delete event");
    return await response.json();
  },

  // Service Applications API
  async getServiceApplications() {
    const response = await fetch("/api/service-applications");
    if (!response.ok) throw new Error("Failed to fetch service applications");
    return await response.json();
  },

  async addServiceApplication(applicationData) {
    const response = await fetch("/api/service-applications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(applicationData),
    });

    if (!response.ok) throw new Error("Failed to submit application");
    return await response.json();
  },

  async updateServiceApplicationStatus(id, status) {
    const response = await fetch(`/api/service-applications/${id}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) throw new Error("Failed to update application status");
    return await response.json();
  },

  async updateServiceApplicationPayment(id, paymentData) {
    const response = await fetch(`/api/service-applications/${id}/payment`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) throw new Error("Failed to update payment status");
    return await response.json();
  },

  async deleteServiceApplication(id) {
    const response = await fetch(`/api/service-applications/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) throw new Error("Failed to delete application");
    return await response.json();
  },
};

// Form submission trackers to prevent duplicates
let isSubmittingLeader = false;
let isSubmittingNews = false;

// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM fully loaded and parsed");

  // Initialize Sweet Popup
  SweetPopup.init();

  // DOM Elements
  const adminLoginBtn = document.getElementById("adminLoginBtn");
  const loginModal = document.getElementById("loginModal");
  const closeLoginModal = document.getElementById("closeLoginModal");
  const adminLoginForm = document.getElementById("adminLoginForm");
  const adminDashboard = document.getElementById("adminDashboard");
  const closeAdminDashboard = document.getElementById("closeAdminDashboard");

  // Set current year in footer
  document.getElementById("currentYear").textContent = new Date().getFullYear();

  // Admin Button Click
  if (adminLoginBtn) {
    adminLoginBtn.addEventListener("click", function (e) {
      console.log("Admin button clicked!");
      e.preventDefault();
      e.stopPropagation();

      if (loginModal) {
        loginModal.style.display = "flex";
        console.log("Login modal displayed");
      }
    });
  }

  // Close Login Modal
  if (closeLoginModal) {
    closeLoginModal.addEventListener("click", function () {
      if (loginModal) {
        loginModal.style.display = "none";
      }
    });
  }

  // Close modal when clicking outside
  if (loginModal) {
    loginModal.addEventListener("click", function (e) {
      if (e.target === loginModal) {
        loginModal.style.display = "none";
      }
    });
  }

  // Admin Login Form Submission
  if (adminLoginForm) {
    adminLoginForm.addEventListener("submit", async function (e) {
      e.preventDefault();
      console.log("Login form submitted!");

      const username = document.getElementById("username").value;
      const password = document.getElementById("password").value;

      try {
        const result = await apiService.adminLogin({ username, password });

        if (result.success) {
          console.log("Login successful!");

          // Hide login modal
          if (loginModal) {
            loginModal.style.display = "none";
          }

          // Show admin dashboard
          if (adminDashboard) {
            adminDashboard.style.display = "block";
            console.log("Admin dashboard displayed");

            // Load admin data
            loadAdminData();
          }
        }
      } catch (error) {
        SweetPopup.error(error.message || "Login failed");
      }
    });
  }

  // Close Admin Dashboard
  if (closeAdminDashboard) {
    closeAdminDashboard.addEventListener("click", function () {
      if (adminDashboard) {
        adminDashboard.style.display = "none";
      }
    });
  }

  // Close admin dashboard when clicking outside
  if (adminDashboard) {
    adminDashboard.addEventListener("click", function (e) {
      if (e.target === adminDashboard) {
        adminDashboard.style.display = "none";
      }
    });
  }

  // Initialize other functionality
  initializeWebsite();
});

// Admin Data Loading Functions
async function loadAdminData() {
  console.log("Loading admin data...");
  await loadGovernorData();
  await loadLeaderList();
  await loadVideoData();
  await loadVillagesList();
  await loadNewsList();
  await loadEventsList();
  await loadContactRequests();
  await loadSupportRequests();
  await loadServiceApplications();
  initializeAdminTabs();
  initializeAdminForms();
  initializePasswordForm();
  initializeSupportManagement();
  initializeServiceApplicationsManagement(); // ADD THIS LINE
}

// Initialize service applications management
function initializeServiceApplicationsManagement() {
  const refreshBtn = document.getElementById("refreshApplications");
  const filterSelect = document.getElementById("applicationFilter");

  if (refreshBtn) {
    refreshBtn.addEventListener("click", loadServiceApplications);
  }

  if (filterSelect) {
    filterSelect.addEventListener("change", (e) => {
      // Filter functionality can be implemented here
      console.log("Filter changed to:", e.target.value);
    });
  }
}

// Initialize Admin Tabs
function initializeAdminTabs() {
  const adminTabs = document.querySelectorAll(".admin-tab");
  const tabContents = document.querySelectorAll(".tab-content");

  if (adminTabs.length > 0) {
    adminTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const tabId = tab.getAttribute("data-tab");

        // Remove active class from all tabs and contents
        adminTabs.forEach((t) => t.classList.remove("active"));
        tabContents.forEach((c) => c.classList.remove("active"));

        // Add active class to clicked tab and corresponding content
        tab.classList.add("active");
        const targetTab = document.getElementById(`${tabId}Tab`);
        if (targetTab) {
          targetTab.classList.add("active");
        }

        console.log(`Switched to ${tabId} tab`);
      });
    });
  }
}

// Initialize Admin Forms - UPDATED FOR MONGODB _id
function initializeAdminForms() {
  console.log("Initializing admin forms...");

  // Governor Form
  const governorForm = document.getElementById("governorForm");
  const governorImage = document.getElementById("governorImage");
  const governorImagePreview = document.getElementById("governorImagePreview");

  if (governorForm && !governorForm.hasAttribute("data-initialized")) {
    governorForm.setAttribute("data-initialized", "true");
    governorForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const name = document.getElementById("governorName").value;
      const imageFile = governorImage.files[0];

      const governorData = {
        name,
        image: imageFile,
      };

      try {
        await apiService.updateGovernor(governorData);
        SweetPopup.success("Governor information updated successfully!");

        // Update UI
        await loadGovernor();
      } catch (error) {
        SweetPopup.error("Error updating governor: " + error.message);
      }
    });
  }

  // Governor Image Preview
  if (governorImage && governorImagePreview) {
    governorImage.addEventListener("change", function (e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
          governorImagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        };
        reader.readAsDataURL(file);
      } else {
        governorImagePreview.innerHTML = "<span>No image selected</span>";
      }
    });
  }

  // Video Form
  const videoForm = document.getElementById("videoForm");
  const videoFile = document.getElementById("videoFile");

  if (videoForm && !videoForm.hasAttribute("data-initialized")) {
    videoForm.setAttribute("data-initialized", "true");
    videoForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const title = document.getElementById("videoTitle").value;
      const description = document.getElementById("videoDescription").value;
      const video = videoFile.files[0];

      const videoData = {
        title,
        description,
        video: video,
      };

      try {
        await apiService.updateVideo(videoData);
        SweetPopup.success("Video uploaded successfully!");

        // Update UI
        await loadVideo();
      } catch (error) {
        SweetPopup.error("Error uploading video: " + error.message);
      }
    });
  }

  // Village Form
  const villageForm = document.getElementById("villageForm");

  if (villageForm && !villageForm.hasAttribute("data-initialized")) {
    villageForm.setAttribute("data-initialized", "true");
    villageForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const name = document.getElementById("villageName").value;
      const description = document.getElementById("villageDescription").value;

      const villageData = {
        name,
        description,
      };

      try {
        await apiService.addVillage(villageData);
        SweetPopup.success("Village added successfully!");

        // Update UI
        await loadVillagesList();

        // Reset form
        villageForm.reset();
      } catch (error) {
        SweetPopup.error("Error adding village: " + error.message);
      }
    });
  }

  // Leader Form - UPDATED FOR MONGODB _id
  const leaderForm = document.getElementById("leaderForm");
  const leaderImage = document.getElementById("leaderImage");
  const leaderImagePreview = document.getElementById("leaderImagePreview");
  const resetLeaderForm = document.getElementById("resetLeaderForm");
  const leaderIdInput = document.getElementById("leaderId");
  const cancelEdit = document.getElementById("cancelEdit");

  if (leaderForm && !leaderForm.hasAttribute("data-initialized")) {
    leaderForm.setAttribute("data-initialized", "true");
    leaderForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      // Prevent duplicate submissions
      if (isSubmittingLeader) {
        console.log("Leader form submission already in progress");
        return;
      }

      isSubmittingLeader = true;

      // CHANGED: Use string ID instead of parseInt for MongoDB _id
      const id = leaderIdInput.value ? leaderIdInput.value : null;
      const name = document.getElementById("leaderName").value;
      const position = document.getElementById("leaderPosition").value;
      const bio = document.getElementById("leaderBio").value;
      const email = document.getElementById("leaderEmail").value;
      const phone = document.getElementById("leaderPhone").value;
      const twitter = document.getElementById("leaderTwitter").value;
      const facebook = document.getElementById("leaderFacebook").value;
      const linkedin = document.getElementById("leaderLinkedin").value;
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
        image: imageFile,
      };

      try {
        if (id) {
          // Update existing leader - CHANGED: Use string ID
          await apiService.updateLeader(id, leaderData);
          SweetPopup.success("Leader updated successfully!");
        } else {
          // Add new leader
          await apiService.addLeader(leaderData);
          SweetPopup.success("Leader added successfully!");
        }

        // Update UI
        await loadLeaders();
        await loadLeaderList();
        resetLeaderFormToAddMode();
      } catch (error) {
        SweetPopup.error("Error saving leader: " + error.message);
      } finally {
        isSubmittingLeader = false;
      }
    });
  }

  // Leader Image Preview
  if (leaderImage && leaderImagePreview) {
    leaderImage.addEventListener("change", function (e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
          leaderImagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        };
        reader.readAsDataURL(file);
      } else {
        leaderImagePreview.innerHTML = "<span>No image selected</span>";
      }
    });
  }

  // Reset Leader Form
  if (resetLeaderForm && !resetLeaderForm.hasAttribute("data-initialized")) {
    resetLeaderForm.setAttribute("data-initialized", "true");
    resetLeaderForm.addEventListener("click", resetLeaderFormToAddMode);
  }

  // Cancel Edit
  if (cancelEdit && !cancelEdit.hasAttribute("data-initialized")) {
    cancelEdit.setAttribute("data-initialized", "true");
    cancelEdit.addEventListener("click", resetLeaderFormToAddMode);
  }

  // News Form - UPDATED FOR MONGODB _id
  const newsForm = document.getElementById("newsForm");
  const newsImage = document.getElementById("newsImage");
  const newsImagePreview = document.getElementById("newsImagePreview");
  const resetNewsForm = document.getElementById("resetNewsForm");
  const newsIdInput = document.getElementById("newsId");
  const cancelNewsEdit = document.getElementById("cancelNewsEdit");

  if (newsForm && !newsForm.hasAttribute("data-initialized")) {
    newsForm.setAttribute("data-initialized", "true");

    // Set default date
    document.getElementById("newsDate").valueAsDate = new Date();

    newsForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      // Prevent duplicate submissions
      if (isSubmittingNews) {
        console.log("News form submission already in progress");
        return;
      }

      isSubmittingNews = true;

      // CHANGED: Use string ID instead of parseInt for MongoDB _id
      const id = newsIdInput.value ? newsIdInput.value : null;
      const title = document.getElementById("newsTitle").value;
      const content = document.getElementById("newsContent").value;
      const date = document.getElementById("newsDate").value;
      const imageFile = newsImage.files[0];

      const newsData = {
        title,
        content,
        date,
        image: imageFile,
      };

      try {
        if (id) {
          // Update existing news - CHANGED: Use string ID
          await apiService.updateNews(id, newsData);
          SweetPopup.success("News updated successfully!");
        } else {
          // Add new news
          await apiService.addNews(newsData);
          SweetPopup.success("News added successfully!");
        }

        // Update UI
        await loadNews();
        await loadNewsList();
        resetNewsFormToAddMode();
      } catch (error) {
        SweetPopup.error("Error saving news: " + error.message);
      } finally {
        isSubmittingNews = false;
      }
    });
  }

  // News Image Preview
  if (newsImage && newsImagePreview) {
    newsImage.addEventListener("change", function (e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
          newsImagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        };
        reader.readAsDataURL(file);
      } else {
        newsImagePreview.innerHTML = "<span>No image selected</span>";
      }
    });
  }

  // Reset News Form
  if (resetNewsForm && !resetNewsForm.hasAttribute("data-initialized")) {
    resetNewsForm.setAttribute("data-initialized", "true");
    resetNewsForm.addEventListener("click", resetNewsFormToAddMode);
  }

  // Cancel News Edit
  if (cancelNewsEdit && !cancelNewsEdit.hasAttribute("data-initialized")) {
    cancelNewsEdit.setAttribute("data-initialized", "true");
    cancelNewsEdit.addEventListener("click", resetNewsFormToAddMode);
  }

  // Events Form - UPDATED FOR MONGODB _id
  const eventsForm = document.getElementById("eventsForm");
  const eventImage = document.getElementById("eventImage");
  const eventImagePreview = document.getElementById("eventImagePreview");
  const resetEventForm = document.getElementById("resetEventForm");
  const eventIdInput = document.getElementById("eventId");
  const cancelEventEdit = document.getElementById("cancelEventEdit");

  if (eventsForm && !eventsForm.hasAttribute("data-initialized")) {
    eventsForm.setAttribute("data-initialized", "true");

    // Set default date to today
    document.getElementById("eventDate").valueAsDate = new Date();

    eventsForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      // CHANGED: Use string ID instead of parseInt for MongoDB _id
      const id = eventIdInput.value ? eventIdInput.value : null;
      const title = document.getElementById("eventTitle").value;
      const category = document.getElementById("eventCategory").value;
      const description = document.getElementById("eventDescription").value;
      const date = document.getElementById("eventDate").value;
      const time = document.getElementById("eventTime").value;
      const location = document.getElementById("eventLocation").value;
      const organizer = document.getElementById("eventOrganizer").value;
      const imageFile = eventImage.files[0];

      const eventData = {
        title,
        category,
        description,
        date,
        time,
        location,
        organizer,
        image: imageFile,
      };

      try {
        if (id) {
          // CHANGED: Use string ID for MongoDB
          await apiService.updateEvent(id, eventData);
          SweetPopup.success("Event updated successfully!");
        } else {
          await apiService.addEvent(eventData);
          SweetPopup.success("Event added successfully!");
        }

        await loadEventsList();
        resetEventFormToAddMode();
      } catch (error) {
        SweetPopup.error("Error saving event: " + error.message);
      }
    });
  }

  // Event Image Preview
  if (eventImage && eventImagePreview) {
    eventImage.addEventListener("change", function (e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
          eventImagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        };
        reader.readAsDataURL(file);
      } else {
        eventImagePreview.innerHTML = "<span>No image selected</span>";
      }
    });
  }

  // Reset Event Form
  if (resetEventForm && !resetEventForm.hasAttribute("data-initialized")) {
    resetEventForm.setAttribute("data-initialized", "true");
    resetEventForm.addEventListener("click", resetEventFormToAddMode);
  }

  // Cancel Event Edit
  if (cancelEventEdit && !cancelEventEdit.hasAttribute("data-initialized")) {
    cancelEventEdit.setAttribute("data-initialized", "true");
    cancelEventEdit.addEventListener("click", resetEventFormToAddMode);
  }
}

// Initialize Password Form
function initializePasswordForm() {
  const passwordForm = document.getElementById("passwordForm");
  const resetPasswordForm = document.getElementById("resetPasswordForm");

  if (passwordForm && !passwordForm.hasAttribute("data-initialized")) {
    passwordForm.setAttribute("data-initialized", "true");
    passwordForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const currentPassword = document.getElementById("currentPassword").value;
      const newPassword = document.getElementById("newPassword").value;
      const confirmPassword = document.getElementById("confirmPassword").value;

      // Validate password
      if (newPassword.length < 8) {
        SweetPopup.warning("Password must be at least 8 characters long");
        return;
      }

      if (newPassword !== confirmPassword) {
        SweetPopup.warning("New passwords do not match");
        return;
      }

      const passwordData = {
        currentPassword,
        newPassword,
      };

      try {
        await apiService.changePassword(passwordData);
        SweetPopup.success("Password changed successfully!");
        passwordForm.reset();
      } catch (error) {
        SweetPopup.error("Error changing password: " + error.message);
      }
    });
  }

  if (
    resetPasswordForm &&
    !resetPasswordForm.hasAttribute("data-initialized")
  ) {
    resetPasswordForm.setAttribute("data-initialized", "true");
    resetPasswordForm.addEventListener("click", function () {
      passwordForm.reset();
    });
  }
}

// Load governor to the website
async function loadGovernor() {
  const governorContainer = document.getElementById("governorContainer");
  if (!governorContainer) return;

  try {
    const governorData = await apiService.getGovernor();

    if (governorData && governorData.name) {
      const imageUrl = governorData.image
        ? governorData.image.startsWith("http")
          ? governorData.image
          : CONFIG.apiBaseUrl + governorData.image
        : "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80";

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
    governorContainer.innerHTML = "<p>Error loading governor information.</p>";
    console.error("Error loading governor:", error);
  }
}

// Load governor data to admin panel
async function loadGovernorData() {
  try {
    const governorData = await apiService.getGovernor();

    if (governorData && governorData.name) {
      document.getElementById("governorName").value = governorData.name;

      // Update image preview
      const governorImagePreview = document.getElementById(
        "governorImagePreview"
      );
      if (governorImagePreview) {
        const imageUrl = governorData.image
          ? governorData.image.startsWith("http")
            ? governorData.image
            : CONFIG.apiBaseUrl + governorData.image
          : "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80";
        governorImagePreview.innerHTML = `<img src="${imageUrl}" alt="Preview">`;
      }
    }
  } catch (error) {
    console.error("Error loading governor data:", error);
  }
}

// Load video to the website
async function loadVideo() {
  const videoContainer = document.getElementById("videoContainer");
  if (!videoContainer) return;

  try {
    const videoData = await apiService.getVideo();

    if (videoData && videoData.video) {
      const videoUrl = videoData.video.startsWith("http")
        ? videoData.video
        : CONFIG.apiBaseUrl + videoData.video;

      videoContainer.innerHTML = `
                <video controls>
                    <source src="${videoUrl}" type="video/mp4">
                    Your browser does not support the video tag.
                </video>
                <div class="video-info">
                    <h3 class="video-title">${
                      videoData.title || "Ugwunagbo in Pictures"
                    }</h3>
                    <p>${
                      videoData.description ||
                      "A visual journey through our communities and culture"
                    }</p>
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
    videoContainer.innerHTML = "<p>Error loading video.</p>";
    console.error("Error loading video:", error);
  }
}

// Load video data to admin panel
async function loadVideoData() {
  try {
    const videoData = await apiService.getVideo();

    if (videoData) {
      document.getElementById("videoTitle").value = videoData.title || "";
      document.getElementById("videoDescription").value =
        videoData.description || "";

      // Display current video
      const currentVideoContainer = document.getElementById(
        "currentVideoContainer"
      );
      if (currentVideoContainer && videoData.video) {
        const videoUrl = videoData.video.startsWith("http")
          ? videoData.video
          : CONFIG.apiBaseUrl + videoData.video;
        currentVideoContainer.innerHTML = `
                    <p><strong>Current Video:</strong> ${
                      videoData.title || "Untitled"
                    }</p>
                    <video controls width="300">
                        <source src="${videoUrl}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>
                `;
      }
    }
  } catch (error) {
    console.error("Error loading video data:", error);
  }
}

// Load villages to admin panel - UPDATED FOR MONGODB _id
async function loadVillagesList() {
  const villagesListContainer = document.getElementById(
    "villagesListContainer"
  );
  if (!villagesListContainer) {
    console.error("Villages list container not found!");
    return;
  }

  console.log("Loading villages list...");
  villagesListContainer.innerHTML = "<p>Loading villages...</p>";

  try {
    const villagesData = await apiService.getVillages();
    console.log("Loaded villages data:", villagesData);

    villagesListContainer.innerHTML = "";

    if (villagesData.length === 0) {
      villagesListContainer.innerHTML = "<p>No villages added yet.</p>";
      return;
    }

    villagesData.forEach((village) => {
      const villageItem = document.createElement("div");
      villageItem.className = "village-item-admin";
      // CHANGED: Use _id instead of id
      villageItem.setAttribute("data-village-id", village._id || village.id);
      villageItem.innerHTML = `
                <div>
                    <h4>${village.name}</h4>
                    <p>${village.description || "No description"}</p>
                </div>
                <div class="item-actions">
                    <!-- CHANGED: Use _id instead of id -->
                    <button class="delete-btn" data-id="${
                      village._id || village.id
                    }">Delete</button>
                </div>
            `;
      villagesListContainer.appendChild(villageItem);
    });

    // Use event delegation to prevent duplicate listeners
    villagesListContainer.addEventListener("click", (e) => {
      if (e.target.classList.contains("delete-btn")) {
        // CHANGED: Get string ID directly, no parseInt needed
        const villageId = e.target.getAttribute("data-id");
        console.log("Delete button clicked for village ID:", villageId);
        if (villageId) {
          deleteVillage(villageId);
        } else {
          SweetPopup.error("Invalid village ID");
        }
      }
    });

    console.log(
      "Villages list loaded successfully with",
      villagesData.length,
      "items"
    );
  } catch (error) {
    console.error("Error loading villages list:", error);
    villagesListContainer.innerHTML =
      "<p>Error loading villages. Please try again.</p>";
  }
}

// Delete village - UPDATED FOR MONGODB _id
async function deleteVillage(id) {
  console.log("🔄 Starting delete process for village ID:", id);

  SweetPopup.confirm(
    "Are you sure you want to delete this village?",
    "Confirm Deletion",
    async () => {
      try {
        console.log("🗑️ Confirmed deletion for village ID:", id);

        // CHANGED: Use string ID directly
        const response = await fetch(`/api/villages/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });

        console.log("📡 Delete response status:", response.status);

        const result = await response.json();
        console.log("📡 Delete response data:", result);

        if (!response.ok) {
          throw new Error(result.error || `Server returned ${response.status}`);
        }

        if (result.success) {
          console.log("✅ Village deletion successful");
          SweetPopup.success("Village deleted successfully!");

          // Refresh the villages list
          await loadVillagesList();
        } else {
          throw new Error(result.error || "Failed to delete village");
        }
      } catch (error) {
        console.error("❌ Error deleting village:", error);
        SweetPopup.error("Error deleting village: " + error.message);
      }
    },
    () => {
      console.log("❌ Village deletion cancelled by user");
    }
  );
}

// Load leaders to the website
// Load leaders to the website - SORTED BY POSITION
async function loadLeaders() {
    const leadershipContainer = document.getElementById("leadershipContainer");
    if (!leadershipContainer) return;

    leadershipContainer.innerHTML = "<p>Loading leaders...</p>";

    try {
        const leadersData = await apiService.getLeaders();

        leadershipContainer.innerHTML = "";

        if (leadersData.length === 0) {
            leadershipContainer.innerHTML =
                "<p>No leadership information available.</p>";
            return;
        }

        // Sort leaders by position (1-Executive Chairman, 2-Deputy Chairman, 3-Secretary, 4-Other)
        const sortedLeaders = leadersData.sort((a, b) => {
            // Extract position index from position string (e.g., "1-Executive Chairman" -> 1)
            const getPositionIndex = (position) => {
                if (!position) return 999; // Put undefined positions last
                const match = position.match(/^(\d+)-/);
                return match ? parseInt(match[1]) : 999;
            };
            
            return getPositionIndex(a.position) - getPositionIndex(b.position);
        });

        // Only show the first 3 positions (Chairman, Deputy, Secretary)
        const displayLeaders = sortedLeaders.slice(0, 3);

        displayLeaders.forEach((leader) => {
            const leaderCard = document.createElement("div");
            leaderCard.className = "leader-card";

            // Extract display position (remove the index prefix)
            const displayPosition = leader.position 
                ? leader.position.replace(/^\d+-/, '') 
                : leader.position || 'Leader';

            let socialMediaHTML = "";
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
                socialMediaHTML += "</div>";
            }

            const imageUrl = leader.image
                ? leader.image.startsWith("http")
                    ? leader.image
                    : CONFIG.apiBaseUrl + leader.image
                : "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80";

            leaderCard.innerHTML = `
                <div class="leader-image">
                    <img src="${imageUrl}" alt="${leader.name}">
                </div>
                <div class="leader-content">
                    <h3>${leader.name}</h3>
                    <span class="leader-position">${displayPosition}</span>
                    <p class="leader-bio">${leader.bio}</p>
                    <div class="leader-contact">
                        ${
                            leader.email
                                ? `<a href="mailto:${leader.email}"><i class="fas fa-envelope"></i></a>`
                                : ""
                        }
                        ${
                            leader.phone
                                ? `<a href="tel:${leader.phone}"><i class="fas fa-phone"></i></a>`
                                : ""
                        }
                    </div>
                    ${socialMediaHTML}
                </div>
            `;
            leadershipContainer.appendChild(leaderCard);
        });

        // Show message if less than 3 leaders
        if (displayLeaders.length < 3) {
            const message = document.createElement("p");
            message.style.textAlign = "center";
            message.style.marginTop = "20px";
            message.style.color = "#666";
            message.innerHTML = `<i class="fas fa-info-circle"></i> Add more leaders through the admin dashboard`;
            leadershipContainer.appendChild(message);
        }
    } catch (error) {
        leadershipContainer.innerHTML =
            "<p>Error loading leaders. Please try again later.</p>";
        console.error("Error loading leaders:", error);
    }
}



// Load leaders to admin panel - UPDATED FOR MONGODB _id
// Load leaders to admin panel - SORTED BY POSITION
async function loadLeaderList() {
    const leaderListContainer = document.getElementById("leaderListContainer");
    if (!leaderListContainer) return;

    leaderListContainer.innerHTML = "<p>Loading...</p>";

    try {
        const leadersData = await apiService.getLeaders();

        leaderListContainer.innerHTML = "";

        if (leadersData.length === 0) {
            leaderListContainer.innerHTML = "<p>No leaders added yet.</p>";
            return;
        }

        // Sort leaders by position
        const sortedLeaders = leadersData.sort((a, b) => {
            const getPositionIndex = (position) => {
                if (!position) return 999;
                const match = position.match(/^(\d+)-/);
                return match ? parseInt(match[1]) : 999;
            };
            return getPositionIndex(a.position) - getPositionIndex(b.position);
        });

        sortedLeaders.forEach((leader) => {
            const displayPosition = leader.position 
                ? leader.position.replace(/^\d+-/, '') 
                : leader.position || 'Leader';
                
            const positionBadge = leader.position && leader.position.match(/^(\d+)-/)
                ? `<span style="background: var(--primary); color: white; padding: 2px 8px; border-radius: 10px; font-size: 12px; margin-left: 10px;">Position ${leader.position.match(/^(\d+)-/)[1]}</span>`
                : '';

            const leaderItem = document.createElement("div");
            leaderItem.className = "leader-item";
            leaderItem.innerHTML = `
                <div>
                    <h4>${leader.name} ${positionBadge}</h4>
                    <p>${displayPosition}</p>
                </div>
                <div class="item-actions">
                    <button class="edit-btn" data-id="${leader._id || leader.id}">Edit</button>
                    <button class="delete-btn" data-id="${leader._id || leader.id}">Delete</button>
                </div>
            `;
            leaderListContainer.appendChild(leaderItem);
        });

        // Use event delegation
        leaderListContainer.addEventListener("click", (e) => {
            if (e.target.classList.contains("edit-btn")) {
                const leaderId = e.target.getAttribute("data-id");
                editLeader(leaderId);
            }

            if (e.target.classList.contains("delete-btn")) {
                const leaderId = e.target.getAttribute("data-id");
                deleteLeader(leaderId);
            }
        });
    } catch (error) {
        leaderListContainer.innerHTML = "<p>Error loading leaders.</p>";
        console.error("Error loading leader list:", error);
    }
}



// Load news to the website
// Load news to the website - FIXED VERSION
async function loadNews() {
  const newsContainer = document.getElementById("newsContainer");
  if (!newsContainer) return;

  newsContainer.innerHTML = "<p>Loading news...</p>";

  try {
    const newsData = await apiService.getNews();
    console.log("📰 Loaded news from API:", newsData);

    newsContainer.innerHTML = "";

    if (newsData.length === 0) {
      newsContainer.innerHTML = "<p>No news available at this time.</p>";
      return;
    }

    newsData.forEach((newsItem) => {
      const newsCard = document.createElement("div");
      newsCard.className = "news-card";

      const imageUrl = newsItem.image
        ? newsItem.image.startsWith("http")
          ? newsItem.image
          : CONFIG.apiBaseUrl + newsItem.image
        : "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80";

      // Truncate content for preview
      const previewContent =
        newsItem.content.length > 150
          ? newsItem.content.substring(0, 150) + "..."
          : newsItem.content;

      // Use the correct ID - try _id first, then id
      const newsId = newsItem._id || newsItem.id;
      console.log(`Creating news card for: ${newsItem.title} (ID: ${newsId})`);

      newsCard.innerHTML = `
    <div class="news-image">
        <img src="${imageUrl}" alt="${newsItem.title}">
    </div>
    <div class="news-content">
        <div class="news-date">${formatDate(newsItem.date)}</div>
        <h3>${newsItem.title}</h3>
        <p>${previewContent}</p>
        <a href="full-news.html?id=${
          newsItem._id || newsItem.id
        }" class="read-more-btn">
            Read More <i class="fas fa-arrow-right"></i>
        </a>
    </div>
`;
      newsContainer.appendChild(newsCard);
    });
  } catch (error) {
    newsContainer.innerHTML =
      "<p>Error loading news. Please try again later.</p>";
    console.error("Error loading news:", error);
  }
}

// Navigate to full news page
function navigateToFullNews(newsId) {
  window.location.href = `news-details.html?id=${newsId}`;
}

// Load news to admin panel - UPDATED FOR MONGODB _id
async function loadNewsList() {
  const newsListContainer = document.getElementById("newsListContainer");
  if (!newsListContainer) return;

  newsListContainer.innerHTML = "<p>Loading...</p>";

  try {
    const newsData = await apiService.getNews();

    newsListContainer.innerHTML = "";

    if (newsData.length === 0) {
      newsListContainer.innerHTML = "<p>No news added yet.</p>";
      return;
    }

    newsData.forEach((newsItem) => {
      const newsListItem = document.createElement("div");
      newsListItem.className = "news-item";
      newsListItem.innerHTML = `
                <div>
                    <h4>${newsItem.title}</h4>
                    <p>${formatDate(newsItem.date)}</p>
                </div>
                <div class="item-actions">
                    <!-- CHANGED: Use _id instead of id -->
                    <button class="edit-btn" data-id="${
                      newsItem._id || newsItem.id
                    }">Edit</button>
                    <button class="delete-btn" data-id="${
                      newsItem._id || newsItem.id
                    }">Delete</button>
                </div>
            `;
      newsListContainer.appendChild(newsListItem);
    });

    // Use event delegation instead of multiple event listeners
    newsListContainer.addEventListener("click", (e) => {
      if (e.target.classList.contains("edit-btn")) {
        // CHANGED: Get string ID directly, no parseInt needed
        const newsId = e.target.getAttribute("data-id");
        editNews(newsId);
      }

      if (e.target.classList.contains("delete-btn")) {
        // CHANGED: Get string ID directly, no parseInt needed
        const newsId = e.target.getAttribute("data-id");
        deleteNews(newsId);
      }
    });
  } catch (error) {
    newsListContainer.innerHTML = "<p>Error loading news.</p>";
    console.error("Error loading news list:", error);
  }
}

// Load events to admin panel - UPDATED FOR MONGODB _id
async function loadEventsList() {
  const eventsListContainer = document.getElementById("eventsListContainer");
  if (!eventsListContainer) return;

  eventsListContainer.innerHTML = "<p>Loading...</p>";

  try {
    const eventsData = await apiService.getEvents();

    eventsListContainer.innerHTML = "";

    if (eventsData.length === 0) {
      eventsListContainer.innerHTML = "<p>No events added yet.</p>";
      return;
    }

    eventsData.forEach((event) => {
      const eventItem = document.createElement("div");
      eventItem.className = "event-item";
      eventItem.innerHTML = `
                <div>
                    <h4>${event.title}</h4>
                    <p><strong>Date:</strong> ${formatDate(event.date)} ${
        event.time ? "at " + event.time : ""
      }</p>
                    <p><strong>Category:</strong> ${event.category}</p>
                    <p><strong>Location:</strong> ${event.location}</p>
                </div>
                <div class="item-actions">
                    <!-- CHANGED: Use _id instead of id -->
                    <button class="edit-btn" data-id="${
                      event._id || event.id
                    }">Edit</button>
                    <button class="delete-btn" data-id="${
                      event._id || event.id
                    }">Delete</button>
                </div>
            `;
      eventsListContainer.appendChild(eventItem);
    });

    // Use event delegation for event actions
    eventsListContainer.addEventListener("click", (e) => {
      if (e.target.classList.contains("edit-btn")) {
        // CHANGED: Get string ID directly, no parseInt needed
        const eventId = e.target.getAttribute("data-id");
        editEvent(eventId);
      }

      if (e.target.classList.contains("delete-btn")) {
        // CHANGED: Get string ID directly, no parseInt needed
        const eventId = e.target.getAttribute("data-id");
        deleteEvent(eventId);
      }
    });
  } catch (error) {
    eventsListContainer.innerHTML = "<p>Error loading events.</p>";
    console.error("Error loading events list:", error);
  }
}

// Load contact requests to admin panel
async function loadContactRequests() {
  const contactRequestsContainer = document.getElementById(
    "contactRequestsContainer"
  );
  if (!contactRequestsContainer) return;

  contactRequestsContainer.innerHTML = "<p>Loading...</p>";

  try {
    const contactsData = await apiService.getContacts();

    contactRequestsContainer.innerHTML = "";

    if (contactsData.length === 0) {
      contactRequestsContainer.innerHTML = "<p>No contact requests yet.</p>";
      return;
    }

    contactsData.forEach((request) => {
      const requestElement = document.createElement("div");
      requestElement.className = "contact-request";
      requestElement.innerHTML = `
                <div class="contact-request-header">
                    <div class="contact-request-name">${request.name}</div>
                    <div class="contact-request-date">${formatDate(
                      request.date
                    )}</div>
                </div>
                <div class="contact-request-subject">${request.subject}</div>
                <div class="contact-request-message">${request.message}</div>
                <div class="contact-request-email">${request.email}</div>
            `;
      contactRequestsContainer.appendChild(requestElement);
    });
  } catch (error) {
    contactRequestsContainer.innerHTML =
      "<p>Error loading contact requests.</p>";
    console.error("Error loading contact requests:", error);
  }
}

// Load support requests to admin panel - UPDATED FOR MONGODB _id
async function loadSupportRequests() {
  const supportRequestsContainer = document.getElementById(
    "supportRequestsContainer"
  );
  if (!supportRequestsContainer) return;

  supportRequestsContainer.innerHTML = "<p>Loading support requests...</p>";

  try {
    const supportData = await apiService.getSupportRequests();

    supportRequestsContainer.innerHTML = "";

    if (supportData.length === 0) {
      supportRequestsContainer.innerHTML = "<p>No support requests yet.</p>";
      updateSupportStats(0, 0, 0);
      return;
    }

    // Calculate stats
    const total = supportData.length;
    const pending = supportData.filter(
      (req) => req.status === "pending"
    ).length;
    const resolved = supportData.filter(
      (req) => req.status === "resolved"
    ).length;

    updateSupportStats(total, pending, resolved);

    // Display support requests
    supportData.forEach((request) => {
      const requestElement = document.createElement("div");
      requestElement.className = "support-item";
      requestElement.innerHTML = `
                <div class="support-header">
                    <div class="support-name">${request.fullName}</div>
                    <div class="support-meta">
                        <span class="support-type">${request.issueType}</span>
                        <span class="support-priority priority-${request.priority.toLowerCase()}">${
        request.priority
      }</span>
                        <span class="support-status status-${request.status}">${
        request.status
      }</span>
                        <span>${formatDate(request.date)}</span>
                    </div>
                </div>
                <div class="support-subject">${request.subject}</div>
                <div class="support-description">${request.description}</div>
                ${
                  request.suggestions
                    ? `<div class="support-suggestions"><strong>Suggestions:</strong> ${request.suggestions}</div>`
                    : ""
                }
                <div class="support-contact">
                    <span><strong>Email:</strong> ${request.email}</span>
                    ${
                      request.phone
                        ? `<span><strong>Phone:</strong> ${request.phone}</span>`
                        : ""
                    }
                    <span><strong>Village:</strong> ${request.village}</span>
                </div>
                <div class="support-actions">
                    ${
                      request.status === "pending"
                        ? // CHANGED: Use _id instead of id
                          `<button class="btn btn-success resolve-btn" data-id="${
                            request._id || request.id
                          }">Mark Resolved</button>`
                        : `<button class="btn btn-warning pending-btn" data-id="${
                            request._id || request.id
                          }">Mark Pending</button>`
                    }
                    <button class="btn btn-danger delete-support-btn" data-id="${
                      request._id || request.id
                    }">Delete</button>
                </div>
            `;
      supportRequestsContainer.appendChild(requestElement);
    });

    // Use event delegation for support actions
    supportRequestsContainer.addEventListener("click", async (e) => {
      if (e.target.classList.contains("resolve-btn")) {
        // CHANGED: Get string ID directly, no parseInt needed
        const requestId = e.target.getAttribute("data-id");
        await updateSupportRequestStatus(requestId, "resolved");
      }

      if (e.target.classList.contains("pending-btn")) {
        // CHANGED: Get string ID directly, no parseInt needed
        const requestId = e.target.getAttribute("data-id");
        await updateSupportRequestStatus(requestId, "pending");
      }

      if (e.target.classList.contains("delete-support-btn")) {
        // CHANGED: Get string ID directly, no parseInt needed
        const requestId = e.target.getAttribute("data-id");
        await deleteSupportRequest(requestId);
      }
    });
  } catch (error) {
    supportRequestsContainer.innerHTML =
      "<p>Error loading support requests.</p>";
    console.error("Error loading support requests:", error);
  }
}

// Edit leader - UPDATED FOR MONGODB _id
// Edit leader - handle position dropdown
async function editLeader(id) {
    try {
        const leadersData = await apiService.getLeaders();
        const leader = leadersData.find((l) => (l._id || l.id) === id);
        if (!leader) return;

        document.getElementById("leaderName").value = leader.name;
        
        // Set position dropdown
        const positionSelect = document.getElementById("leaderPosition");
        if (positionSelect) {
            positionSelect.value = leader.position || "";
        }
        
        document.getElementById("leaderBio").value = leader.bio;
        document.getElementById("leaderEmail").value = leader.email || "";
        document.getElementById("leaderPhone").value = leader.phone || "";
        document.getElementById("leaderTwitter").value = leader.twitter || "";
        document.getElementById("leaderFacebook").value = leader.facebook || "";
        document.getElementById("leaderLinkedin").value = leader.linkedin || "";
        document.getElementById("leaderId").value = leader._id || leader.id;

        // Update image preview
        const leaderImagePreview = document.getElementById("leaderImagePreview");
        if (leaderImagePreview) {
            const imageUrl = leader.image
                ? leader.image.startsWith("http")
                    ? leader.image
                    : CONFIG.apiBaseUrl + leader.image
                : "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80";
            leaderImagePreview.innerHTML = `<img src="${imageUrl}" alt="Preview">`;
        }

        // Update form title and button
        document.getElementById("leaderFormTitle").textContent = "Edit Leader";
        document.getElementById("leaderSubmitBtn").textContent = "Update Leader";
        document.getElementById("cancelEdit").style.display = "inline-block";
    } catch (error) {
        SweetPopup.error("Error loading leader data: " + error.message);
    }
}
// Delete leader - UPDATED FOR MONGODB _id
async function deleteLeader(id) {
  SweetPopup.confirm(
    "Are you sure you want to delete this leader?",
    "Confirm Deletion",
    async () => {
      try {
        // CHANGED: Use string ID directly
        await apiService.deleteLeader(id);
        await loadLeaders();
        await loadLeaderList();
        SweetPopup.success("Leader deleted successfully!");
      } catch (error) {
        SweetPopup.error("Error deleting leader: " + error.message);
      }
    }
  );
}

// Edit news - UPDATED FOR MONGODB _id
async function editNews(id) {
  try {
    const newsData = await apiService.getNews();
    // CHANGED: Use _id instead of id for comparison
    const newsItem = newsData.find((n) => (n._id || n.id) === id);
    if (!newsItem) return;

    document.getElementById("newsTitle").value = newsItem.title;
    document.getElementById("newsContent").value = newsItem.content;
    document.getElementById("newsDate").value = newsItem.date;
    // CHANGED: Store string ID directly
    document.getElementById("newsId").value = newsItem._id || newsItem.id;

    // Update image preview
    const newsImagePreview = document.getElementById("newsImagePreview");
    if (newsImagePreview) {
      const imageUrl = newsItem.image
        ? newsItem.image.startsWith("http")
          ? newsItem.image
          : CONFIG.apiBaseUrl + newsItem.image
        : "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80";
      newsImagePreview.innerHTML = `<img src="${imageUrl}" alt="Preview">`;
    }

    // Update form title and button
    document.getElementById("newsFormTitle").textContent = "Edit News Article";
    document.getElementById("newsSubmitBtn").textContent = "Update News";
    document.getElementById("cancelNewsEdit").style.display = "inline-block";
  } catch (error) {
    SweetPopup.error("Error loading news data: " + error.message);
  }
}

// Delete news - UPDATED FOR MONGODB _id
async function deleteNews(id) {
  SweetPopup.confirm(
    "Are you sure you want to delete this news article?",
    "Confirm Deletion",
    async () => {
      try {
        // CHANGED: Use string ID directly
        await apiService.deleteNews(id);
        await loadNews();
        await loadNewsList();
        SweetPopup.success("News deleted successfully!");
      } catch (error) {
        SweetPopup.error("Error deleting news: " + error.message);
      }
    }
  );
}

// Edit event - UPDATED FOR MONGODB _id
async function editEvent(id) {
  try {
    const eventsData = await apiService.getEvents();
    // CHANGED: Use _id instead of id for comparison
    const event = eventsData.find((e) => (e._id || e.id) === id);
    if (!event) return;

    document.getElementById("eventTitle").value = event.title;
    document.getElementById("eventCategory").value = event.category;
    document.getElementById("eventDescription").value = event.description;
    document.getElementById("eventDate").value = event.date;
    document.getElementById("eventTime").value = event.time || "";
    document.getElementById("eventLocation").value = event.location;
    document.getElementById("eventOrganizer").value = event.organizer || "";
    // CHANGED: Store string ID directly
    document.getElementById("eventId").value = event._id || event.id;

    // Update image preview
    const eventImagePreview = document.getElementById("eventImagePreview");
    if (eventImagePreview && event.image) {
      const imageUrl = event.image.startsWith("http")
        ? event.image
        : CONFIG.apiBaseUrl + event.image;
      eventImagePreview.innerHTML = `<img src="${imageUrl}" alt="Preview">`;
    }

    // Update form title and button
    document.getElementById("eventsFormTitle").textContent = "Edit Event";
    document.getElementById("eventSubmitBtn").textContent = "Update Event";
    document.getElementById("cancelEventEdit").style.display = "inline-block";
  } catch (error) {
    SweetPopup.error("Error loading event data: " + error.message);
  }
}

// Delete event - UPDATED FOR MONGODB _id
async function deleteEvent(id) {
  SweetPopup.confirm(
    "Are you sure you want to delete this event?",
    "Confirm Deletion",
    async () => {
      try {
        // CHANGED: Use string ID directly
        await apiService.deleteEvent(id);
        await loadEventsList();
        SweetPopup.success("Event deleted successfully!");
      } catch (error) {
        SweetPopup.error("Error deleting event: " + error.message);
      }
    }
  );
}

// Update support request status - UPDATED FOR MONGODB _id
async function updateSupportRequestStatus(id, status) {
  try {
    // CHANGED: Use string ID directly
    await apiService.updateSupportStatus(id, status);
    await loadSupportRequests();
    SweetPopup.success(`Support request marked as ${status} successfully!`);
  } catch (error) {
    SweetPopup.error("Error updating support request: " + error.message);
  }
}

// Delete support request - UPDATED FOR MONGODB _id
async function deleteSupportRequest(id) {
  SweetPopup.confirm(
    "Are you sure you want to delete this support request?",
    "Confirm Deletion",
    async () => {
      try {
        // CHANGED: Use string ID directly
        await apiService.deleteSupportRequest(id);
        await loadSupportRequests();
        SweetPopup.success("Support request deleted successfully!");
      } catch (error) {
        SweetPopup.error("Error deleting support request: " + error.message);
      }
    }
  );
}

// Reset leader form to add mode
function resetLeaderFormToAddMode() {
  const leaderForm = document.getElementById("leaderForm");
  if (leaderForm) {
    leaderForm.reset();
    // Clear file input specifically
    document.getElementById("leaderImage").value = "";
  }
  document.getElementById("leaderId").value = "";
  const leaderImagePreview = document.getElementById("leaderImagePreview");
  if (leaderImagePreview)
    leaderImagePreview.innerHTML = "<span>No image selected</span>";
  document.getElementById("leaderFormTitle").textContent = "Add New Leader";
  document.getElementById("leaderSubmitBtn").textContent = "Add Leader";
  document.getElementById("cancelEdit").style.display = "none";
}

// Reset news form to add mode
function resetNewsFormToAddMode() {
  const newsForm = document.getElementById("newsForm");
  if (newsForm) {
    newsForm.reset();
    // Clear file input specifically
    document.getElementById("newsImage").value = "";
  }
  document.getElementById("newsId").value = "";
  const newsImagePreview = document.getElementById("newsImagePreview");
  if (newsImagePreview)
    newsImagePreview.innerHTML = "<span>No image selected</span>";
  document.getElementById("newsFormTitle").textContent = "Add News Article";
  document.getElementById("newsSubmitBtn").textContent = "Add News";
  document.getElementById("cancelNewsEdit").style.display = "none";
  document.getElementById("newsDate").valueAsDate = new Date();
}

// Reset event form to add mode
function resetEventFormToAddMode() {
  const eventsForm = document.getElementById("eventsForm");
  if (eventsForm) {
    eventsForm.reset();
    document.getElementById("eventImage").value = "";
  }
  document.getElementById("eventId").value = "";
  const eventImagePreview = document.getElementById("eventImagePreview");
  if (eventImagePreview)
    eventImagePreview.innerHTML = "<span>No image selected</span>";
  document.getElementById("eventsFormTitle").textContent = "Add New Event";
  document.getElementById("eventSubmitBtn").textContent = "Add Event";
  document.getElementById("cancelEventEdit").style.display = "none";
  document.getElementById("eventDate").valueAsDate = new Date();
}

// Update support statistics
function updateSupportStats(total, pending, resolved) {
  const totalElement = document.getElementById("totalRequests");
  const pendingElement = document.getElementById("pendingRequests");
  const resolvedElement = document.getElementById("resolvedRequests");

  if (totalElement) totalElement.textContent = total;
  if (pendingElement) pendingElement.textContent = pending;
  if (resolvedElement) resolvedElement.textContent = resolved;
}

// Initialize support management
function initializeSupportManagement() {
  const refreshSupport = document.getElementById("refreshSupport");
  const clearSupport = document.getElementById("clearSupport");
  const supportFilter = document.getElementById("supportFilter");

  if (refreshSupport && !refreshSupport.hasAttribute("data-initialized")) {
    refreshSupport.setAttribute("data-initialized", "true");
    refreshSupport.addEventListener("click", async () => {
      await loadSupportRequests();
    });
  }

  if (clearSupport && !clearSupport.hasAttribute("data-initialized")) {
    clearSupport.setAttribute("data-initialized", "true");
    clearSupport.addEventListener("click", async () => {
      SweetPopup.confirm(
        "Are you sure you want to clear all support requests? This action cannot be undone.",
        "Clear All Support Requests",
        () => {
          SweetPopup.info("Clear all functionality would be implemented here");
        }
      );
    });
  }

  if (supportFilter && !supportFilter.hasAttribute("data-initialized")) {
    supportFilter.setAttribute("data-initialized", "true");
    supportFilter.addEventListener("change", (e) => {
      // Filter functionality can be implemented here
      console.log("Filter changed to:", e.target.value);
    });
  }
}

// Initialize support form
function initializeSupportForm() {
  const supportForm = document.getElementById("supportForm");
  if (!supportForm) return;

  supportForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = new FormData(supportForm);
    const supportData = {
      fullName: formData.get("fullName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      village: formData.get("village"),
      issueType: formData.get("issueType"),
      priority: formData.get("priority"),
      subject: formData.get("subject"),
      description: formData.get("description"),
      suggestions: formData.get("suggestions"),
      date: new Date().toISOString().split("T")[0],
    };

    try {
      await apiService.addSupportRequest(supportData);
      SweetPopup.success(
        "Support request submitted successfully! We will get back to you soon."
      );
      supportForm.reset();
    } catch (error) {
      SweetPopup.error("Error submitting support request: " + error.message);
    }
  });
}

// Load events to the events page
async function loadEvents() {
  const eventsContainer = document.getElementById("eventsContainer");
  if (!eventsContainer) return;

  eventsContainer.innerHTML = "<p>Loading events...</p>";

  try {
    const eventsData = await apiService.getEvents();

    eventsContainer.innerHTML = "";

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

    eventsData.forEach((event) => {
      const eventCard = document.createElement("div");
      eventCard.className = "event-card";
      eventCard.setAttribute("data-category", event.category);

      const imageUrl = event.image
        ? event.image.startsWith("http")
          ? event.image
          : CONFIG.apiBaseUrl + event.image
        : "https://images.unsplash.com/photo-1511578314322-379afb476865?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80";

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
                            <span>${event.time || "All day"}</span>
                        </div>
                        <div class="event-detail">
                            <i class="fas fa-tag"></i>
                            <span>${event.category}</span>
                        </div>
                    </div>
                    ${
                      event.organizer
                        ? `<div class="event-detail"><i class="fas fa-user"></i><span>Organized by: ${event.organizer}</span></div>`
                        : ""
                    }
                </div>
            `;
      eventsContainer.appendChild(eventCard);
    });
  } catch (error) {
    eventsContainer.innerHTML =
      "<p>Error loading events. Please try again later.</p>";
    console.error("Error loading events:", error);
  }
}

// Format date for display
function formatDate(dateString) {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString("en-US", options);
}

// Initialize website functionality
async function initializeWebsite() {
  console.log("Initializing website functionality...");

  // Mobile Menu Toggle
  const mobileMenuBtn = document.querySelector(".mobile-menu-btn");
  const navLinks = document.querySelector(".nav-links");

  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener("click", function () {
      navLinks.classList.toggle("active");
      this.setAttribute(
        "aria-expanded",
        this.getAttribute("aria-expanded") === "true" ? "false" : "true"
      );
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
    document.addEventListener("click", function (event) {
      if (
        !event.target.closest("nav") &&
        navLinks.classList.contains("active")
      ) {
        navLinks.classList.remove("active");
        mobileMenuBtn.setAttribute("aria-expanded", "false");
      }
    });
  }

  // Initialize service application buttons
  initializeServiceApplicationButtons();

  // Initialize admin mobile tabs
  initializeAdminMobileTabs();

  // Smooth Scrolling for Anchor Links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();

      const targetId = this.getAttribute("href");
      if (targetId === "#") return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 80,
          behavior: "smooth",
        });

        if (navLinks) navLinks.classList.remove("active");
      }
    });
  });

  // Contact Form Submission
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;
      const subject = document.getElementById("subject").value;
      const message = document.getElementById("message").value;

      const contactData = {
        name,
        email,
        subject,
        message,
      };

      try {
        await apiService.addContact(contactData);
        SweetPopup.success(
          "Thank you for your message. We will get back to you soon!"
        );
        this.reset();
      } catch (error) {
        SweetPopup.error("Error submitting message: " + error.message);
      }
    });
  }

  // Initialize support form if on support page
  initializeSupportForm();

  // Initialize hero slider
  initializeHeroSlider();

  // Initialize scroll to top
  initializeScrollToTop();

  // Load initial data
  await loadGovernor();
  await loadLeaders();
  await loadVideo();
  await loadNews();
}

// Hero Slider Functionality
function initializeHeroSlider() {
  console.log("🚀 Initializing hero slider...");

  const slides = document.querySelectorAll(".slide");
  const dots = document.querySelectorAll(".slider-dot");
  const prevBtn = document.querySelector(".prev-slide");
  const nextBtn = document.querySelector(".next-slide");

  console.log(`Found ${slides.length} slides, ${dots.length} dots`);

  if (slides.length === 0) {
    console.error("❌ No slides found!");
    return;
  }

  let currentSlide = 0;
  let slideInterval;

  function showSlide(n) {
    // Remove active class from all slides and dots
    slides.forEach((slide) => slide.classList.remove("active"));
    dots.forEach((dot) => dot.classList.remove("active"));

    // Calculate new slide index
    currentSlide = (n + slides.length) % slides.length;

    // Add active class to current slide and dot
    slides[currentSlide].classList.add("active");
    dots[currentSlide].classList.add("active");

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
  console.log("🎬 Starting slider...");

  // Show first slide
  showSlide(0);

  // Start auto-slide
  startAutoSlide();

  // Add event listeners for navigation buttons
  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      nextSlide();
      stopAutoSlide();
      startAutoSlide();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      prevSlide();
      stopAutoSlide();
      startAutoSlide();
    });
  }

  // Add event listeners for dots
  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const slideIndex = parseInt(dot.getAttribute("data-slide"));
      showSlide(slideIndex);
      stopAutoSlide();
      startAutoSlide();
    });
  });

  // Pause auto-slide on hover
  const hero = document.querySelector(".hero");
  if (hero) {
    hero.addEventListener("mouseenter", stopAutoSlide);
    hero.addEventListener("mouseleave", startAutoSlide);
  }

  // Keyboard navigation
  document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowLeft") {
      prevSlide();
      stopAutoSlide();
      startAutoSlide();
    }
    if (e.key === "ArrowRight") {
      nextSlide();
      stopAutoSlide();
      startAutoSlide();
    }
  });

  console.log("✅ Hero slider initialized successfully");
}

// Scroll to Top Functionality - FIXED VERSION
function initializeScrollToTop() {
  const scrollToTopBtn = document.getElementById("scrollToTop");

  if (!scrollToTopBtn) {
    console.error("Scroll to top button not found!");
    return;
  }

  // Initially hide the button
  scrollToTopBtn.style.display = "none";

  // Add scroll event listener
  window.addEventListener("scroll", () => {
    if (window.pageYOffset > 300) {
      scrollToTopBtn.style.display = "block";
      scrollToTopBtn.classList.add("show");
    } else {
      scrollToTopBtn.style.display = "none";
      scrollToTopBtn.classList.remove("show");
    }
  });

  // Add click event listener
  scrollToTopBtn.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });

  console.log("✅ Scroll to top button initialized");
}

console.log("Website scripts loaded successfully");

// Admin Mobile Tabs Functionality
// Admin Mobile Tabs Functionality - FIXED VERSION
function initializeAdminMobileTabs() {
  console.log("Initializing admin mobile tabs...");

  const adminMobileMenuBtn = document.querySelector(".admin-mobile-menu-btn");
  const adminTabs = document.querySelector(".admin-tabs");
  const adminTabItems = document.querySelectorAll(".admin-tab");
  const currentTabText = document.querySelector(
    ".admin-mobile-menu-btn .current-tab"
  );

  if (adminMobileMenuBtn && adminTabs) {
    console.log("Admin mobile elements found:", {
      button: adminMobileMenuBtn,
      tabs: adminTabs,
      tabItems: adminTabItems.length,
    });

    // Toggle mobile menu
    adminMobileMenuBtn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation(); // Prevent event from bubbling up
      console.log("Mobile menu button clicked");

      const isActive = adminTabs.classList.contains("active");

      if (isActive) {
        adminTabs.classList.remove("active");
        this.classList.remove("active");
        this.setAttribute("aria-expanded", "false");
      } else {
        adminTabs.classList.add("active");
        this.classList.add("active");
        this.setAttribute("aria-expanded", "true");
      }

      console.log("Menu state:", isActive ? "collapsed" : "expanded");
    });

    // Handle tab selection
    adminTabItems.forEach((tab) => {
      tab.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        const tabName = this.getAttribute("data-tab");
        console.log("Tab clicked:", tabName);

        // Update active tab
        adminTabItems.forEach((t) => t.classList.remove("active"));
        this.classList.add("active");

        // Update current tab text in mobile button
        if (currentTabText) {
          currentTabText.textContent = this.textContent;
        }

        // Switch tab content
        switchAdminTab(tabName);

        // Close mobile menu after selection
        adminTabs.classList.remove("active");
        adminMobileMenuBtn.classList.remove("active");
        adminMobileMenuBtn.setAttribute("aria-expanded", "false");

        console.log("Tab switched to:", tabName);
      });
    });

    // Close mobile menu when clicking outside
    document.addEventListener("click", function (event) {
      const isClickInside =
        adminTabs.contains(event.target) ||
        adminMobileMenuBtn.contains(event.target);

      if (!isClickInside && adminTabs.classList.contains("active")) {
        console.log("Click outside - closing menu");
        adminTabs.classList.remove("active");
        adminMobileMenuBtn.classList.remove("active");
        adminMobileMenuBtn.setAttribute("aria-expanded", "false");
      }
    });

    // Close mobile menu on escape key
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && adminTabs.classList.contains("active")) {
        console.log("Escape key - closing menu");
        adminTabs.classList.remove("active");
        adminMobileMenuBtn.classList.remove("active");
        adminMobileMenuBtn.setAttribute("aria-expanded", "false");
      }
    });

    console.log("Admin mobile tabs initialized successfully");
  } else {
    console.log("Admin mobile elements not found - might not be on admin page");
  }
}

// Function to switch admin tabs
function switchAdminTab(tabName) {
  console.log("Switching to tab:", tabName);

  // Hide all tab contents
  const tabContents = document.querySelectorAll(".tab-content");
  tabContents.forEach((content) => {
    content.classList.remove("active");
  });

  // Show selected tab content
  const selectedTab = document.getElementById(tabName + "Tab");
  if (selectedTab) {
    selectedTab.classList.add("active");
    console.log("Tab content shown:", tabName + "Tab");
  } else {
    console.log("Tab content not found:", tabName + "Tab");
  }
}

// Service Applications Management - FIXED VERSION
async function loadServiceApplications() {
  const container = document.getElementById("serviceApplicationsContainer");
  if (!container) {
    console.log("Service applications container not found");
    return;
  }

  container.innerHTML = "<p>Loading service applications...</p>";

  try {
    const applications = await apiService.getServiceApplications();
    console.log("Loaded service applications:", applications);

    container.innerHTML = "";

    if (applications.length === 0) {
      container.innerHTML = "<p>No service applications yet.</p>";
      updateApplicationsStats(0, 0, 0, 0);
      return;
    }

    // Calculate stats
    const total = applications.length;
    const pending = applications.filter(
      (app) => app.status === "pending"
    ).length;
    const approved = applications.filter(
      (app) => app.status === "approved"
    ).length;
    const rejected = applications.filter(
      (app) => app.status === "rejected"
    ).length;

    updateApplicationsStats(total, pending, approved, rejected);

    // Display applications
    applications.forEach((application) => {
      const appElement = document.createElement("div");
      appElement.className = "application-item";
      appElement.innerHTML = `
        <div class="application-header">
          <div class="application-id">${
            application.applicationId || "N/A"
          }</div>
          <div class="application-service">${application.serviceType}</div>
          <div class="application-status status-${application.status}">${
        application.status
      }</div>
          <div class="application-payment status-${
            application.paymentStatus
          }">${application.paymentStatus}</div>
          <div class="application-date">${formatDate(
            application.applicationDate
          )}</div>
        </div>
        
        <div class="application-details">
          <div class="applicant-info">
            <h4>${application.firstName} ${application.lastName}</h4>
            <p><strong>Email:</strong> ${application.email}</p>
            <p><strong>Phone:</strong> ${application.phone}</p>
            <p><strong>Ward:</strong> ${application.wardNumber}</p>
            <p><strong>Address:</strong> ${application.address}</p>
          </div>
          
          ${
            application.additionalInfo
              ? `
            <div class="application-content">
              <p><strong>Additional Info:</strong> ${application.additionalInfo}</p>
            </div>
          `
              : ""
          }
        </div>
        
        <div class="application-actions">
          <select class="status-select" data-id="${application._id}">
            <option value="pending" ${
              application.status === "pending" ? "selected" : ""
            }>Pending</option>
            <option value="under_review" ${
              application.status === "under_review" ? "selected" : ""
            }>Under Review</option>
            <option value="approved" ${
              application.status === "approved" ? "selected" : ""
            }>Approved</option>
            <option value="rejected" ${
              application.status === "rejected" ? "selected" : ""
            }>Rejected</option>
          </select>
          <button class="btn btn-danger delete-application" data-id="${
            application._id
          }">Delete</button>
        </div>
      `;
      container.appendChild(appElement);
    });

    // Add event listeners for actions
    container.addEventListener("change", async (e) => {
      if (e.target.classList.contains("status-select")) {
        const applicationId = e.target.getAttribute("data-id");
        const newStatus = e.target.value;
        await updateApplicationStatus(applicationId, newStatus);
      }
    });

    container.addEventListener("click", async (e) => {
      if (e.target.classList.contains("delete-application")) {
        const applicationId = e.target.getAttribute("data-id");
        await deleteServiceApplication(applicationId);
      }
    });
  } catch (error) {
    console.error("Error loading service applications:", error);
    container.innerHTML = "<p>Error loading service applications.</p>";
  }
  // Update the displayServiceApplications function in admin dashboard
  function displayServiceApplications(applications) {
    const container = document.getElementById("serviceApplicationsContainer");

    if (applications.length === 0) {
      container.innerHTML =
        '<div class="no-data">No service applications found</div>';
      return;
    }

    container.innerHTML = applications
      .map(
        (application) => `
    <div class="application-card" data-id="${application._id}">
      <div class="application-header">
        <div class="application-id">${application.applicationId}</div>
        <div class="application-status status-${application.status}">
          ${application.status
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")}
        </div>
      </div>
      <div class="application-body">
        <div class="application-info">
          <div class="info-row">
            <strong>Service:</strong> ${application.serviceType}
          </div>
          <div class="info-row">
            <strong>Applicant:</strong> ${application.firstName} ${
          application.lastName
        }
          </div>
          <div class="info-row">
            <strong>Contact:</strong> ${application.email} | ${
          application.phone
        }
          </div>
          <div class="info-row">
            <strong>Ward:</strong> ${application.wardNumber}
          </div>
          <div class="info-row">
            <strong>Applied:</strong> ${new Date(
              application.applicationDate
            ).toLocaleDateString()}
          </div>
          ${
            application.payment
              ? `
            <div class="info-row">
              <strong>Payment:</strong> 
              <span class="payment-status status-${application.payment.status}">
                ${application.payment.status
                  .split("_")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")}
              </span>
            </div>
            <div class="info-row">
              <strong>Amount:</strong> ₦${application.payment.amount}
            </div>
            <div class="info-row">
              <strong>Transaction ID:</strong> ${
                application.payment.transactionId
              }
            </div>
          `
              : '<div class="info-row"><strong>Payment:</strong> Not Submitted</div>'
          }
        </div>
        ${
          application.purpose
            ? `<div class="info-row"><strong>Purpose:</strong> ${application.purpose}</div>`
            : ""
        }
      </div>
      <div class="application-actions">
        <select class="status-select" onchange="updateApplicationStatus('${
          application._id
        }', this.value)">
          <option value="pending" ${
            application.status === "pending" ? "selected" : ""
          }>Pending</option>
          <option value="payment_pending" ${
            application.status === "payment_pending" ? "selected" : ""
          }>Payment Pending</option>
          <option value="payment_verified" ${
            application.status === "payment_verified" ? "selected" : ""
          }>Payment Verified</option>
          <option value="in_review" ${
            application.status === "in_review" ? "selected" : ""
          }>In Review</option>
          <option value="approved" ${
            application.status === "approved" ? "selected" : ""
          }>Approved</option>
          <option value="rejected" ${
            application.status === "rejected" ? "selected" : ""
          }>Rejected</option>
        </select>
        ${
          application.payment &&
          application.payment.status === "pending_verification"
            ? `
          <div class="payment-actions">
            <button class="btn btn-success btn-sm" onclick="verifyPayment('${application._id}', true)">
              <i class="fas fa-check"></i> Verify Payment
            </button>
            <button class="btn btn-danger btn-sm" onclick="verifyPayment('${application._id}', false)">
              <i class="fas fa-times"></i> Reject
            </button>
          </div>
        `
            : ""
        }
        <button class="btn btn-danger btn-sm" onclick="deleteApplication('${
          application._id
        }')">
          <i class="fas fa-trash"></i> Delete
        </button>
      </div>
    </div>
  `
      )
      .join("");
  }

  // Add payment verification function
  async function verifyPayment(applicationId, verified) {
    try {
      const response = await fetch(
        `/api/service-applications/${applicationId}/payment/verify`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ verified }),
        }
      );

      const result = await response.json();

      if (result.success) {
        showSweetPopup("success", "Payment Verified", result.message);
        loadServiceApplications(
          document.getElementById("applicationFilter").value
        );
      } else {
        showSweetPopup("error", "Verification Failed", result.error);
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      showSweetPopup(
        "error",
        "Verification Failed",
        "Failed to verify payment"
      );
    }
  }
}

// Add this missing function
function updateApplicationsStats(total, pending, approved, rejected) {
  const totalElement = document.getElementById("totalApplications");
  const pendingElement = document.getElementById("pendingApplications");
  const approvedElement = document.getElementById("approvedApplications");
  const rejectedElement = document.getElementById("rejectedApplications");

  if (totalElement) totalElement.textContent = total;
  if (pendingElement) pendingElement.textContent = pending;
  if (approvedElement) approvedElement.textContent = approved;
  if (rejectedElement) rejectedElement.textContent = rejected;
}

async function updateApplicationStatus(id, status) {
  try {
    await apiService.updateServiceApplicationStatus(id, status);
    SweetPopup.success("Application status updated successfully!");
    await loadServiceApplications();
  } catch (error) {
    SweetPopup.error("Error updating application status: " + error.message);
  }
}

async function deleteServiceApplication(id) {
  SweetPopup.confirm(
    "Are you sure you want to delete this service application?",
    "Confirm Deletion",
    async () => {
      try {
        await apiService.deleteServiceApplication(id);
        SweetPopup.success("Service application deleted successfully!");
        await loadServiceApplications();
      } catch (error) {
        SweetPopup.error("Error deleting application: " + error.message);
      }
    }
  );
}

// Service Application Button Functionality - FIXED VERSION
function initializeServiceApplicationButtons() {
  console.log("Initializing service application buttons...");

  // Only initialize if we're on the main page (not admin dashboard)
  const adminDashboard = document.getElementById("adminDashboard");
  if (adminDashboard && adminDashboard.style.display === "block") {
    console.log(
      "Admin dashboard is open, skipping service button initialization"
    );
    return;
  }

  const applyButtons = document.querySelectorAll(".apply-service-btn");
  console.log(`Found ${applyButtons.length} apply buttons`);

  applyButtons.forEach((button) => {
    // Remove any existing event listeners to prevent duplicates
    button.replaceWith(button.cloneNode(true));
  });

  // Re-select the buttons after cloning
  const freshButtons = document.querySelectorAll(".apply-service-btn");

  freshButtons.forEach((button) => {
    button.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      const service = this.getAttribute("data-service");
      console.log("Apply button clicked for service:", service);

      if (service) {
        // Redirect to service application page with service parameter
        window.location.href = `service-application.html?service=${encodeURIComponent(
          service
        )}`;
      } else {
        console.error("No service specified for this button");
      }
    });
  });
}

// Service Application Button Handlers
document.addEventListener("DOMContentLoaded", function () {
  // Handle Apply Now button clicks
  const applyServiceButtons = document.querySelectorAll(".apply-service-btn");

  applyServiceButtons.forEach((button) => {
    button.addEventListener("click", function (e) {
      e.preventDefault();

      const serviceType = this.getAttribute("data-service");
      console.log("Applying for service:", serviceType);

      // Redirect to apply_for_service.html with service type as parameter
      window.location.href = `apply_for_service.html?service=${encodeURIComponent(
        serviceType
      )}`;
    });
  });

  // If we're on the apply_for_service.html page, pre-select the service type from URL parameter
  if (window.location.pathname.includes("apply_for_service.html")) {
    preSelectServiceType();
  }
});

function preSelectServiceType() {
  // Get the service type from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const serviceType = urlParams.get("service");

  if (serviceType && document.getElementById("serviceType")) {
    const serviceSelect = document.getElementById("serviceType");

    // Find the option that matches the service type
    for (let i = 0; i < serviceSelect.options.length; i++) {
      const option = serviceSelect.options[i];
      if (
        option.textContent.toLowerCase().includes(serviceType.toLowerCase()) ||
        option.value
          .toLowerCase()
          .includes(serviceType.toLowerCase().replace(" ", "-"))
      ) {
        option.selected = true;
        break;
      }
    }

    // If no exact match found, try to map common service names
    if (!serviceSelect.value) {
      mapServiceType(serviceType, serviceSelect);
    }
  }
}

function mapServiceType(serviceType, selectElement) {
  const serviceMappings = {
    "civil registration": "birth-certificate",
    "birth registration": "birth-certificate",
    "death registration": "death-certificate",
    "marriage registration": "marriage-certificate",
    "local origin": "local-origin",
    "business permit": "business-permit",
    "revenue collection": "business-permit",
    "tax collection": "tax-clearance",
    "building approval": "building-approval",
    "market permit": "market-permit",
  };

  const normalizedService = serviceType.toLowerCase();
  const mappedValue = serviceMappings[normalizedService];

  if (mappedValue) {
    for (let i = 0; i < selectElement.options.length; i++) {
      if (selectElement.options[i].value === mappedValue) {
        selectElement.options[i].selected = true;
        break;
      }
    }
  }
}

// Notification System
function initNotificationSystem() {
  const notificationBell = document.getElementById("notificationBell");
  if (!notificationBell) return;

  // Check for notifications every 30 seconds
  checkNotifications();
  setInterval(checkNotifications, 30000);

  // Setup notification bell click
  notificationBell.addEventListener("click", showNotificationsPanel);
}

function checkNotifications() {
  // Check localStorage for notifications
  const notifications = JSON.parse(
    localStorage.getItem("adminNotifications") || "[]"
  );
  const payments = JSON.parse(
    localStorage.getItem("confirmedPayments") || "[]"
  );

  // Count unread notifications
  const unreadNotifications = notifications.filter((n) => !n.read).length;

  // Count pending payments (not verified)
  const pendingPayments = payments.filter((p) => !p.verified).length;

  const totalUnread = unreadNotifications + pendingPayments;

  // Update notification badge
  const badge = document.getElementById("notificationBadge");
  if (badge) {
    badge.textContent = totalUnread > 99 ? "99+" : totalUnread;
    badge.style.display = totalUnread > 0 ? "flex" : "none";
  }
}

function showNotificationsPanel() {
  // Create or show notifications panel
  let panel = document.getElementById("notificationsPanel");

  if (!panel) {
    panel = document.createElement("div");
    panel.id = "notificationsPanel";
    panel.className = "notifications-panel";
    document.body.appendChild(panel);
  }

  renderNotificationsPanel();
  panel.style.display = "block";

  // Mark notifications as read when viewing
  markNotificationsAsRead();
}

function renderNotificationsPanel() {
  const panel = document.getElementById("notificationsPanel");
  const notifications = JSON.parse(
    localStorage.getItem("adminNotifications") || "[]"
  );
  const payments = JSON.parse(
    localStorage.getItem("confirmedPayments") || "[]"
  );
  const pendingPayments = payments.filter((p) => !p.verified);

  panel.innerHTML = `
    <div style="padding: 20px; border-bottom: 1px solid #eee; background: var(--primary); color: white;">
      <h3 style="margin: 0;"><i class="fas fa-bell"></i> Notifications</h3>
    </div>
    <div style="max-height: 500px; overflow-y: auto;">
      ${
        pendingPayments.length > 0
          ? `
        <div style="padding: 15px; background: #fff3cd; border-bottom: 1px solid #ffeaa7;">
          <strong><i class="fas fa-exclamation-triangle"></i> Pending Payments (${
            pendingPayments.length
          })</strong>
        </div>
        ${pendingPayments
          .map(
            (payment) => `
          <div style="padding: 15px; border-bottom: 1px solid #eee;">
            <div style="display: flex; align-items: center; margin-bottom: 5px;">
              <span style="font-size: 20px; margin-right: 10px;">💰</span>
              <div style="flex: 1;">
                <strong>Payment Needs Verification</strong>
                <div style="color: #666; font-size: 14px;">
                  Application #${payment.applicationId || "N/A"}
                </div>
              </div>
            </div>
            <div style="color: #666; margin-bottom: 10px;">
              <div>Amount: <strong>₦${
                payment.amount?.toLocaleString() || "0"
              }</strong></div>
              <div>Transaction: ${payment.transactionId || "N/A"}</div>
            </div>
            <div>
              <button onclick="verifyPaymentFromNotification('${
                payment.applicationId
              }', '${payment.transactionId}')" 
                      style="background: #28a745; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; font-size: 12px; margin-right: 5px;">
                Verify Payment
              </button>
              <button onclick="viewApplicationDetails('${
                payment.applicationId
              }')" 
                      style="background: var(--primary); color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; font-size: 12px;">
                View Application
              </button>
            </div>
          </div>
        `
          )
          .join("")}
      `
          : ""
      }
      
      ${
        notifications.length > 0
          ? `
        ${
          pendingPayments.length > 0
            ? `<div style="padding: 15px; background: #f8f9fa; border-bottom: 1px solid #e9ecef;"><strong>Other Notifications</strong></div>`
            : ""
        }
        ${notifications
          .map(
            (notification) => `
          <div style="padding: 15px; border-bottom: 1px solid #eee; background: ${
            notification.read ? "#fff" : "#f8f9fa"
          };">
            <div style="display: flex; align-items: center; margin-bottom: 5px;">
              <span style="font-size: 20px; margin-right: 10px;">${
                notification.type === "payment" ? "💰" : "📢"
              }</span>
              <strong style="flex: 1;">${
                notification.title || "Notification"
              }</strong>
              <small style="color: #999;">${formatTimeAgo(
                notification.timestamp
              )}</small>
            </div>
            <div style="color: #666; margin-bottom: 10px;">${
              notification.message || ""
            }</div>
            ${
              notification.applicationId
                ? `
              <button onclick="viewApplicationDetails('${notification.applicationId}')" 
                      style="background: var(--primary); color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; font-size: 12px;">
                View Application
              </button>
            `
                : ""
            }
          </div>
        `
          )
          .join("")}
      `
          : ""
      }
      
      ${
        notifications.length === 0 && pendingPayments.length === 0
          ? '<div style="padding: 40px; text-align: center; color: #999;">No notifications</div>'
          : ""
      }
    </div>
    ${
      notifications.length > 0 || pendingPayments.length > 0
        ? `
      <div style="padding: 15px; text-align: center; border-top: 1px solid #eee;">
        <button onclick="markAllNotificationsRead()" 
                style="background: #6c757d; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer;">
          Mark All as Read
        </button>
      </div>
    `
        : ""
    }
  `;

  // Close when clicking outside
  setTimeout(() => {
    document.addEventListener("click", closeNotificationsOutside);
  }, 100);
}

function markNotificationsAsRead() {
  const notifications = JSON.parse(
    localStorage.getItem("adminNotifications") || "[]"
  );
  notifications.forEach((n) => (n.read = true));
  localStorage.setItem("adminNotifications", JSON.stringify(notifications));
  checkNotifications();
}

function markAllNotificationsRead() {
  markNotificationsAsRead();
  showNotificationsPanel();
}

function closeNotificationsOutside(e) {
  const panel = document.getElementById("notificationsPanel");
  const bell = document.getElementById("notificationBell");

  if (
    panel &&
    !panel.contains(e.target) &&
    (!bell || !bell.contains(e.target))
  ) {
    panel.style.display = "none";
    document.removeEventListener("click", closeNotificationsOutside);
  }
}

function verifyPaymentFromNotification(applicationId, transactionId) {
  // Find the payment
  const payments = JSON.parse(
    localStorage.getItem("confirmedPayments") || "[]"
  );
  const payment = payments.find(
    (p) =>
      p.applicationId === applicationId && p.transactionId === transactionId
  );

  if (payment) {
    if (
      confirm(
        `Verify payment of ₦${payment.amount} for Application #${applicationId}?`
      )
    ) {
      payment.verified = true;
      localStorage.setItem("confirmedPayments", JSON.stringify(payments));

      // Update application status
      const applications = JSON.parse(
        localStorage.getItem("serviceApplications") || "[]"
      );
      const appIndex = applications.findIndex(
        (app) => app.applicationId === applicationId
      );
      if (appIndex !== -1) {
        applications[appIndex].paymentVerified = true;
        applications[appIndex].transactionId = transactionId;
        localStorage.setItem(
          "serviceApplications",
          JSON.stringify(applications)
        );
      }

      alert("✅ Payment verified!");
      showNotificationsPanel();
      checkNotifications();

      // Refresh applications list if on service applications tab
      if (
        document.querySelector(".admin-tab.active").dataset.tab ===
        "service-applications"
      ) {
        loadServiceApplications();
      }
    }
  }
}

function viewApplicationDetails(applicationId) {
  // Close notifications panel
  const panel = document.getElementById("notificationsPanel");
  if (panel) panel.style.display = "none";

  // Switch to service applications tab
  const serviceTab = document.querySelector(
    '.admin-tab[data-tab="service-applications"]'
  );
  if (serviceTab) {
    serviceTab.click();

    // Highlight the application
    setTimeout(() => {
      const appCard = document.querySelector(
        `.application-card[data-id*="${applicationId}"]`
      );
      if (appCard) {
        appCard.style.animation = "pulse 2s";
        appCard.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 500);
  }
}

function formatTimeAgo(timestamp) {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

// Initialize notification system when admin dashboard opens
document.addEventListener("DOMContentLoaded", function () {
  // Initialize notification system
  initNotificationSystem();

  // Update loadServiceApplications to include DOB field
  async function loadServiceApplications(filter = "all") {
    try {
      // Your existing code...
      // Make sure to include dateOfBirth in the display
    } catch (error) {
      console.error("Error loading service applications:", error);
    }
  }
});

// Notification System
async function initNotificationSystem() {
  const notificationBell = document.getElementById("notificationBell");
  if (!notificationBell) return;

  // Check for notifications every 30 seconds
  await checkNotifications();
  setInterval(checkNotifications, 30000);

  // Setup notification bell click
  notificationBell.addEventListener("click", showNotificationsPanel);
}

async function checkNotifications() {
  try {
    const response = await fetch("/api/admin/notifications");
    const data = await response.json();

    if (response.ok) {
      updateNotificationBadge(data.unreadCount);
    }
  } catch (error) {
    console.error("Error checking notifications:", error);
  }
}

function updateNotificationBadge(unreadCount) {
  const badge = document.getElementById("notificationBadge");
  if (badge) {
    badge.textContent = unreadCount > 99 ? "99+" : unreadCount;
    badge.style.display = unreadCount > 0 ? "flex" : "none";
  }
}

async function showNotificationsPanel() {
  try {
    const response = await fetch("/api/admin/notifications");
    const data = await response.json();

    if (!response.ok) return;

    renderNotificationsPanel(data.notifications);
  } catch (error) {
    console.error("Error loading notifications:", error);
  }
}

function renderNotificationsPanel(notifications) {
  let panel = document.getElementById("notificationsPanel");

  if (!panel) {
    panel = document.createElement("div");
    panel.id = "notificationsPanel";
    panel.className = "notifications-panel";
    document.body.appendChild(panel);
  }

  panel.innerHTML = `
    <div style="padding: 20px; border-bottom: 1px solid #eee; background: var(--primary); color: white;">
      <h3 style="margin: 0;"><i class="fas fa-bell"></i> Notifications</h3>
    </div>
    <div style="max-height: 500px; overflow-y: auto;">
      ${
        notifications.length > 0
          ? notifications
              .map(
                (notification) => `
          <div style="padding: 15px; border-bottom: 1px solid #eee; background: ${
            notification.read ? "#fff" : "#f8f9fa"
          };">
            <div style="display: flex; align-items: center; margin-bottom: 5px;">
              <span style="font-size: 20px; margin-right: 10px;">${
                notification.type === "payment" ? "💰" : "📢"
              }</span>
              <strong style="flex: 1;">${notification.title}</strong>
              <small style="color: #999;">${formatTimeAgo(
                notification.createdAt
              )}</small>
            </div>
            <div style="color: #666; margin-bottom: 10px;">${
              notification.message
            }</div>
            ${
              notification.applicationId
                ? `
              <div style="font-size: 12px; color: #888;">
                <div>Transaction: ${notification.transactionId || "N/A"}</div>
                <div>Amount: ₦${
                  notification.amount?.toLocaleString() || "0"
                }</div>
              </div>
              <button onclick="viewApplicationFromNotification('${
                notification.applicationId
              }')" 
                      style="background: var(--primary); color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; font-size: 12px; margin-top: 10px;">
                View Application
              </button>
              <button onclick="markNotificationAsRead('${notification._id}')" 
                      style="background: #6c757d; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; font-size: 12px; margin-top: 10px; margin-left: 5px;">
                Mark as Read
              </button>
            `
                : ""
            }
          </div>
        `
              )
              .join("")
          : '<div style="padding: 40px; text-align: center; color: #999;">No notifications</div>'
      }
    </div>
    ${
      notifications.length > 0
        ? `
      <div style="padding: 15px; text-align: center; border-top: 1px solid #eee;">
        <button onclick="markAllNotificationsAsRead()" 
                style="background: #6c757d; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer;">
          Mark All as Read
        </button>
      </div>
    `
        : ""
    }
  `;

  panel.style.display = "block";

  // Close when clicking outside
  setTimeout(() => {
    document.addEventListener("click", closeNotificationsOutside);
  }, 100);
}

async function markNotificationAsRead(notificationId) {
  try {
    const response = await fetch(
      `/api/admin/notifications/${notificationId}/read`,
      {
        method: "PUT",
      }
    );

    if (response.ok) {
      showNotificationsPanel();
      checkNotifications();
    }
  } catch (error) {
    console.error("Error marking notification as read:", error);
  }
}

async function markAllNotificationsAsRead() {
  try {
    const response = await fetch("/api/admin/notifications/read-all", {
      method: "PUT",
    });

    if (response.ok) {
      showNotificationsPanel();
      checkNotifications();
    }
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
  }
}

function viewApplicationFromNotification(applicationId) {
  // Switch to service applications tab
  const serviceTab = document.querySelector(
    '.admin-tab[data-tab="service-applications"]'
  );
  if (serviceTab) {
    serviceTab.click();

    // Load applications and scroll to the specific one
    setTimeout(() => {
      loadServiceApplications().then(() => {
        const appCard = document.querySelector(
          `.application-card[data-id*="${applicationId}"]`
        );
        if (appCard) {
          appCard.style.animation = "pulse 2s";
          appCard.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      });
    }, 500);
  }
}

function closeNotificationsOutside(e) {
  const panel = document.getElementById("notificationsPanel");
  const bell = document.getElementById("notificationBell");

  if (
    panel &&
    !panel.contains(e.target) &&
    (!bell || !bell.contains(e.target))
  ) {
    panel.style.display = "none";
    document.removeEventListener("click", closeNotificationsOutside);
  }
}

// Helper function
function formatTimeAgo(timestamp) {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

// Initialize when admin dashboard opens
document.addEventListener("DOMContentLoaded", function () {
  // Check if admin dashboard is open
  if (document.getElementById("adminDashboard")) {
    initNotificationSystem();
  }
});

// Initialize Leadership History Form
function initializeLeadershipHistoryForm() {
  const form = document.getElementById("leadershipHistoryForm");
  const resetBtn = document.getElementById("resetLeadershipHistoryForm");
  const cancelBtn = document.getElementById("cancelLeadershipHistoryEdit");
  const imageInput = document.getElementById("historicalLeaderImage");
  const imagePreview = document.getElementById("historicalLeaderImagePreview");

  if (form && !form.hasAttribute("data-initialized")) {
    form.setAttribute("data-initialized", "true");

    // Update the form submission handler in initializeLeadershipHistoryForm
    // Update the form submission handler - ADD THIS CONSOLE LOGGING
form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    console.log('Form submission started...');
    
    const id = document.getElementById('historicalLeaderId').value;
    const name = document.getElementById('historicalLeaderName').value;
    const village = document.getElementById('historicalLeaderVillage').value;
    const position = document.getElementById('historicalLeaderPosition').value;
    const period = document.getElementById('historicalLeaderPeriod').value;
    const achievements = document.getElementById('historicalLeaderAchievements').value;
    const imageFile = imageInput.files[0];
    
    console.log('Form data:', { id, name, village, position, period, achievements, imageFile });
    
    // Validate required fields
    if (!name || !village || !position || !period) {
        SweetPopup.error('Please fill in all required fields: Name, Village, Position, and Period');
        return;
    }
    
    const leaderData = {
        name,
        village,
        position,
        period,
        achievements: achievements || '',
        image: imageFile
    };
    
    try {
        console.log('Attempting to save leader...');
        
        if (id) {
            const result = await apiService.updateLeadership(id, leaderData);
            SweetPopup.success(result.message || 'Leader updated successully!');
        } else {
            const result = await apiService.addLeadership(leaderData);
            SweetPopup.success(result.message || 'Leader added to history successfully!');
        }
        
        await loadHistoricalLeadersList();
        resetLeadershipHistoryFormToAddMode();
        
        console.log('Leader saved successfully!');
    } catch (error) {
        console.error('Full error saving leader:', error);
        console.error('Error stack:', error.stack);
        
        // More detailed error message
        let errorMessage = 'Error saving leader: ';
        if (error.message.includes('NetworkError')) {
            errorMessage += 'Network error. Please check your internet connection and server status.';
        } else if (error.message.includes('Failed to fetch')) {
            errorMessage += 'Cannot connect to server. Make sure the server is running on http://localhost:3000';
        } else {
            errorMessage += error.message;
        }
        
        SweetPopup.error(errorMessage);
    }
});
  }

  // Image preview
  if (imageInput && imagePreview) {
    imageInput.addEventListener("change", function (e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
          imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        };
        reader.readAsDataURL(file);
      } else {
        imagePreview.innerHTML = "<span>No image selected</span>";
      }
    });
  }

  // Reset form
  if (resetBtn && !resetBtn.hasAttribute("data-initialized")) {
    resetBtn.setAttribute("data-initialized", "true");
    resetBtn.addEventListener("click", resetLeadershipHistoryFormToAddMode);
  }

  // Cancel edit
  if (cancelBtn && !cancelBtn.hasAttribute("data-initialized")) {
    cancelBtn.setAttribute("data-initialized", "true");
    cancelBtn.addEventListener("click", resetLeadershipHistoryFormToAddMode);
  }
}

// Load historical leaders list
async function loadHistoricalLeadersList() {
  const container = document.getElementById("historicalLeadersListContainer");
  if (!container) return;

  try {
    const leaders = await apiService.getLeadershipHistory();

    container.innerHTML = "";

    if (leaders.length === 0) {
      container.innerHTML = "<p>No historical leaders added yet.</p>";
      return;
    }

    leaders.forEach((leader) => {
      const leaderItem = document.createElement("div");
      leaderItem.className = "leader-item";
      leaderItem.innerHTML = `
                <div class="leader-item-content">
                    <div class="leader-item-image">
                        ${
                          leader.image
                            ? `<img src="${leader.image}" alt="${leader.name}">`
                            : `<i class="fas fa-user-circle"></i>`
                        }
                    </div>
                    <div class="leader-item-details">
                        <h4>${leader.name}</h4>
                        <p><strong>Village:</strong> ${leader.village}</p>
                        <p><strong>Position:</strong> ${leader.position}</p>
                        <p><strong>Period:</strong> ${leader.period}</p>
                    </div>
                </div>
                <div class="leader-item-actions">
                    <button class="edit-btn" data-id="${
                      leader._id
                    }">Edit</button>
                    <button class="delete-btn" data-id="${
                      leader._id
                    }">Delete</button>
                </div>
            `;
      container.appendChild(leaderItem);
    });

    // Add event listeners for edit/delete
    container.addEventListener("click", async (e) => {
      if (e.target.classList.contains("edit-btn")) {
        const leaderId = e.target.getAttribute("data-id");
        await editHistoricalLeader(leaderId);
      }

      if (e.target.classList.contains("delete-btn")) {
        const leaderId = e.target.getAttribute("data-id");
        await deleteHistoricalLeader(leaderId);
      }
    });
  } catch (error) {
    console.error("Error loading historical leaders:", error);
    container.innerHTML = "<p>Error loading leaders. Please try again.</p>";
  }
}

// Edit historical leader
async function editHistoricalLeader(id) {
  try {
    const leaders = await apiService.getLeadershipHistory();
    const leader = leaders.find((l) => l._id === id);

    if (!leader) return;

    document.getElementById("historicalLeaderId").value = leader._id;
    document.getElementById("historicalLeaderName").value = leader.name;
    document.getElementById("historicalLeaderVillage").value = leader.village;
    document.getElementById("historicalLeaderPosition").value = leader.position;
    document.getElementById("historicalLeaderPeriod").value = leader.period;
    document.getElementById("historicalLeaderAchievements").value =
      leader.achievements || "";

    // Update image preview
    const imagePreview = document.getElementById(
      "historicalLeaderImagePreview"
    );
    if (imagePreview && leader.image) {
      imagePreview.innerHTML = `<img src="${leader.image}" alt="Preview">`;
    }

    // Update form title and button
    document.getElementById("leadershipHistoryFormTitle").textContent =
      "Edit Historical Leader";
    document.getElementById("leadershipHistorySubmitBtn").textContent =
      "Update Leader";
    document.getElementById("cancelLeadershipHistoryEdit").style.display =
      "inline-block";
  } catch (error) {
    SweetPopup.error("Error loading leader data: " + error.message);
  }
}

// Delete historical leader
async function deleteHistoricalLeader(id) {
  SweetPopup.confirm(
    "Are you sure you want to delete this historical leader?",
    "Confirm Deletion",
    async () => {
      try {
        await apiService.deleteLeadership(id);
        await loadHistoricalLeadersList();
        SweetPopup.success("Leader deleted successfully!");
      } catch (error) {
        SweetPopup.error("Error deleting leader: " + error.message);
      }
    }
  );
}

// Reset leadership history form
function resetLeadershipHistoryFormToAddMode() {
  const form = document.getElementById("leadershipHistoryForm");
  if (form) form.reset();

  document.getElementById("historicalLeaderId").value = "";
  document.getElementById("leadershipHistoryFormTitle").textContent =
    "Add Historical Leader";
  document.getElementById("leadershipHistorySubmitBtn").textContent =
    "Add Historical Leader";
  document.getElementById("cancelLeadershipHistoryEdit").style.display = "none";

  const imagePreview = document.getElementById("historicalLeaderImagePreview");
  if (imagePreview) imagePreview.innerHTML = "<span>No image selected</span>";
}

// Add to loadAdminData function
async function loadAdminData() {
  console.log("Loading admin data...");
  await loadGovernorData();
  await loadLeaderList();
  await loadVideoData();
  await loadVillagesList();
  await loadNewsList();
  await loadEventsList();
  await loadContactRequests();
  await loadSupportRequests();
  await loadServiceApplications();
  await loadHistoricalLeadersList(); // ADD THIS LINE
  initializeAdminTabs();
  initializeAdminForms();
  initializePasswordForm();
  initializeSupportManagement();
  initializeServiceApplicationsManagement();
  initializeLeadershipHistoryForm(); // ADD THIS LINE
}












// Academia Management
function initializeAcademiaManagement() {
  const academiaForm = document.getElementById('academiaForm');
  const resetBtn = document.getElementById('resetAcademiaForm');
  const cancelBtn = document.getElementById('cancelAcademiaEdit');
  const photoInput = document.getElementById('academiaPhoto');
  const photoPreview = document.getElementById('academiaPhotoPreview');

  if (academiaForm && !academiaForm.hasAttribute('data-initialized')) {
    academiaForm.setAttribute('data-initialized', 'true');
    
    academiaForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const id = document.getElementById('academiaId').value;
      const title = document.getElementById('academiaTitle').value;
      const full_name = document.getElementById('academiaName').value;
      const village = document.getElementById('academiaVillage').value;
      const qualification = document.getElementById('academiaQualification').value;
      const photoFile = photoInput.files[0];
      
      if (!title || !full_name || !village || !qualification) {
        SweetPopup.error('Please fill in all required fields');
        return;
      }
      
      const academiaData = {
        title,
        full_name,
        village,
        qualification,
        photo: photoFile
      };
      
      try {
        if (id) {
          await apiService.updateAcademician(id, academiaData);
          SweetPopup.success('Academician updated successfully!');
        } else {
          await apiService.addAcademician(academiaData);
          SweetPopup.success('Academician added successfully!');
        }
        
        await loadAcademiaList();
        resetAcademiaForm();
      } catch (error) {
        SweetPopup.error('Error saving academician: ' + error.message);
      }
    });
  }

  // Photo preview
  if (photoInput && photoPreview) {
    photoInput.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
          photoPreview.innerHTML = `<img src="${e.target.result}" alt="Preview" style="max-width: 200px; max-height: 200px;">`;
        };
        reader.readAsDataURL(file);
      } else {
        photoPreview.innerHTML = '';
      }
    });
  }

  // Reset form
  if (resetBtn && !resetBtn.hasAttribute('data-initialized')) {
    resetBtn.setAttribute('data-initialized', 'true');
    resetBtn.addEventListener('click', resetAcademiaForm);
  }

  // Cancel edit
  if (cancelBtn && !cancelBtn.hasAttribute('data-initialized')) {
    cancelBtn.setAttribute('data-initialized', 'true');
    cancelBtn.addEventListener('click', resetAcademiaForm);
  }
}

// Load academia list for admin
async function loadAcademiaList() {
  const container = document.getElementById('academiaListContainer');
  if (!container) return;
  
  try {
    const academia = await apiService.getAcademia();
    
    if (academia.length === 0) {
      container.innerHTML = '<p>No academicians added yet.</p>';
      return;
    }
    
    let html = '<table class="admin-table">';
    html += '<thead><tr><th>Photo</th><th>Name</th><th>Title</th><th>Village</th><th>Actions</th></tr></thead><tbody>';
    
    academia.forEach(person => {
      html += `
        <tr>
          <td>
            ${person.photo 
              ? `<img src="${person.photo}" alt="${person.full_name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;">`
              : '<i class="fas fa-user-circle fa-2x"></i>'
            }
          </td>
          <td>${person.full_name}</td>
          <td>${person.title}</td>
          <td>${person.village}</td>
          <td>
            <button class="btn-edit edit-academia" data-id="${person._id}">
              <i class="fas fa-edit"></i> Edit
            </button>
            <button class="btn-danger delete-academia" data-id="${person._id}">
              <i class="fas fa-trash"></i> Delete
            </button>
          </td>
        </tr>
      `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
    
    // Add event listeners
    container.addEventListener('click', async (e) => {
      if (e.target.closest('.edit-academia')) {
        const id = e.target.closest('.edit-academia').dataset.id;
        await editAcademician(id);
      }
      
      if (e.target.closest('.delete-academia')) {
        const id = e.target.closest('.delete-academia').dataset.id;
        await deleteAcademician(id);
      }
    });
  } catch (error) {
    container.innerHTML = '<p>Error loading academia list.</p>';
    console.error('Error:', error);
  }
}

// Edit academician
async function editAcademician(id) {
  try {
    const academia = await apiService.getAcademia();
    const person = academia.find(p => p._id === id);
    
    if (!person) return;
    
    document.getElementById('academiaId').value = person._id;
    document.getElementById('academiaTitle').value = person.title;
    document.getElementById('academiaName').value = person.full_name;
    document.getElementById('academiaVillage').value = person.village;
    document.getElementById('academiaQualification').value = person.qualification;
    
    // Update photo preview
    const photoPreview = document.getElementById('academiaPhotoPreview');
    if (photoPreview && person.photo) {
      photoPreview.innerHTML = `<img src="${person.photo}" alt="Preview" style="max-width: 200px; max-height: 200px;">`;
    }
    
    // Update form title and buttons
    document.querySelector('#academiaForm h3').textContent = 'Edit Academician';
    document.querySelector('#academiaForm .btn-primary').innerHTML = '<i class="fas fa-save"></i> Update Academician';
    document.getElementById('cancelAcademiaEdit').style.display = 'inline-block';
  } catch (error) {
    SweetPopup.error('Error loading academician data: ' + error.message);
  }
}

// Delete academician
async function deleteAcademician(id) {
  SweetPopup.confirm(
    'Are you sure you want to delete this academician?',
    'Confirm Deletion',
    async () => {
      try {
        await apiService.deleteAcademician(id);
        await loadAcademiaList();
        SweetPopup.success('Academician deleted successfully!');
      } catch (error) {
        SweetPopup.error('Error deleting academician: ' + error.message);
      }
    }
  );
}

// Reset academia form
function resetAcademiaForm() {
  const form = document.getElementById('academiaForm');
  if (form) form.reset();
  
  document.getElementById('academiaId').value = '';
  document.getElementById('academiaPhotoPreview').innerHTML = '';
  document.querySelector('#academiaForm h3').textContent = 'Add Academician';
  document.querySelector('#academiaForm .btn-primary').innerHTML = '<i class="fas fa-plus"></i> Add Academician';
  document.getElementById('cancelAcademiaEdit').style.display = 'none';
}

// Gallery Management
function initializeGalleryManagement() {
  const galleryForm = document.getElementById('galleryForm');
  const typeSelect = document.getElementById('galleryType');
  const fileInput = document.getElementById('galleryFile');
  const fileHelp = document.getElementById('fileHelp');
  
  // File type validation
  if (typeSelect && fileHelp) {
    typeSelect.addEventListener('change', function() {
      if (this.value === 'image') {
        fileInput.accept = 'image/*';
        fileHelp.textContent = 'Accepted: JPG, PNG, GIF, WebP (Max 50MB)';
      } else if (this.value === 'video') {
        fileInput.accept = 'video/*';
        fileHelp.textContent = 'Accepted: MP4, WebM, MOV (Max 50MB)';
      } else {
        fileInput.accept = '';
        fileHelp.textContent = '';
      }
    });
  }
  
  if (galleryForm && !galleryForm.hasAttribute('data-initialized')) {
    galleryForm.setAttribute('data-initialized', 'true');
    
    galleryForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const type = document.getElementById('galleryType').value;
      const description = document.getElementById('galleryDescription').value;
      const file = fileInput.files[0];
      
      if (!type || !file) {
        SweetPopup.error('Please select type and upload a file');
        return;
      }
      
      const galleryData = {
        type,
        description,
        file
      };
      
      try {
        await apiService.uploadGalleryItem(galleryData);
        SweetPopup.success('Gallery item uploaded successfully!');
        galleryForm.reset();
        await loadGalleryList();
      } catch (error) {
        SweetPopup.error('Error uploading gallery item: ' + error.message);
      }
    });
  }
}

// Load gallery list for admin
async function loadGalleryList() {
  const container = document.getElementById('galleryListContainer');
  if (!container) return;
  
  try {
    const gallery = await apiService.getGallery();
    
    if (gallery.length === 0) {
      container.innerHTML = '<p>No gallery items added yet.</p>';
      return;
    }
    
    let html = '<div class="gallery-admin-grid">';
    
    gallery.forEach(item => {
      const isImage = item.type === 'image';
      const date = new Date(item.createdAt).toLocaleDateString();
      
      html += `
        <div class="gallery-admin-item">
          <div class="gallery-admin-media">
            ${isImage 
              ? `<img src="${item.file_url}" alt="${item.description}">`
              : `<div class="video-thumbnail">
                   <video>
                     <source src="${item.file_url}" type="${item.mime_type}">
                   </video>
                   <div class="video-overlay">
                     <i class="fas fa-play"></i>
                   </div>
                 </div>`
            }
          </div>
          <div class="gallery-admin-info">
            <p><strong>Type:</strong> ${item.type}</p>
            <p><strong>Description:</strong> ${item.description || 'N/A'}</p>
            <p><strong>Date:</strong> ${date}</p>
            <p><strong>File:</strong> ${item.file_name} (${(item.file_size / 1024 / 1024).toFixed(2)} MB)</p>
            <button class="btn-danger delete-gallery" data-id="${item._id}">
              <i class="fas fa-trash"></i> Delete
            </button>
          </div>
        </div>
      `;
    });
    
    html += '</div>';
    container.innerHTML = html;
    
    // Add event listeners for delete buttons
    container.addEventListener('click', async (e) => {
      if (e.target.closest('.delete-gallery')) {
        const id = e.target.closest('.delete-gallery').dataset.id;
        await deleteGalleryItem(id);
      }
    });
    
    // Add hover effect for video thumbnails
    document.querySelectorAll('.video-thumbnail').forEach(thumb => {
      thumb.addEventListener('mouseenter', function() {
        this.querySelector('video').play();
      });
      thumb.addEventListener('mouseleave', function() {
        this.querySelector('video').pause();
        this.querySelector('video').currentTime = 0;
      });
    });
  } catch (error) {
    container.innerHTML = '<p>Error loading gallery list.</p>';
    console.error('Error:', error);
  }
}

// Delete gallery item
async function deleteGalleryItem(id) {
  SweetPopup.confirm(
    'Are you sure you want to delete this gallery item?',
    'Confirm Deletion',
    async () => {
      try {
        await apiService.deleteGalleryItem(id);
        await loadGalleryList();
        SweetPopup.success('Gallery item deleted successfully!');
      } catch (error) {
        SweetPopup.error('Error deleting gallery item: ' + error.message);
      }
    }
  );
}

// Update loadAdminData function
async function loadAdminData() {
  console.log("Loading admin data...");
  await loadGovernorData();
  await loadLeaderList();
  await loadVideoData();
  await loadVillagesList();
  await loadNewsList();
  await loadEventsList();
  await loadContactRequests();
  await loadSupportRequests();
  await loadServiceApplications();
  await loadHistoricalLeadersList();
  await loadAcademiaList(); // ADD THIS
  await loadGalleryList(); // ADD THIS
  initializeAdminTabs();
  initializeAdminForms();
  initializePasswordForm();
  initializeSupportManagement();
  initializeServiceApplicationsManagement();
  initializeLeadershipHistoryForm();
  initializeAcademiaManagement(); // ADD THIS
  initializeGalleryManagement(); // ADD THIS
}














// ========== ACADEMIA MANAGEMENT ==========

function initializeAcademiaManagement() {
  console.log('🎓 Initializing academia management...');
  
  const academiaForm = document.getElementById('academiaForm');
  const resetBtn = document.getElementById('resetAcademiaForm');
  const cancelBtn = document.getElementById('cancelAcademiaEdit');
  const photoInput = document.getElementById('academiaPhoto');
  const photoPreview = document.getElementById('academiaPhotoPreview');

  if (academiaForm && !academiaForm.hasAttribute('data-initialized')) {
    academiaForm.setAttribute('data-initialized', 'true');
    console.log('✅ Academia form initialized');
    
    academiaForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      console.log('📝 Academia form submitted');
      
      const id = document.getElementById('academiaId').value;
      const title = document.getElementById('academiaTitle').value;
      const full_name = document.getElementById('academiaName').value;
      const village = document.getElementById('academiaVillage').value;
      const qualification = document.getElementById('academiaQualification').value;
      const photoFile = photoInput.files[0];
      
      console.log('📋 Form data:', { id, title, full_name, village, qualification, photoFile });
      
      // Validate required fields
      if (!title || !full_name || !village || !qualification) {
        SweetPopup.error('Please fill in all required fields: Title, Name, Village, and Qualifications');
        return;
      }
      
      const academiaData = {
        title: title,
        full_name: full_name,
        village: village,
        qualification: qualification,
        photo: photoFile
      };
      
      console.log('📤 Sending academia data:', academiaData);
      
      try {
        if (id) {
          console.log('🔄 Updating existing academician with ID:', id);
          const result = await apiService.updateAcademician(id, academiaData);
          SweetPopup.success(result.message || 'Academician updated successfully!');
          console.log('✅ Update successful:', result);
        } else {
          console.log('➕ Adding new academician');
          const result = await apiService.addAcademician(academiaData);
          SweetPopup.success(result.message || 'Academician added successfully!');
          console.log('✅ Add successful:', result);
        }
        
        // Refresh the list
        await loadAcademiaList();
        resetAcademiaForm();
        
      } catch (error) {
        console.error('❌ Error saving academician:', error);
        SweetPopup.error('Error saving academician: ' + error.message);
      }
    });
  }

  // Photo preview
  if (photoInput && photoPreview) {
    photoInput.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
          photoPreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        };
        reader.readAsDataURL(file);
      } else {
        photoPreview.innerHTML = '<span style="color: #999;">No image selected</span>';
      }
    });
  }

  // Reset form
  if (resetBtn && !resetBtn.hasAttribute('data-initialized')) {
    resetBtn.setAttribute('data-initialized', 'true');
    resetBtn.addEventListener('click', resetAcademiaForm);
  }

  // Cancel edit
  if (cancelBtn && !cancelBtn.hasAttribute('data-initialized')) {
    cancelBtn.setAttribute('data-initialized', 'true');
    cancelBtn.addEventListener('click', resetAcademiaForm);
  }
}

// Load academia list for admin
async function loadAcademiaList() {
  const container = document.getElementById('academiaListContainer');
  if (!container) {
    console.log('❌ Academia list container not found');
    return;
  }
  
  container.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i><p>Loading academicians...</p></div>';
  
  try {
    console.log('📥 Loading academia list...');
    const academia = await apiService.getAcademia();
    console.log('✅ Academia data loaded:', academia);
    
    if (academia.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-user-graduate"></i>
          <h3>No Academicians Added Yet</h3>
          <p>Add academicians using the form above</p>
        </div>
      `;
      return;
    }
    
    let html = `
      <table class="admin-table">
        <thead>
          <tr>
            <th>Photo</th>
            <th>Title</th>
            <th>Name</th>
            <th>Village</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
    `;
    
    academia.forEach(person => {
      html += `
        <tr>
          <td>
            ${person.photo 
              ? `<img src="${person.photo}" alt="${person.full_name}">`
              : '<i class="fas fa-user-circle"></i>'
            }
          </td>
          <td>${person.title}</td>
          <td><strong>${person.full_name}</strong></td>
          <td>${person.village}</td>
          <td>
            <button class="btn-edit edit-academia" data-id="${person._id}">
              <i class="fas fa-edit"></i> Edit
            </button>
            <button class="btn-danger delete-academia" data-id="${person._id}">
              <i class="fas fa-trash"></i> Delete
            </button>
          </td>
        </tr>
      `;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
    
    // Add event listeners
    container.addEventListener('click', async (e) => {
      if (e.target.closest('.edit-academia')) {
        const id = e.target.closest('.edit-academia').dataset.id;
        await editAcademician(id);
      }
      
      if (e.target.closest('.delete-academia')) {
        const id = e.target.closest('.delete-academia').dataset.id;
        await deleteAcademician(id);
      }
    });
    
  } catch (error) {
    console.error('❌ Error loading academia list:', error);
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-exclamation-triangle"></i>
        <h3>Error Loading Data</h3>
        <p>${error.message}</p>
      </div>
    `;
  }
}

// Edit academician
async function editAcademician(id) {
  try {
    console.log('✏️ Editing academician with ID:', id);
    const academia = await apiService.getAcademia();
    const person = academia.find(p => p._id === id);
    
    if (!person) {
      SweetPopup.error('Academician not found');
      return;
    }
    
    document.getElementById('academiaId').value = person._id;
    document.getElementById('academiaTitle').value = person.title;
    document.getElementById('academiaName').value = person.full_name;
    document.getElementById('academiaVillage').value = person.village;
    document.getElementById('academiaQualification').value = person.qualification;
    
    // Update photo preview
    const photoPreview = document.getElementById('academiaPhotoPreview');
    if (photoPreview) {
      if (person.photo) {
        photoPreview.innerHTML = `<img src="${person.photo}" alt="Preview">`;
      } else {
        photoPreview.innerHTML = '<span style="color: #999;">No image selected</span>';
      }
    }
    
    // Update form title and buttons
    const formTitle = document.querySelector('#academiaForm h3');
    const submitBtn = document.querySelector('#academiaForm .btn-primary');
    
    if (formTitle) formTitle.textContent = 'Edit Academician';
    if (submitBtn) submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Academician';
    
    document.getElementById('cancelAcademiaEdit').style.display = 'inline-block';
    
    console.log('✅ Academician loaded for editing:', person);
  } catch (error) {
    console.error('❌ Error loading academician data:', error);
    SweetPopup.error('Error loading academician data: ' + error.message);
  }
}

// Delete academician
async function deleteAcademician(id) {
  SweetPopup.confirm(
    'Are you sure you want to delete this academician?',
    'Confirm Deletion',
    async () => {
      try {
        console.log('🗑️ Deleting academician with ID:', id);
        await apiService.deleteAcademician(id);
        await loadAcademiaList();
        SweetPopup.success('Academician deleted successfully!');
      } catch (error) {
        console.error('❌ Error deleting academician:', error);
        SweetPopup.error('Error deleting academician: ' + error.message);
      }
    }
  );
}

// Reset academia form
function resetAcademiaForm() {
  const form = document.getElementById('academiaForm');
  if (form) form.reset();
  
  document.getElementById('academiaId').value = '';
  const photoPreview = document.getElementById('academiaPhotoPreview');
  if (photoPreview) photoPreview.innerHTML = '<span style="color: #999;">No image selected</span>';
  
  const formTitle = document.querySelector('#academiaForm h3');
  const submitBtn = document.querySelector('#academiaForm .btn-primary');
  
  if (formTitle) formTitle.textContent = 'Add Academician';
  if (submitBtn) submitBtn.innerHTML = '<i class="fas fa-plus"></i> Add Academician';
  
  document.getElementById('cancelAcademiaEdit').style.display = 'none';
}

// ========== GALLERY MANAGEMENT ==========

function initializeGalleryManagement() {
  console.log('🖼️ Initializing gallery management...');
  
  const galleryForm = document.getElementById('galleryForm');
  const typeSelect = document.getElementById('galleryType');
  const fileInput = document.getElementById('galleryFile');
  const fileHelp = document.getElementById('fileHelp');
  
  // File type validation
  if (typeSelect && fileHelp) {
    typeSelect.addEventListener('change', function() {
      if (this.value === 'image') {
        fileInput.accept = 'image/*';
        fileHelp.textContent = 'Accepted formats: JPG, PNG, GIF, WebP (Max 50MB)';
        fileHelp.style.color = '#3498db';
      } else if (this.value === 'video') {
        fileInput.accept = 'video/*';
        fileHelp.textContent = 'Accepted formats: MP4, WebM, MOV (Max 50MB)';
        fileHelp.style.color = '#e74c3c';
      } else {
        fileInput.accept = '';
        fileHelp.textContent = 'Please select a media type';
        fileHelp.style.color = '#999';
      }
    });
  }
  
  if (galleryForm && !galleryForm.hasAttribute('data-initialized')) {
    galleryForm.setAttribute('data-initialized', 'true');
    console.log('✅ Gallery form initialized');
    
    galleryForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      console.log('📝 Gallery form submitted');
      
      const type = document.getElementById('galleryType').value;
      const description = document.getElementById('galleryDescription').value;
      const file = fileInput.files[0];
      
      console.log('📋 Form data:', { type, description, file });
      
      if (!type) {
        SweetPopup.error('Please select media type (Image or Video)');
        return;
      }
      
      if (!file) {
        SweetPopup.error('Please select a file to upload');
        return;
      }
      
      const galleryData = {
        type: type,
        description: description,
        file: file
      };
      
      console.log('📤 Sending gallery data:', galleryData);
      
      try {
        const result = await apiService.uploadGalleryItem(galleryData);
        SweetPopup.success(result.message || 'Gallery item uploaded successfully!');
        console.log('✅ Upload successful:', result);
        
        galleryForm.reset();
        fileHelp.textContent = 'Please select a media type';
        fileHelp.style.color = '#999';
        await loadGalleryList();
        
      } catch (error) {
        console.error('❌ Error uploading gallery item:', error);
        SweetPopup.error('Error uploading gallery item: ' + error.message);
      }
    });
  }
}

// Load gallery list for admin
async function loadGalleryList() {
  const container = document.getElementById('galleryListContainer');
  if (!container) {
    console.log('❌ Gallery list container not found');
    return;
  }
  
  container.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i><p>Loading gallery items...</p></div>';
  
  try {
    console.log('📥 Loading gallery list...');
    const gallery = await apiService.getGallery();
    console.log('✅ Gallery data loaded:', gallery);
    
    if (gallery.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-photo-video"></i>
          <h3>No Gallery Items Added Yet</h3>
          <p>Upload images and videos using the form above</p>
        </div>
      `;
      return;
    }
    
    let html = '<div class="gallery-admin-grid">';
    
    gallery.forEach(item => {
      const isImage = item.type === 'image';
      const date = new Date(item.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
      
      html += `
        <div class="gallery-admin-item">
          <div class="gallery-admin-media">
            ${isImage 
              ? `<img src="${item.file_url}" alt="${item.description || 'Image'}">`
              : `<div class="video-thumbnail">
                   <video muted>
                     <source src="${item.file_url}" type="${item.mime_type}">
                   </video>
                   <div class="video-overlay">
                     <i class="fas fa-play"></i>
                   </div>
                 </div>`
            }
          </div>
          <div class="gallery-admin-info">
            <p>
              <strong>Type:</strong>
              <span class="file-badge ${isImage ? 'image-badge' : 'video-badge'}">
                ${isImage ? 'Image' : 'Video'}
              </span>
            </p>
            <p><strong>Description:</strong> ${item.description || 'No description'}</p>
            <p><strong>Uploaded:</strong> ${date}</p>
            <p><strong>File:</strong> ${item.file_name}</p>
            <p><strong>Size:</strong> ${(item.file_size / 1024 / 1024).toFixed(2)} MB</p>
            <button class="btn-danger delete-gallery" data-id="${item._id}">
              <i class="fas fa-trash"></i> Delete
            </button>
          </div>
        </div>
      `;
    });
    
    html += '</div>';
    container.innerHTML = html;
    
    // Add event listeners for delete buttons
    container.addEventListener('click', async (e) => {
      if (e.target.closest('.delete-gallery')) {
        const id = e.target.closest('.delete-gallery').dataset.id;
        await deleteGalleryItem(id);
      }
    });
    
    // Add hover effect for video thumbnails
    document.querySelectorAll('.video-thumbnail').forEach(thumb => {
      const video = thumb.querySelector('video');
      if (video) {
        thumb.addEventListener('mouseenter', function() {
          video.play().catch(e => console.log('Video play failed:', e));
        });
        thumb.addEventListener('mouseleave', function() {
          video.pause();
          video.currentTime = 0;
        });
      }
    });
    
  } catch (error) {
    console.error('❌ Error loading gallery list:', error);
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-exclamation-triangle"></i>
        <h3>Error Loading Data</h3>
        <p>${error.message}</p>
      </div>
    `;
  }
}

// Delete gallery item
async function deleteGalleryItem(id) {
  SweetPopup.confirm(
    'Are you sure you want to delete this gallery item?',
    'Confirm Deletion',
    async () => {
      try {
        console.log('🗑️ Deleting gallery item with ID:', id);
        await apiService.deleteGalleryItem(id);
        await loadGalleryList();
        SweetPopup.success('Gallery item deleted successfully!');
      } catch (error) {
        console.error('❌ Error deleting gallery item:', error);
        SweetPopup.error('Error deleting gallery item: ' + error.message);
      }
    }
  );
}

// Update loadAdminData function
async function loadAdminData() {
  console.log("🔄 Loading admin data...");
  try {
    await loadGovernorData();
    await loadLeaderList();
    await loadVideoData();
    await loadVillagesList();
    await loadNewsList();
    await loadEventsList();
    await loadContactRequests();
    await loadSupportRequests();
    await loadServiceApplications();
    await loadHistoricalLeadersList();
    
    // Load new features
    await loadAcademiaList();
    await loadGalleryList();
    
    initializeAdminTabs();
    initializeAdminForms();
    initializePasswordForm();
    initializeSupportManagement();
    initializeServiceApplicationsManagement();
    initializeLeadershipHistoryForm();
    
    // Initialize new features
    initializeAcademiaManagement();
    initializeGalleryManagement();
    
    console.log("✅ All admin data loaded successfully");
  } catch (error) {
    console.error("❌ Error loading admin data:", error);
  }
}












