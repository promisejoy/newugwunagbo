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
    
    // ADD THIS LINE:
    initServiceTypeListener();
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
    
    // Check if DOB is required for birth-related services
    const serviceType = document.getElementById('serviceType').value;
    const birthRelatedServices = ['birth-certificate', 'local-origin'];
    const dobInput = document.getElementById('dateOfBirth');
    
    if (birthRelatedServices.includes(serviceType)) {
        if (!dobInput || !dobInput.value) {
            showError('Date of Birth is required for birth certificate and local origin applications');
            if (dobInput) dobInput.focus();
            return false;
        }
        
        // Validate DOB is not in the future
        const selectedDate = new Date(dobInput.value);
        const today = new Date();
        if (selectedDate > today) {
            showError('Date of birth cannot be in the future');
            dobInput.focus();
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
    const serviceType = document.getElementById('serviceType').value;
    const isBirthRelated = ['birth-certificate', 'local-origin'].includes(serviceType);
    const dobInput = document.getElementById('dateOfBirth');
    
    const data = {
        serviceType: serviceType,
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
    
    // Always include dateOfBirth field (even if empty)
    // This is important for the backend to know the field exists
    if (isBirthRelated && dobInput) {
        data.dateOfBirth = dobInput.value;
    } else {
        data.dateOfBirth = null; // Explicitly set to null if not required
    }
    
    console.log('Form data with DOB:', data); // Debug log
    return data;
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
    // Include date of birth in the form data
    const dobInput = document.getElementById('dateOfBirth');
    if (dobInput && dobInput.value) {
      formData.dateOfBirth = dobInput.value;
    }
    
    console.log('Submitting application with data:', formData);
    
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
    const applicationId = window.currentApplicationId;

    // Validate form
    if (!paymentMethod || !transactionId || !amount || !applicationId) {
        showError('Please fill in all payment details');
        return;
    }

    // Validate amount
    if (parseFloat(amount) < 5000) {
        showError('Amount must be at least ₦5,000');
        return;
    }

    // Show loading
    showLoading(true);
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<div class="loading-spinner"></div> Confirming Payment...';

    try {
        // Prepare payment data
        const paymentData = {
            applicationId: applicationId,
            paymentMethod: paymentMethod,
            transactionId: transactionId.trim(),
            amount: parseFloat(amount)
        };

        console.log('Submitting payment:', paymentData);

        // Send payment confirmation to server
        const response = await fetch('/api/service-applications/payments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(paymentData)
        });

        const result = await response.json();
        
        console.log('Payment response:', result);

        if (!response.ok) {
            throw new Error(result.error || 'Failed to confirm payment');
        }

        // Show success message
        showSweetPopup('success', 'Payment Confirmed!', 
            `✅ Your payment has been submitted successfully!\n\nTransaction ID: ${transactionId}\nAmount: ₦${amount}\n\nThe admin has been notified and will verify your payment.`, {
                callback: () => {
                    showPaymentStatus('submitted');
                }
            }
        );

    } catch (error) {
        console.error('Payment confirmation error:', error);
        
        showSweetPopup('error', 'Payment Failed!', 
            `❌ Failed to submit payment: ${error.message}\n\nPlease try again or contact support.`, {
                callback: () => {
                    console.log('🔄 User acknowledged payment error');
                }
            }
        );
    } finally {
        showLoading(false);
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-check-circle"></i> Confirm Payment Made';
    }
}
// Fallback payment method
async function tryFallbackPayment(paymentData) {
    try {
        // Save payment to localStorage
        const pendingPayments = JSON.parse(localStorage.getItem('pendingPayments') || '[]');
        paymentData.id = Date.now();
        paymentData.status = 'pending_sync';
        paymentData.createdAt = new Date().toISOString();
        pendingPayments.push(paymentData);
        localStorage.setItem('pendingPayments', JSON.stringify(pendingPayments));
        
        // Save admin notification
        const notifications = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
        notifications.unshift({
            id: `payment-${paymentData.id}`,
            type: 'payment',
            title: '💰 Offline Payment Received',
            message: `Payment of ₦${paymentData.amount} for Application #${paymentData.applicationId}`,
            applicationId: paymentData.applicationId,
            amount: paymentData.amount,
            transactionId: paymentData.transactionId,
            timestamp: new Date().toISOString(),
            read: false,
            priority: 'high'
        });
        localStorage.setItem('adminNotifications', JSON.stringify(notifications));
        
        return true;
    } catch (error) {
        console.error('Fallback payment failed:', error);
        return false;
    }
}

function savePaymentToLocalStorage(paymentData, serverResponse) {
    try {
        const confirmedPayments = JSON.parse(localStorage.getItem('confirmedPayments') || '[]');
        confirmedPayments.push({
            ...paymentData,
            serverResponse: serverResponse,
            confirmedAt: new Date().toISOString()
        });
        localStorage.setItem('confirmedPayments', JSON.stringify(confirmedPayments));
    } catch (error) {
        console.error('Failed to save payment locally:', error);
    }
}
// Function to notify admin via API
async function notifyAdminOfPayment(applicationId, paymentData) {
    try {
        const notificationData = {
            type: 'payment_confirmation',
            applicationId: applicationId,
            paymentData: paymentData,
            timestamp: new Date().toISOString(),
            subject: `💰 New Payment Received for Application #${applicationId}`,
            message: `
                A new payment has been received for application #${applicationId}.
                
                Payment Details:
                - Amount: ₦${paymentData.amount.toLocaleString()}
                - Method: ${paymentData.paymentMethod}
                - Transaction ID: ${paymentData.transactionId}
                - Date: ${new Date(paymentData.paymentDate).toLocaleString()}
                
                Please check the bank account and verify the payment.
            `
        };

        const response = await fetch('/api/admin/notifications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(notificationData)
        });

        if (!response.ok) {
            throw new Error('Failed to send admin notification');
        }

        console.log('✅ Admin notified of payment');
        return true;
    } catch (error) {
        console.error('❌ Admin notification failed:', error);
        throw error;
    }
}

