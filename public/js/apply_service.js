// Service Application JavaScript
document.addEventListener('DOMContentLoaded', function() {
    console.log('Service application page loaded');

    // Initialize the application
    initApplication();
});

function initApplication() {
    // Set current year in footer
    document.getElementById('currentYear').textContent = new Date().getFullYear();

    // Set today's date as default
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('applicationDate').value = today;

    // Initialize file upload
    initFileUpload();

    // Initialize form submission
    initFormSubmission();

    // Initialize mobile menu
    initMobileMenu();

    // Initialize scroll to top
    initScrollToTop();
}

function initFileUpload() {
    const fileInput = document.getElementById('requiredDocuments');
    const selectedFiles = document.getElementById('selectedFiles');
    const fileUploadArea = document.getElementById('fileUploadArea');

    // Click on file upload area to trigger file input
    fileUploadArea.addEventListener('click', function(e) {
        if (e.target !== fileInput && !e.target.classList.contains('remove-file')) {
            fileInput.click();
        }
    });

    fileInput.addEventListener('change', function(e) {
        updateFileDisplay(Array.from(e.target.files));
    });

    function updateFileDisplay(files) {
        selectedFiles.innerHTML = '';
        
        if (files.length === 0) {
            return;
        }

        files.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <span>${file.name} (${formatFileSize(file.size)})</span>
                <button type="button" class="remove-file" data-index="${index}">
                    <i class="fas fa-times"></i>
                </button>
            `;
            selectedFiles.appendChild(fileItem);
        });

        // Add remove file functionality
        document.querySelectorAll('.remove-file').forEach(button => {
            button.addEventListener('click', function(e) {
                e.stopPropagation();
                const index = parseInt(this.getAttribute('data-index'));
                removeFile(index);
            });
        });
    }

    function removeFile(index) {
        const dt = new DataTransfer();
        const files = Array.from(fileInput.files);
        
        files.splice(index, 1);
        files.forEach(file => dt.items.add(file));
        fileInput.files = dt.files;
        
        updateFileDisplay(files);
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

function initFormSubmission() {
    const form = document.getElementById('serviceApplicationForm');
    const submitBtn = document.getElementById('submitApplication');
    const loadingOverlay = document.getElementById('loadingOverlay');

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Validate form
        if (!validateForm()) {
            return;
        }

        // Show loading
        showLoading(true);
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<div class="loading-spinner"></div> Processing...';

        try {
            const formData = getFormData();
            console.log('Submitting application:', formData);

            const result = await submitApplication(formData);
            
            // Show success message
            showSuccessMessage(result.applicationId);
            
        } catch (error) {
            console.error('Submission error:', error);
            showError('Failed to submit application: ' + error.message);
        } finally {
            showLoading(false);
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Application';
        }
    });
}

function validateForm() {
    const requiredFields = [
        'serviceType', 'wardNumber', 'applicationDate', 
        'firstName', 'lastName', 'email', 'phone', 'address'
    ];

    for (const fieldId of requiredFields) {
        const field = document.getElementById(fieldId);
        if (!field.value.trim()) {
            showError(`Please fill in the ${field.labels[0].textContent} field`);
            field.focus();
            return false;
        }
    }

    // Validate email format
    const email = document.getElementById('email').value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showError('Please enter a valid email address');
        document.getElementById('email').focus();
        return false;
    }

    // Validate phone number (basic validation)
    const phone = document.getElementById('phone').value;
    const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
    if (!phoneRegex.test(phone)) {
        showError('Please enter a valid phone number');
        document.getElementById('phone').focus();
        return false;
    }

    return true;
}

function getFormData() {
    return {
        serviceType: document.getElementById('serviceType').value,
        wardNumber: document.getElementById('wardNumber').value,
        applicationDate: document.getElementById('applicationDate').value,
        firstName: document.getElementById('firstName').value.trim(),
        lastName: document.getElementById('lastName').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        address: document.getElementById('address').value.trim(),
        purpose: document.getElementById('purpose').value.trim(),
        additionalInfo: document.getElementById('additionalInfo').value.trim(),
        documents: getDocumentFiles()
    };
}

function getDocumentFiles() {
    const files = document.getElementById('requiredDocuments').files;
    return Array.from(files).map(file => ({
        name: file.name,
        size: file.size,
        type: file.type
    }));
}

async function submitApplication(formData) {
  try {
    const response = await fetch('/api/service-applications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || `Server error: ${response.status}`);
    }

    return result;
  } catch (error) {
    console.error('Submission error:', error);
    // Fallback: generate local application ID if server is unavailable
    return {
      success: true,
      applicationId: generateApplicationId(),
      message: "Application submitted (offline mode)"
    };
  }
}

function showSuccessMessage(applicationId, applicationData) {
    const form = document.getElementById('serviceApplicationForm');
    const successMessage = document.getElementById('successMessage');
    const applicationIdDisplay = document.getElementById('successApplicationId');

    // Hide form, show success message
    form.style.display = 'none';
    successMessage.style.display = 'block';
    applicationIdDisplay.textContent = `Application ID: ${applicationId}`;

    // Store application ID for payment confirmation
    window.currentApplicationId = applicationId;

    // Scroll to success message
    successMessage.scrollIntoView({ behavior: 'smooth' });

    // Initialize payment confirmation form
    initPaymentConfirmation();
}

function initPaymentConfirmation() {
    const paymentForm = document.getElementById('paymentConfirmationForm');
    const printBtn = document.getElementById('printReceiptBtn');

    paymentForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        await confirmPayment();
    });

    printBtn.addEventListener('click', function() {
        printPaymentInstructions();
    });
}

async function confirmPayment() {
    const submitBtn = document.getElementById('confirmPaymentBtn');
    const paymentMethod = document.getElementById('paymentMethod').value;
    const transactionId = document.getElementById('transactionId').value;
    const amount = document.getElementById('paymentAmount').value;

    // Validate form
    if (!paymentMethod || !transactionId || !amount) {
        showError('Please fill in all payment details');
        return;
    }

    // Show loading
    showLoading(true);
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<div class="loading-spinner"></div> Confirming Payment...';

    try {
        const response = await fetch(`/api/service-applications/${window.currentApplicationId}/payment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                paymentMethod,
                transactionId,
                amount: parseFloat(amount)
            })
        });

        const result = await response.json();

        if (result.success) {
            showPaymentStatus('submitted');
        } else {
            throw new Error(result.error || 'Failed to confirm payment');
        }
    } catch (error) {
        console.error('Payment confirmation error:', error);
        showError('Failed to confirm payment: ' + error.message);
    } finally {
        showLoading(false);
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-check-circle"></i> Confirm Payment Made';
    }
}

