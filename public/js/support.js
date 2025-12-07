// Set current year in footer
document.getElementById('currentYear').textContent = new Date().getFullYear();

// Support Form Submission - FIXED VERSION
// Support Form Submission - CORRECTED VERSION
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Support page loaded');
    
    const supportForm = document.getElementById('supportForm');
    
    if (supportForm) {
        console.log('✅ Support form found');
        
        supportForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('📨 Support form submission started');
            
            // Show loading state
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
            submitBtn.disabled = true;

            try {
                // Get form values - FIXED: Use correct field names that match server validation
                const formData = {
                    fullName: document.getElementById('fullName').value.trim(),
                    email: document.getElementById('email').value.trim(),
                    phone: document.getElementById('phone').value.trim() || null,
                    village: document.getElementById('village').value.trim(),
                    issueType: document.getElementById('issueType').value,
                    priority: document.getElementById('priority').value,
                    subject: document.getElementById('subject').value.trim(),
                    description: document.getElementById('description').value.trim(),
                    suggestions: document.getElementById('suggestions').value.trim() || null
                };

                console.log('📤 Form data to submit:', formData);

                // Validate required fields
                const requiredFields = ['fullName', 'email', 'village', 'issueType', 'subject', 'description'];
                const missingFields = requiredFields.filter(field => !formData[field]);
                
                if (missingFields.length > 0) {
                    throw new Error(`Please fill in all required fields: ${missingFields.join(', ')}`);
                }

                // Check consent
                if (!document.getElementById('consent').checked) {
                    throw new Error('Please consent to the collection and processing of your personal data');
                }

                // Validate email format
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(formData.email)) {
                    throw new Error('Please enter a valid email address');
                }

                const response = await fetch('/api/support', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData)
                });

                console.log('📥 Response status:', response.status);
                
                const result = await response.json();
                console.log('📥 Server response:', result);

                if (response.ok) {
                    // Sweet Popup success message
                    showSweetPopup('success', 'Success!', 
                        'Your support request has been submitted successfully!', {
                            reference: result.reference,
                            email: formData.email,
                            priority: formData.priority,
                            callback: () => {
                                supportForm.reset();
                                console.log('🔄 Form reset after successful submission');
                            }
                        }
                    );
                } else {
                    // More detailed error handling
                    if (result.errors) {
                        const errorMessages = result.errors.map(error => error.msg).join('\n');
                        throw new Error(`Validation error: ${errorMessages}`);
                    } else {
                        throw new Error(result.error || `Server error: ${response.status}`);
                    }
                }

            } catch (error) {
                console.error('❌ Support form error:', error);
                // Sweet Popup error message
                showSweetPopup('error', 'Error!', 
                    `Submission failed: ${error.message}`, {
                        callback: () => {
                            console.log('🔄 User acknowledged error');
                        }
                    }
                );
            } finally {
                // Reset button state
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    } else {
        console.error('❌ Support form not found!');
    }

    // Test API connection
    testSupportAPI();
    
    initializeScrollToTop();
});

// Test the support API connection
async function testSupportAPI() {
    try {
        console.log('🧪 Testing support API connection...');
        const response = await fetch('/api/support');
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Support API test successful:', data.length, 'requests found');
        } else {
            console.error('❌ Support API test failed with status:', response.status);
        }
    } catch (error) {
        console.error('❌ Support API test failed:', error);
    }
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

// Sweet Popup Function - Added this new function
function showSweetPopup(type, title, message, details = {}) {
    // Check if SweetAlert2 is available (you need to add this library to your HTML)
    if (typeof Swal !== 'undefined') {
        // Using SweetAlert2 library
        if (type === 'success') {
            Swal.fire({
                title: title,
                html: `
                    <div style="text-align: left;">
                        <p style="margin-bottom: 15px;">${message}</p>
                        ${details.reference ? `<p><strong>Reference Number:</strong> ${details.reference}</p>` : ''}
                        ${details.email ? `<p><strong>Email:</strong> ${details.email}</p>` : ''}
                        ${details.priority ? `<p><strong>Priority:</strong> ${details.priority}</p>` : ''}
                    </div>
                `,
                icon: 'success',
                confirmButtonText: 'OK',
                confirmButtonColor: '#006400',
                width: '500px'
            }).then(() => {
                if (details.callback && typeof details.callback === 'function') {
                    details.callback();
                }
            });
        } else {
            Swal.fire({
                title: title,
                text: message,
                icon: 'error',
                confirmButtonText: 'OK',
                confirmButtonColor: '#d33'
            }).then(() => {
                if (details.callback && typeof details.callback === 'function') {
                    details.callback();
                }
            });
        }
    } else {
        // Fallback to simple custom popup if SweetAlert2 is not loaded
        const popupHtml = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
            ">
                <div style="
                    background: white;
                    padding: 30px;
                    border-radius: 10px;
                    max-width: 500px;
                    width: 90%;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                ">
                    <h3 style="color: ${type === 'success' ? '#006400' : '#d33'}; margin-top: 0;">
                        ${title}
                    </h3>
                    <p>${message}</p>
                    ${details.reference ? `<p><strong>Reference Number:</strong> ${details.reference}</p>` : ''}
                    ${details.email ? `<p><strong>Email:</strong> ${details.email}</p>` : ''}
                    ${details.priority ? `<p><strong>Priority:</strong> ${details.priority}</p>` : ''}
                    <button onclick="this.parentElement.parentElement.remove(); ${details.callback ? 'details.callback()' : ''}" 
                            style="
                                background: ${type === 'success' ? '#006400' : '#d33'};
                                color: white;
                                border: none;
                                padding: 10px 20px;
                                border-radius: 5px;
                                cursor: pointer;
                                margin-top: 20px;
                            ">
                        OK
                    </button>
                </div>
            </div>
        `;
        
        const popupDiv = document.createElement('div');
        popupDiv.innerHTML = popupHtml;
        document.body.appendChild(popupDiv);
    }
}