// server_api_example.js - Example backend API code
// This should be integrated with your existing backend

// Handle service application submission
app.post('/api/service-applications', async (req, res) => {
    try {
        const {
            serviceType, wardNumber, applicationDate,
            firstName, lastName, email, phone, address,
            dateOfBirth, purpose, additionalInfo, documents
        } = req.body;

        console.log('Received application with DOB:', dateOfBirth); // Debug log

        // Generate application ID
        const applicationId = generateApplicationId();
        
        // Save to database
        const application = await Application.create({
            applicationId,
            serviceType,
            wardNumber,
            applicationDate,
            firstName,
            lastName,
            email,
            phone,
            address,
            dateOfBirth, // Make sure this field is saved
            purpose,
            additionalInfo,
            documents: documents || [],
            status: 'pending_payment',
            createdAt: new Date()
        });

        res.json({
            success: true,
            applicationId: application.applicationId,
            message: 'Application submitted successfully'
        });
    } catch (error) {
        console.error('Application submission error:', error);
        res.status(500).json({ 
            error: 'Failed to submit application',
            details: error.message 
        });
    }
});

// Handle payment confirmation
app.post('/api/service-applications/payments', async (req, res) => {
    try {
        const { applicationId, paymentMethod, transactionId, amount } = req.body;
        
        console.log('Payment received for:', applicationId); // Debug log

        // 1. Save payment to database
        const payment = await Payment.create({
            applicationId,
            paymentMethod,
            transactionId,
            amount: parseFloat(amount),
            status: 'pending_verification',
            paymentDate: new Date(),
            verified: false
        });

        // 2. Update application status
        await Application.updateOne(
            { applicationId },
            { 
                $set: { 
                    status: 'payment_pending',
                    paymentId: payment._id 
                } 
            }
        );

        // 3. Create admin notification
        const notification = await Notification.create({
            type: 'payment',
            title: '💰 New Payment Received',
            message: `Payment of ₦${amount} for Application #${applicationId}`,
            applicationId,
            paymentId: payment._id,
            adminId: 'all', // For all admins
            priority: 'high',
            read: false,
            createdAt: new Date()
        });

        // 4. Send email to admin (optional)
        await sendAdminEmail({
            subject: `[PAYMENT] New Payment for Application #${applicationId}`,
            html: `
                <h2>New Payment Notification</h2>
                <p><strong>Application ID:</strong> ${applicationId}</p>
                <p><strong>Amount:</strong> ₦${amount}</p>
                <p><strong>Payment Method:</strong> ${paymentMethod}</p>
                <p><strong>Transaction ID:</strong> ${transactionId}</p>
                <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
                <br/>
                <p>Please verify this payment in the bank statement and update the status in the admin dashboard.</p>
                <a href="https://yourdomain.com/admin/dashboard">Go to Admin Dashboard</a>
            `
        });

        res.json({ 
            success: true, 
            paymentId: payment._id,
            message: 'Payment confirmed and admin notified'
        });
    } catch (error) {
        console.error('Payment processing error:', error);
        res.status(500).json({ 
            error: 'Failed to process payment',
            details: error.message 
        });
    }
});

// Get all applications for admin dashboard
app.get('/api/admin/applications', async (req, res) => {
    try {
        const applications = await Application.find({})
            .sort({ createdAt: -1 })
            .select('applicationId serviceType firstName lastName email phone dateOfBirth status createdAt')
            .lean();

        // Include DOB in response
        const applicationsWithDOB = applications.map(app => ({
            ...app,
            dateOfBirth: app.dateOfBirth || 'Not provided', // Ensure DOB is included
            displayDOB: app.dateOfBirth ? new Date(app.dateOfBirth).toLocaleDateString() : 'N/A'
        }));

        res.json(applicationsWithDOB);
    } catch (error) {
        console.error('Error fetching applications:', error);
        res.status(500).json({ error: 'Failed to fetch applications' });
    }
});

// Get recent payments for admin
app.get('/api/admin/payments/recent', async (req, res) => {
    try {
        const payments = await Payment.find({})
            .sort({ paymentDate: -1 })
            .limit(20)
            .populate('applicationId', 'applicationId firstName lastName')
            .lean();

        res.json(payments);
    } catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).json({ error: 'Failed to fetch payments' });
    }
});