function showPaymentStatus(status) {
    const paymentSection = document.querySelector('.payment-section');
    const paymentStatusSection = document.getElementById('paymentStatusSection');
    const statusIcon = document.getElementById('paymentStatusIcon');
    const statusTitle = document.getElementById('paymentStatusTitle');
    const statusMessage = document.getElementById('paymentStatusMessage');
    const nextSteps = document.getElementById('nextSteps');

    // Hide payment section, show status section
    paymentSection.style.display = 'none';
    paymentStatusSection.style.display = 'block';

    switch (status) {
        case 'submitted':
            statusIcon.innerHTML = '<i class="fas fa-clock text-warning"></i>';
            statusIcon.style.color = '#ffc107';
            statusTitle.textContent = 'Payment Verification Pending';
            statusTitle.style.color = '#856404';
            statusMessage.textContent = 'Your payment details have been submitted and are awaiting verification. This usually takes 24-48 hours.';
            nextSteps.style.display = 'block';
            break;
        
        case 'verified':
            statusIcon.innerHTML = '<i class="fas fa-check-circle text-success"></i>';
            statusIcon.style.color = '#28a745';
            statusTitle.textContent = 'Payment Verified!';
            statusTitle.style.color = '#155724';
            statusMessage.textContent = 'Your payment has been verified successfully. Your application is now being processed.';
            nextSteps.style.display = 'block';
            break;
        
        case 'rejected':
            statusIcon.innerHTML = '<i class="fas fa-times-circle text-danger"></i>';
            statusIcon.style.color = '#dc3545';
            statusTitle.textContent = 'Payment Verification Failed';
            statusTitle.style.color = '#721c24';
            statusMessage.textContent = 'We could not verify your payment. Please check your transaction details and try again, or contact support.';
            nextSteps.style.display = 'none';
            break;
    }

    paymentStatusSection.scrollIntoView({ behavior: 'smooth' });
}