// Fallback notification method (email simulation)
async function fallbackAdminNotification(applicationId, paymentData) {
    console.log('🔄 Using fallback notification method');
    
    // Simulate sending email notification
    const emailContent = {
        to: 'admin@ugwunagbolga.gov.ng', // Admin email
        subject: `[URGENT] Payment Notification for Application #${applicationId}`,
        body: `
            Dear Admin,
            
            A payment has been reported for application #${applicationId}.
            
            PAYMENT DETAILS:
            -------------------------
            Application ID: ${applicationId}
            Amount: ₦${paymentData.amount.toLocaleString()}
            Payment Method: ${paymentData.paymentMethod}
            Transaction ID: ${paymentData.transactionId}
            Date/Time: ${new Date(paymentData.paymentDate).toLocaleString()}
            
            ACTION REQUIRED:
            -------------------------
            1. Check the bank account for transaction: ${paymentData.transactionId}
            2. Verify the amount: ₦${paymentData.amount.toLocaleString()}
            3. Update the application status in the admin dashboard
            4. Notify the applicant once payment is verified
            
            This is an automated notification from Ugwunagbo LGA Service Portal.
            
            Best regards,
            Service Portal System
        `
    };
    
    // Save to localStorage as backup notification
    const notifications = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
    notifications.push({
        ...emailContent,
        id: Date.now(),
        read: false,
        createdAt: new Date().toISOString()
    });
    localStorage.setItem('adminNotifications', JSON.stringify(notifications));
    
    console.log('📧 Fallback notification saved:', emailContent);
    return true;
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
    // Include date of birth in form data
    const dobInput = document.getElementById('dateOfBirth');
    if (dobInput && dobInput.value) {
      formData.dateOfBirth = dobInput.value;
    }
    
    console.log('Submitting application with data:', formData);
    
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
    throw error; // Re-throw to be caught by the caller
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


function initServiceTypeListener() {
    const serviceTypeSelect = document.getElementById('serviceType');
    const dobFieldContainer = document.getElementById('dobFieldContainer');
    
    // Check if service type is birth-related on page load
    checkAndAddDOBField();
    
    // Listen for changes in service type
    serviceTypeSelect.addEventListener('change', checkAndAddDOBField);
    
    function checkAndAddDOBField() {
        const selectedService = serviceTypeSelect.value;
        const birthRelatedServices = ['birth-certificate', 'local-origin'];
        
        if (birthRelatedServices.includes(selectedService)) {
            addDOBField();
        } else {
            removeDOBField();
        }
    }
    
    function addDOBField() {
        // Check if DOB field already exists
        if (document.getElementById('dateOfBirth')) {
            return;
        }
        
        // Create DOB field HTML
        const dobHtml = `
            <div class="form-group dob-field-container">
                <label for="dateOfBirth" class="required">
                    Date of Birth
                    <span style="font-size: 0.9rem; color: #666; font-weight: normal; margin-left: 5px;">
                        (Required for ${serviceTypeSelect.options[serviceTypeSelect.selectedIndex].text})
                    </span>
                </label>
                <input type="date" id="dateOfBirth" class="form-control" required>
                <small style="display: block; margin-top: 5px; color: #666;">
                    <i class="fas fa-info-circle"></i> This helps us process your ${serviceTypeSelect.options[serviceTypeSelect.selectedIndex].text} accurately
                </small>
            </div>
        `;
        
        // Insert DOB field after the phone number field
        dobFieldContainer.innerHTML = dobHtml;
        
        // Add some validation for date (must be in the past)
        const dobInput = document.getElementById('dateOfBirth');
        const today = new Date().toISOString().split('T')[0];
        
        // Set max date to today (can't be born in the future)
        dobInput.max = today;
        
        // Add validation
        dobInput.addEventListener('change', function() {
            const selectedDate = new Date(this.value);
            const today = new Date();
            
            if (selectedDate > today) {
                this.setCustomValidity('Date of birth cannot be in the future');
            } else {
                this.setCustomValidity('');
            }
        });
        
        // Scroll to show the new field
        setTimeout(() => {
            dobFieldContainer.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            });
        }, 300);
    }
    
    function removeDOBField() {
        dobFieldContainer.innerHTML = '';
    }
}