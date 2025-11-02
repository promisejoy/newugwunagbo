const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// MySQL Database Connection
// MySQL Database Connection
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'Comped@12345', // Change back to empty for XAMPP
    database: 'ugwunagbo'
};

// Create connection pool
const pool = mysql.createPool({
    ...dbConfig,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Initialize database tables
async function initializeDatabase() {
    let connection;
    try {
        connection = await pool.getConnection();
        console.log('✅ Database connection successful!');
        
        // Create leaders table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS leaders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                position VARCHAR(255) NOT NULL,
                bio TEXT NOT NULL,
                image VARCHAR(500),
                email VARCHAR(255),
                phone VARCHAR(50),
                twitter VARCHAR(500),
                facebook VARCHAR(500),
                linkedin VARCHAR(500),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create news table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS news (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(500) NOT NULL,
                content TEXT NOT NULL,
                image VARCHAR(500),
                date DATE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create contacts table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS contacts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                subject VARCHAR(500) NOT NULL,
                message TEXT NOT NULL,
                date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create admin table
        await connection.execute(`
            CREATE TABLE IF NOT EXISTS admin (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL
            )
        `);

        // Insert default admin user if not exists
        await connection.execute(`
            INSERT IGNORE INTO admin (username, password) 
            VALUES ('admin', 'admin123')
        `);

        console.log('✅ Database initialized successfully');
        
    } catch (error) {
        console.log('⚠️  Database warning:', error.message);
        console.log('💡 The website will still run, but admin features may not work');
    } finally {
        if (connection) connection.release();
    }
}

// API Routes

// Get all leaders
app.get('/api/leaders', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM leaders ORDER BY id DESC');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching leaders:', error);
        res.status(500).json({ error: 'Failed to fetch leaders' });
    }
});

// Add new leader with file upload
app.post('/api/leaders', upload.single('image'), async (req, res) => {
    try {
        const { name, position, bio, email, phone, twitter, facebook, linkedin } = req.body;
        
        let imagePath = null;
        if (req.file) {
            imagePath = '/uploads/' + req.file.filename;
        }
        
        const [result] = await pool.execute(
            'INSERT INTO leaders (name, position, bio, image, email, phone, twitter, facebook, linkedin) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [name, position, bio, imagePath, email, phone, twitter, facebook, linkedin]
        );
        
        res.json({ id: result.insertId, message: 'Leader added successfully' });
    } catch (error) {
        console.error('Error adding leader:', error);
        res.status(500).json({ error: 'Failed to add leader' });
    }
});

// Update leader with file upload
app.put('/api/leaders/:id', upload.single('image'), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, position, bio, email, phone, twitter, facebook, linkedin } = req.body;
        
        let imagePath = null;
        if (req.file) {
            imagePath = '/uploads/' + req.file.filename;
            
            // Delete old image if exists
            try {
                const [oldLeader] = await pool.execute('SELECT image FROM leaders WHERE id = ?', [id]);
                if (oldLeader[0] && oldLeader[0].image) {
                    const oldImagePath = path.join(__dirname, 'public', oldLeader[0].image);
                    if (fs.existsSync(oldImagePath)) {
                        fs.unlinkSync(oldImagePath);
                    }
                }
            } catch (deleteError) {
                console.log('Could not delete old image:', deleteError.message);
            }
        }
        
        if (imagePath) {
            await pool.execute(
                'UPDATE leaders SET name=?, position=?, bio=?, image=?, email=?, phone=?, twitter=?, facebook=?, linkedin=? WHERE id=?',
                [name, position, bio, imagePath, email, phone, twitter, facebook, linkedin, id]
            );
        } else {
            await pool.execute(
                'UPDATE leaders SET name=?, position=?, bio=?, email=?, phone=?, twitter=?, facebook=?, linkedin=? WHERE id=?',
                [name, position, bio, email, phone, twitter, facebook, linkedin, id]
            );
        }
        
        res.json({ message: 'Leader updated successfully' });
    } catch (error) {
        console.error('Error updating leader:', error);
        res.status(500).json({ error: 'Failed to update leader' });
    }
});