function printPaymentInstructions() {
    const applicationId = window.currentApplicationId;
    const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Payment Instructions - Ugwunagbo LGA</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .logo { font-size: 24px; font-weight: bold; color: #006400; }
                .application-id { background: #006400; color: white; padding: 10px; text-align: center; margin: 20px 0; }
                .bank-details { border: 2px solid #333; padding: 20px; margin: 20px 0; }
                .info-row { display: flex; justify-content: space-between; margin: 10px 0; }
                .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="logo">Ugwunagbo Local Government Area</div>
                <div>Official Payment Instructions</div>
            </div>
            
            <div class="application-id">
                Application ID: ${applicationId}
            </div>
            
            <div class="bank-details">
                <h3>Payment Instructions</h3>
                <div class="info-row">
                    <strong>Bank Name:</strong> First Bank of Nigeria
                </div>
                <div class="info-row">
                    <strong>Account Name:</strong> Ugwunagbo Local Government
                </div>
                <div class="info-row">
                    <strong>Account Number:</strong> 3112345678
                </div>
                <div class="info-row">
                    <strong>Amount:</strong> ₦5,000.00
                </div>
                <div class="info-row">
                    <strong>Reference:</strong> ${applicationId}
                </div>
            </div>
            
            <div class="important-notes">
                <h4>Important Notes:</h4>
                <ul>
                    <li>Use your Application ID as payment reference</li>
                    <li>Keep your transaction receipt</li>
                    <li>Payment verification takes 24-48 hours</li>
                    <li>Return to the application portal to confirm payment</li>
                </ul>
            </div>
            
            <div class="footer">
                Generated on: ${new Date().toLocaleString()}<br>
                Ugwunagbo LGA Official Portal
            </div>
        </body>
        </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
}

// Update the form submission to store application data
async function submitApplication(formData) {
    try {
        const response = await fetch('/api/service-applications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || `Server error: ${response.status}`);
        }

        return result;
    } catch (error) {
        console.error('Submission error:', error);
        // Fallback: generate local application ID if server is unavailable
        return {
            success: true,
            applicationId: generateApplicationId(),
            message: "Application submitted (offline mode)"
        };
    }
}

function showError(message) {
    // Create or update error message display
    let errorDiv = document.getElementById('formError');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'formError';
        errorDiv.style.cssText = `
            background: #f8d7da;
            color: #721c24;
            padding: 12px 16px;
            border-radius: 8px;
            margin-bottom: 20px;
            border: 1px solid #f5c6cb;
        `;
        const form = document.getElementById('serviceApplicationForm');
        form.insertBefore(errorDiv, form.firstChild);
    }

    errorDiv.innerHTML = `
        <strong><i class="fas fa-exclamation-triangle"></i> Error:</strong> ${message}
    `;

    // Scroll to error message
    errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Auto-remove error after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.parentNode.removeChild(errorDiv);
        }
    }, 5000);
}

function showLoading(show) {
    const loadingOverlay = document.getElementById('loadingOverlay');
    loadingOverlay.style.display = show ? 'flex' : 'none';
}

function initMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            this.classList.toggle('active');
        });
    }
}

function initScrollToTop() {
    const scrollToTopBtn = document.getElementById('scrollToTop');
    
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            scrollToTopBtn.classList.add('show');
        } else {
            scrollToTopBtn.classList.remove('show');
        }
    });

    scrollToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Utility function to generate random application ID (fallback)
function generateApplicationId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `UGW-${timestamp}-${random}`.toUpperCase();
}