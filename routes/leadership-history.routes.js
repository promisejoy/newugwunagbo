// routes/leadership-history.routes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { ObjectId } = require('mongodb');

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = path.join(__dirname, '../public/uploads/leadership-history');
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'leader-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only images are allowed'));
        }
    }
});

// GET all leadership history
router.get('/', async (req, res) => {
    try {
        const db = req.app.locals.db;
        if (!db) {
            return res.status(503).json({
                success: false,
                error: "Database not available"
            });
        }
        
        const leaders = await db.collection('leadership_history')
            .find({})
            .sort({ order: 1, createdAt: -1 })
            .toArray();
            
        res.json({
            success: true,
            data: leaders,
            count: leaders.length
        });
    } catch (error) {
        console.error('Error fetching leadership history:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch leadership history'
        });
    }
});

// GET single leader by ID
router.get('/:id', async (req, res) => {
    try {
        const db = req.app.locals.db;
        if (!db) {
            return res.status(503).json({
                success: false,
                error: "Database not available"
            });
        }
        
        const { id } = req.params;
        
        if (!id) {
            return res.status(400).json({
                success: false,
                error: 'Leader ID is required'
            });
        }
        
        const leader = await db.collection('leadership_history').findOne({ 
            _id: new ObjectId(id) 
        });
        
        if (!leader) {
            return res.status(404).json({
                success: false,
                error: 'Leader not found'
            });
        }
        
        res.json({
            success: true,
            data: leader
        });
    } catch (error) {
        console.error('Error fetching leader:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch leader'
        });
    }
});

// POST create new leader
router.post('/', upload.single('image'), async (req, res) => {
    try {
        console.log('Received leader data:', req.body);
        console.log('Uploaded file:', req.file);
        
        const db = req.app.locals.db;
        if (!db) {
            return res.status(503).json({
                success: false,
                error: "Database not available"
            });
        }
        
        const { name, village, position, period, achievements, order } = req.body;
        
        // Validate required fields
        if (!name || !village || !position || !period) {
            return res.status(400).json({
                success: false,
                error: 'Name, village, position, and period are required'
            });
        }
        
        // Prepare leader data
        const leaderData = {
            name: name.trim(),
            village: village.trim(),
            position: position.trim(),
            period: period.trim(),
            achievements: achievements ? achievements.trim() : '',
            order: order ? parseInt(order) : 0,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        // Add image path if uploaded
        if (req.file) {
            leaderData.image = `/uploads/leadership-history/${req.file.filename}`;
        }
        
        console.log('Creating leader with data:', leaderData);
        
        // Create new leader
        const result = await db.collection('leadership_history').insertOne(leaderData);
        
        console.log('Leader created successfully:', result.insertedId);
        
        res.status(201).json({
            success: true,
            message: 'Leader added successfully',
            data: { ...leaderData, _id: result.insertedId }
        });
        
    } catch (error) {
        console.error('Error creating leader:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to add leader',
            details: error.message
        });
    }
});

// PUT update leader
router.put('/:id', upload.single('image'), async (req, res) => {
    try {
        const db = req.app.locals.db;
        if (!db) {
            return res.status(503).json({
                success: false,
                error: "Database not available"
            });
        }
        
        const { id } = req.params;
        const { name, village, position, period, achievements, order } = req.body;
        
        if (!id) {
            return res.status(400).json({
                success: false,
                error: 'Leader ID is required'
            });
        }
        
        // Find existing leader
        const leader = await db.collection('leadership_history').findOne({ 
            _id: new ObjectId(id) 
        });
        
        if (!leader) {
            return res.status(404).json({
                success: false,
                error: 'Leader not found'
            });
        }
        
        // Prepare update data
        const updateData = {
            name: name ? name.trim() : leader.name,
            village: village ? village.trim() : leader.village,
            position: position ? position.trim() : leader.position,
            period: period ? period.trim() : leader.period,
            achievements: achievements !== undefined ? achievements.trim() : leader.achievements,
            order: order ? parseInt(order) : leader.order,
            updatedAt: new Date()
        };
        
        // Update image if new one uploaded
        if (req.file) {
            // Delete old image if exists
            if (leader.image) {
                const oldImagePath = path.join(__dirname, '..', 'public', leader.image);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            updateData.image = `/uploads/leadership-history/${req.file.filename}`;
        }
        
        const result = await db.collection('leadership_history').updateOne(
            { _id: new ObjectId(id) },
            { $set: updateData }
        );
        
        if (result.matchedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'Leader not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Leader updated successfully',
            data: { ...updateData, _id: new ObjectId(id) }
        });
        
    } catch (error) {
        console.error('Error updating leader:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update leader'
        });
    }
});

// DELETE leader
router.delete('/:id', async (req, res) => {
    try {
        const db = req.app.locals.db;
        if (!db) {
            return res.status(503).json({
                success: false,
                error: "Database not available"
            });
        }
        
        const { id } = req.params;
        
        if (!id) {
            return res.status(400).json({
                success: false,
                error: 'Leader ID is required'
            });
        }
        
        const leader = await db.collection('leadership_history').findOne({ 
            _id: new ObjectId(id) 
        });
        
        if (!leader) {
            return res.status(404).json({
                success: false,
                error: 'Leader not found'
            });
        }
        
        // Delete image file if exists
        if (leader.image) {
            const imagePath = path.join(__dirname, '..', 'public', leader.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }
        
        const result = await db.collection('leadership_history').deleteOne({ 
            _id: new ObjectId(id) 
        });
        
        if (result.deletedCount === 0) {
            return res.status(404).json({
                success: false,
                error: 'Leader not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Leader deleted successfully'
        });
        
    } catch (error) {
        console.error('Error deleting leader:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete leader'
        });
    }
});

module.exports = router;