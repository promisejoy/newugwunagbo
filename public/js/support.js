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
                    // Success message with reference number
                    alert(`✅ Thank you! Your support request has been submitted successfully.\nReference Number: ${result.reference}\nWe will contact you at ${formData.email}`);
                    supportForm.reset();
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
                alert(`❌ Submission failed: ${error.message}`);
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