// Delete leader
app.delete('/api/leaders/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Delete associated image file
        try {
            const [leader] = await pool.execute('SELECT image FROM leaders WHERE id = ?', [id]);
            if (leader[0] && leader[0].image) {
                const imagePath = path.join(__dirname, 'public', leader[0].image);
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            }
        } catch (deleteError) {
            console.log('Could not delete image file:', deleteError.message);
        }
        
        await pool.execute('DELETE FROM leaders WHERE id=?', [id]);
        res.json({ message: 'Leader deleted successfully' });
    } catch (error) {
        console.error('Error deleting leader:', error);
        res.status(500).json({ error: 'Failed to delete leader' });
    }
});

// Get all news
app.get('/api/news', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM news ORDER BY date DESC');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching news:', error);
        res.status(500).json({ error: 'Failed to fetch news' });
    }
});

// Add new news with file upload
app.post('/api/news', upload.single('image'), async (req, res) => {
    try {
        const { title, content, date } = req.body;
        
        let imagePath = null;
        if (req.file) {
            imagePath = '/uploads/' + req.file.filename;
        }
        
        const [result] = await pool.execute(
            'INSERT INTO news (title, content, image, date) VALUES (?, ?, ?, ?)',
            [title, content, imagePath, date]
        );
        
        res.json({ id: result.insertId, message: 'News added successfully' });
    } catch (error) {
        console.error('Error adding news:', error);
        res.status(500).json({ error: 'Failed to add news' });
    }
});

// Update news with file upload
app.put('/api/news/:id', upload.single('image'), async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content, date } = req.body;
        
        let imagePath = null;
        if (req.file) {
            imagePath = '/uploads/' + req.file.filename;
            
            // Delete old image if exists
            try {
                const [oldNews] = await pool.execute('SELECT image FROM news WHERE id = ?', [id]);
                if (oldNews[0] && oldNews[0].image) {
                    const oldImagePath = path.join(__dirname, 'public', oldNews[0].image);
                    if (fs.existsSync(oldImagePath)) {
                        fs.unlinkSync(oldImagePath);
                    }
                }
            } catch (deleteError) {
                console.log('Could not delete old image:', deleteError.message);
            }
        }
        
        if (imagePath) {
            await pool.execute(
                'UPDATE news SET title=?, content=?, image=?, date=? WHERE id=?',
                [title, content, imagePath, date, id]
            );
        } else {
            await pool.execute(
                'UPDATE news SET title=?, content=?, date=? WHERE id=?',
                [title, content, date, id]
            );
        }
        
        res.json({ message: 'News updated successfully' });
    } catch (error) {
        console.error('Error updating news:', error);
        res.status(500).json({ error: 'Failed to update news' });
    }
});

// Delete news
app.delete('/api/news/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        // Delete associated image file
        try {
            const [newsItem] = await pool.execute('SELECT image FROM news WHERE id = ?', [id]);
            if (newsItem[0] && newsItem[0].image) {
                const imagePath = path.join(__dirname, 'public', newsItem[0].image);
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                }
            }
        } catch (deleteError) {
            console.log('Could not delete image file:', deleteError.message);
        }
        
        await pool.execute('DELETE FROM news WHERE id=?', [id]);
        res.json({ message: 'News deleted successfully' });
    } catch (error) {
        console.error('Error deleting news:', error);
        res.status(500).json({ error: 'Failed to delete news' });
    }
});

// Get contacts
app.get('/api/contacts', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM contacts ORDER BY date DESC LIMIT 5');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).json({ error: 'Failed to fetch contacts' });
    }
});

// Add contact
app.post('/api/contacts', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        
        const [result] = await pool.execute(
            'INSERT INTO contacts (name, email, subject, message) VALUES (?, ?, ?, ?)',
            [name, email, subject, message]
        );
        
        res.json({ id: result.insertId, message: 'Contact request submitted successfully' });
    } catch (error) {
        console.error('Error submitting contact:', error);
        res.status(500).json({ error: 'Failed to submit contact request' });
    }
});

// Admin login
app.post('/api/admin/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        
        const [rows] = await pool.execute(
            'SELECT * FROM admin WHERE username = ? AND password = ?',
            [username, password]
        );
        
        if (rows.length > 0) {
            res.json({ success: true, message: 'Login successful' });
        } else {
            res.status(401).json({ success: false, error: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Initialize database and start server
initializeDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
        console.log(`📁 Uploads directory: ${uploadsDir}`);
    });
});