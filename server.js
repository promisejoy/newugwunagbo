const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");
const multer = require("multer");
const fs = require("fs");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { body, validationResult } = require("express-validator");
require("dotenv").config();
const cloudinary = require('cloudinary').v2;

const app = express();
const PORT = process.env.PORT || 3000;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Security Middleware
app.use(helmet());
app.use(cors());

// Body parsing middleware
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));
app.use(express.static(path.join(__dirname, "public")));

// Enhanced file filter for security
const fileFilter = function (req, file, cb) {
  const allowedImageTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
  ];
  const allowedVideoTypes = ["video/mp4", "video/mpeg", "video/quicktime"];

  if (
    allowedImageTypes.includes(file.mimetype) ||
    allowedVideoTypes.includes(file.mimetype)
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only images (JPEG, PNG, GIF, WebP) and videos (MP4, MPEG, MOV) are allowed!"
      ),
      false
    );
  }
};

// Configure multer for file uploads (temporary storage for Cloudinary)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadsDir = path.join(__dirname, "temp_uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const filename = file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname);
    cb(null, filename);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: fileFilter,
});

// MySQL Database Connection with better error handling
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "ugwunagbo",
  charset: "utf8mb4",
  connectTimeout: 60000,
  acquireTimeout: 60000,
  timeout: 60000,
};

// Create connection pool with better error handling
const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 20,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

// Initialize database with retry logic
const initializeDatabaseWithRetry = async (retries = 3, delay = 2000) => {
  for (let i = 0; i < retries; i++) {
    try {
      await initializeDatabase();
      console.log("✅ Database initialized successfully");
      break;
    } catch (error) {
      console.log(
        `Database connection attempt ${i + 1} failed:`,
        error.message
      );
      if (i === retries - 1) {
        console.log(
          "💡 The website will still run, but admin features may not work"
        );
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

async function initializeDatabase() {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log("✅ Database connection successful!");

    // Create governor table
    await connection.execute(`
            CREATE TABLE IF NOT EXISTS governor (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                image VARCHAR(500),
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

    // Create video table
    await connection.execute(`
            CREATE TABLE IF NOT EXISTS video (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(500) NOT NULL,
                description TEXT,
                video VARCHAR(500),
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `);

    // Create villages table
    await connection.execute(`
           CREATE TABLE IF NOT EXISTS villages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted TINYINT(1) DEFAULT 0,
    deleted_at TIMESTAMP NULL
);
        `);

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

    // Create events table
    await connection.execute(`
                CREATE TABLE IF NOT EXISTS events (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(500) NOT NULL,
                category VARCHAR(100) NOT NULL,
                description TEXT NOT NULL,
                date DATE NOT NULL,
                time VARCHAR(50),
                location VARCHAR(255) NOT NULL,
                organizer VARCHAR(255),
                image VARCHAR(500),
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

    // Create support_requests table
    await connection.execute(`
            CREATE TABLE IF NOT EXISTS support_requests (
                id INT AUTO_INCREMENT PRIMARY KEY,
                fullName VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                phone VARCHAR(50),
                village VARCHAR(255) NOT NULL,
                issueType VARCHAR(100) NOT NULL,
                priority VARCHAR(50) NOT NULL,
                subject VARCHAR(500) NOT NULL,
                description TEXT NOT NULL,
                suggestions TEXT,
                date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                status VARCHAR(50) DEFAULT 'pending'
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

    // Insert default admin user with environment variables
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    await connection.execute(`
            INSERT IGNORE INTO admin (username, password) 
            VALUES (?, ?)
        `, [adminUsername, adminPassword]);
  } catch (error) {
    console.log("⚠️  Database initialization error:", error.message);
    throw error;
  } finally {
    if (connection) connection.release();
  }
}

// Input validation middleware
const validateContact = [
  body("name").notEmpty().trim().escape().isLength({ min: 2, max: 255 }),
  body("email").isEmail().normalizeEmail(),
  body("subject").notEmpty().trim().escape().isLength({ min: 5, max: 500 }),
  body("message").notEmpty().trim().escape().isLength({ min: 10 }),
];

const validateSupport = [
  body("fullName").notEmpty().trim().escape().isLength({ min: 2, max: 255 }),
  body("email").isEmail().normalizeEmail(),
  body("phone").optional({ checkFalsy: true }).isMobilePhone(),
  body("village").notEmpty().trim().escape(),
  body("issueType").notEmpty().trim().escape(),
  body("priority").notEmpty().trim().escape(),
  body("subject").notEmpty().trim().escape().isLength({ min: 5, max: 500 }),
  body("description").notEmpty().trim().escape().isLength({ min: 10 }),
  body("suggestions").optional({ checkFalsy: true }).trim().escape(),
];

// API Routes

// Events API Routes
app.get("/api/events", async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM events ORDER BY date ASC");
    res.json(rows);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

app.post(
  "/api/events",
  upload.single("image"),
  [
    body("title").notEmpty().trim().escape().isLength({ min: 5, max: 500 }),
    body("category").notEmpty().trim().escape(),
    body("description").notEmpty().trim().escape().isLength({ min: 10 }),
    body("date").isDate(),
    body("time").optional().trim().escape(),
    body("location").notEmpty().trim().escape(),
    body("organizer").optional().trim().escape(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, category, description, date, time, location, organizer } = req.body;

      let imageUrl = null;
      if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'ugwunagbo/events'
        });
        imageUrl = result.secure_url;
        // Clean up temporary file
        fs.unlinkSync(req.file.path);
      }

      const [result] = await pool.execute(
        "INSERT INTO events (title, category, description, date, time, location, organizer, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [
          title.trim(),
          category.trim(),
          description.trim(),
          date,
          time,
          location.trim(),
          organizer?.trim(),
          imageUrl,
        ]
      );

      res.json({ id: result.insertId, message: "Event added successfully" });
    } catch (error) {
      console.error("Error adding event:", error);
      res.status(500).json({ error: "Failed to add event" });
    }
  }
);

app.put(
  "/api/events/:id",
  upload.single("image"),
  [
    body("title").notEmpty().trim().escape().isLength({ min: 5, max: 500 }),
    body("category").notEmpty().trim().escape(),
    body("description").notEmpty().trim().escape().isLength({ min: 10 }),
    body("date").isDate(),
    body("time").optional().trim().escape(),
    body("location").notEmpty().trim().escape(),
    body("organizer").optional().trim().escape(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { title, category, description, date, time, location, organizer } = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({ error: "Valid event ID is required" });
      }

      let imageUrl = null;
      if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'ugwunagbo/events'
        });
        imageUrl = result.secure_url;
        // Clean up temporary file
        fs.unlinkSync(req.file.path);
      }

      if (imageUrl) {
        await pool.execute(
          "UPDATE events SET title=?, category=?, description=?, date=?, time=?, location=?, organizer=?, image=? WHERE id=?",
          [
            title.trim(),
            category.trim(),
            description.trim(),
            date,
            time,
            location.trim(),
            organizer?.trim(),
            imageUrl,
            id,
          ]
        );
      } else {
        await pool.execute(
          "UPDATE events SET title=?, category=?, description=?, date=?, time=?, location=?, organizer=? WHERE id=?",
          [
            title.trim(),
            category.trim(),
            description.trim(),
            date,
            time,
            location.trim(),
            organizer?.trim(),
            id,
          ]
        );
      }

      res.json({ message: "Event updated successfully" });
    } catch (error) {
      console.error("Error updating event:", error);
      res.status(500).json({ error: "Failed to update event" });
    }
  }
);

app.delete("/api/events/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: "Valid event ID is required" });
    }

    await pool.execute("DELETE FROM events WHERE id=?", [id]);
    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ error: "Failed to delete event" });
  }
});

// Governor Routes
app.get("/api/governor", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM governor ORDER BY updated_at DESC LIMIT 1"
    );
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.json({});
    }
  } catch (error) {
    console.error("Error fetching governor:", error);
    res.status(500).json({ error: "Failed to fetch governor" });
  }
});

app.put("/api/governor", upload.single("image"), async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: "Name is required" });
    }

    let imageUrl = null;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'ugwunagbo/governor'
      });
      imageUrl = result.secure_url;
      // Clean up temporary file
      fs.unlinkSync(req.file.path);
    }

    // Check if governor exists
    const [existing] = await pool.execute("SELECT * FROM governor");

    if (existing.length > 0) {
      if (imageUrl) {
        await pool.execute("UPDATE governor SET name=?, image=?", [
          name.trim(),
          imageUrl,
        ]);
      } else {
        await pool.execute("UPDATE governor SET name=?", [name.trim()]);
      }
    } else {
      await pool.execute("INSERT INTO governor (name, image) VALUES (?, ?)", [
        name.trim(),
        imageUrl,
      ]);
    }

    res.json({ message: "Governor updated successfully" });
  } catch (error) {
    console.error("Error updating governor:", error);
    res.status(500).json({ error: "Failed to update governor" });
  }
});

// Video Routes
app.get("/api/video", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM video ORDER BY updated_at DESC LIMIT 1"
    );
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.json({});
    }
  } catch (error) {
    console.error("Error fetching video:", error);
    res.status(500).json({ error: "Failed to fetch video" });
  }
});

app.put("/api/video", upload.single("video"), async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title || title.trim().length === 0) {
      return res.status(400).json({ error: "Title is required" });
    }

    let videoUrl = null;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'ugwunagbo/videos',
        resource_type: 'video'
      });
      videoUrl = result.secure_url;
      // Clean up temporary file
      fs.unlinkSync(req.file.path);
    }

    // Check if video exists
    const [existing] = await pool.execute("SELECT * FROM video");

    if (existing.length > 0) {
      if (videoUrl) {
        await pool.execute("UPDATE video SET title=?, description=?, video=?", [
          title.trim(),
          description?.trim(),
          videoUrl,
        ]);
      } else {
        await pool.execute("UPDATE video SET title=?, description=?", [
          title.trim(),
          description?.trim(),
        ]);
      }
    } else {
      await pool.execute(
        "INSERT INTO video (title, description, video) VALUES (?, ?, ?)",
        [title.trim(), description?.trim(), videoUrl]
      );
    }

    res.json({ message: "Video updated successfully" });
  } catch (error) {
    console.error("Error updating video:", error);
    res.status(500).json({ error: "Failed to update video" });
  }
});

// Villages Routes
app.get("/api/villages", async (req, res) => {
  try {
    console.log("📋 Fetching villages...");
    const [rows] = await pool.execute(
      "SELECT * FROM villages WHERE is_deleted = 0 ORDER BY name ASC"
    );
    console.log(`✅ Found ${rows.length} active villages`);
    res.json(rows);
  } catch (error) {
    console.error("❌ Error fetching villages:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch villages" 
    });
  }
});

app.post(
  "/api/villages",
  [
    body("name").notEmpty().trim().escape().isLength({ min: 2, max: 255 }),
    body("description").optional().trim().escape(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, description } = req.body;

      console.log("Adding village:", name);

      const [result] = await pool.execute(
        "INSERT INTO villages (name, description) VALUES (?, ?)",
        [name.trim(), description?.trim() || ""]
      );

      res.json({ id: result.insertId, message: "Village added successfully" });
    } catch (error) {
      console.error("Error adding village:", error);
      res.status(500).json({ error: "Failed to add village" });
    }
  }
);

app.delete("/api/villages/:id", async (req, res) => {
  try {
    const { id } = req.params;

    console.log("🚨 DELETE VILLAGE REQUEST - ID:", id);

    if (!id || isNaN(id)) {
      console.log("❌ Invalid village ID:", id);
      return res.status(400).json({ 
        success: false,
        error: "Valid village ID is required" 
      });
    }

    const [existingVillage] = await pool.execute(
      "SELECT * FROM villages WHERE id = ?", 
      [id]
    );

    console.log("🔍 Village found:", existingVillage[0]);

    if (existingVillage.length === 0) {
      console.log("❌ Village not found with ID:", id);
      return res.status(404).json({ 
        success: false,
        error: "Village not found" 
      });
    }

    const [result] = await pool.execute(
      "DELETE FROM villages WHERE id = ?", 
      [id]
    );

    console.log("✅ DELETE result:", result);

    if (result.affectedRows === 0) {
      console.log("❌ No rows affected - village not deleted");
      return res.status(404).json({ 
        success: false,
        error: "Village not found or already deleted" 
      });
    }

    console.log("✅ Village deleted successfully, affected rows:", result.affectedRows);
    
    res.json({ 
      success: true,
      message: "Village deleted successfully",
      deletedId: parseInt(id)
    });
    
  } catch (error) {
    console.error("❌ SERVER ERROR deleting village:", error);
    res.status(500).json({ 
      success: false,
      error: "Failed to delete village",
      details: error.message 
    });
  }
});

// Leaders Routes
app.get("/api/leaders", async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM leaders ORDER BY id DESC");
    res.json(rows);
  } catch (error) {
    console.error("Error fetching leaders:", error);
    res.status(500).json({ error: "Failed to fetch leaders" });
  }
});

app.post(
  "/api/leaders",
  upload.single("image"),
  [
    body("name").notEmpty().trim().escape().isLength({ min: 2, max: 255 }),
    body("position").notEmpty().trim().escape().isLength({ min: 2, max: 255 }),
    body("bio").notEmpty().trim().escape().isLength({ min: 10 }),
    body("email").optional().isEmail().normalizeEmail(),
    body("phone").optional().isMobilePhone(),
    body("twitter").optional().isURL(),
    body("facebook").optional().isURL(),
    body("linkedin").optional().isURL(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, position, bio, email, phone, twitter, facebook, linkedin } = req.body;

      let imageUrl = null;
      if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'ugwunagbo/leaders'
        });
        imageUrl = result.secure_url;
        // Clean up temporary file
        fs.unlinkSync(req.file.path);
      }

      const [result] = await pool.execute(
        "INSERT INTO leaders (name, position, bio, image, email, phone, twitter, facebook, linkedin) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          name.trim(),
          position.trim(),
          bio.trim(),
          imageUrl,
          email,
          phone,
          twitter,
          facebook,
          linkedin,
        ]
      );

      res.json({ id: result.insertId, message: "Leader added successfully" });
    } catch (error) {
      console.error("Error adding leader:", error);
      res.status(500).json({ error: "Failed to add leader" });
    }
  }
);

app.put(
  "/api/leaders/:id",
  upload.single("image"),
  [
    body("name").notEmpty().trim().escape().isLength({ min: 2, max: 255 }),
    body("position").notEmpty().trim().escape().isLength({ min: 2, max: 255 }),
    body("bio").notEmpty().trim().escape().isLength({ min: 10 }),
    body("email").optional().isEmail().normalizeEmail(),
    body("phone").optional().isMobilePhone(),
    body("twitter").optional().isURL(),
    body("facebook").optional().isURL(),
    body("linkedin").optional().isURL(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { name, position, bio, email, phone, twitter, facebook, linkedin } = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({ error: "Valid leader ID is required" });
      }

      let imageUrl = null;
      if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'ugwunagbo/leaders'
        });
        imageUrl = result.secure_url;
        // Clean up temporary file
        fs.unlinkSync(req.file.path);
      }

      if (imageUrl) {
        await pool.execute(
          "UPDATE leaders SET name=?, position=?, bio=?, image=?, email=?, phone=?, twitter=?, facebook=?, linkedin=? WHERE id=?",
          [
            name.trim(),
            position.trim(),
            bio.trim(),
            imageUrl,
            email,
            phone,
            twitter,
            facebook,
            linkedin,
            id,
          ]
        );
      } else {
        await pool.execute(
          "UPDATE leaders SET name=?, position=?, bio=?, email=?, phone=?, twitter=?, facebook=?, linkedin=? WHERE id=?",
          [
            name.trim(),
            position.trim(),
            bio.trim(),
            email,
            phone,
            twitter,
            facebook,
            linkedin,
            id,
          ]
        );
      }

      res.json({ message: "Leader updated successfully" });
    } catch (error) {
      console.error("Error updating leader:", error);
      res.status(500).json({ error: "Failed to update leader" });
    }
  }
);

app.delete("/api/leaders/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: "Valid leader ID is required" });
    }

    await pool.execute("DELETE FROM leaders WHERE id=?", [id]);
    res.json({ message: "Leader deleted successfully" });
  } catch (error) {
    console.error("Error deleting leader:", error);
    res.status(500).json({ error: "Failed to delete leader" });
  }
});

// News Routes
app.get("/api/news", async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM news ORDER BY date DESC");
    res.json(rows);
  } catch (error) {
    console.error("Error fetching news:", error);
    res.status(500).json({ error: "Failed to fetch news" });
  }
});

app.post(
  "/api/news",
  upload.single("image"),
  [
    body("title").notEmpty().trim().escape().isLength({ min: 5, max: 500 }),
    body("content").notEmpty().trim().escape().isLength({ min: 10 }),
    body("date").isDate(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { title, content, date } = req.body;

      let imageUrl = null;
      if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'ugwunagbo/news'
        });
        imageUrl = result.secure_url;
        // Clean up temporary file
        fs.unlinkSync(req.file.path);
      }

      const [result] = await pool.execute(
        "INSERT INTO news (title, content, image, date) VALUES (?, ?, ?, ?)",
        [title.trim(), content.trim(), imageUrl, date]
      );

      res.json({ id: result.insertId, message: "News added successfully" });
    } catch (error) {
      console.error("Error adding news:", error);
      res.status(500).json({ error: "Failed to add news" });
    }
  }
);

app.put(
  "/api/news/:id",
  upload.single("image"),
  [
    body("title").notEmpty().trim().escape().isLength({ min: 5, max: 500 }),
    body("content").notEmpty().trim().escape().isLength({ min: 10 }),
    body("date").isDate(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { title, content, date } = req.body;

      if (!id || isNaN(id)) {
        return res.status(400).json({ error: "Valid news ID is required" });
      }

      let imageUrl = null;
      if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: 'ugwunagbo/news'
        });
        imageUrl = result.secure_url;
        // Clean up temporary file
        fs.unlinkSync(req.file.path);
      }

      if (imageUrl) {
        await pool.execute(
          "UPDATE news SET title=?, content=?, image=?, date=? WHERE id=?",
          [title.trim(), content.trim(), imageUrl, date, id]
        );
      } else {
        await pool.execute(
          "UPDATE news SET title=?, content=?, date=? WHERE id=?",
          [title.trim(), content.trim(), date, id]
        );
      }

      res.json({ message: "News updated successfully" });
    } catch (error) {
      console.error("Error updating news:", error);
      res.status(500).json({ error: "Failed to update news" });
    }
  }
);

app.delete("/api/news/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res.status(400).json({ error: "Valid news ID is required" });
    }

    await pool.execute("DELETE FROM news WHERE id=?", [id]);
    res.json({ message: "News deleted successfully" });
  } catch (error) {
    console.error("Error deleting news:", error);
    res.status(500).json({ error: "Failed to delete news" });
  }
});

// Contacts Routes
app.get("/api/contacts", async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM contacts ORDER BY date DESC LIMIT 5"
    );
    res.json(rows);
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({ error: "Failed to fetch contacts" });
  }
});

app.post("/api/contacts", validateContact, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, subject, message } = req.body;

    const [result] = await pool.execute(
      "INSERT INTO contacts (name, email, subject, message) VALUES (?, ?, ?, ?)",
      [name.trim(), email, subject.trim(), message.trim()]
    );

    res.json({
      id: result.insertId,
      message: "Contact request submitted successfully",
    });
  } catch (error) {
    console.error("Error submitting contact:", error);
    res.status(500).json({ error: "Failed to submit contact request" });
  }
});

// Support API Routes
app.get("/api/support", async (req, res) => {
  try {
    console.log("📦 Fetching support requests from database...");
    const [rows] = await pool.execute(
      "SELECT * FROM support_requests ORDER BY date DESC"
    );
    console.log(`✅ Found ${rows.length} support requests`);

    res.json(rows);
  } catch (error) {
    console.error("❌ Error fetching support requests:", error);
    res.status(500).json({
      error: "Failed to fetch support requests",
      details: error.message,
    });
  }
});

app.post(
  "/api/support",
  [
    body("fullName").notEmpty().trim().escape().isLength({ min: 2, max: 255 }),
    body("email").isEmail().normalizeEmail(),
    body("phone").optional({ checkFalsy: true }).isMobilePhone(),
    body("village").notEmpty().trim().escape(),
    body("issueType").notEmpty().trim().escape(),
    body("priority").notEmpty().trim().escape(),
    body("subject").notEmpty().trim().escape().isLength({ min: 5, max: 500 }),
    body("description").notEmpty().trim().escape().isLength({ min: 10 }),
    body("suggestions").optional({ checkFalsy: true }).trim().escape(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        fullName,
        email,
        phone,
        village,
        issueType,
        priority,
        subject,
        description,
        suggestions,
      } = req.body;

      console.log("📨 Processing support request:", {
        fullName,
        email,
        village,
        issueType,
        priority,
        subject,
      });

      const [result] = await pool.execute(
        `INSERT INTO support_requests 
            (fullName, email, phone, village, issueType, priority, subject, description, suggestions, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
        [
          fullName.trim(),
          email.trim(),
          phone ? phone.trim() : null,
          village.trim(),
          issueType.trim(),
          priority.trim(),
          subject.trim(),
          description.trim(),
          suggestions ? suggestions.trim() : null,
        ]
      );

      console.log("✅ Support request saved with ID:", result.insertId);

      res.json({
        success: true,
        id: result.insertId,
        message: "Support request submitted successfully",
        reference: `SR-${result.insertId.toString().padStart(6, "0")}`,
      });
    } catch (error) {
      console.error("❌ Error submitting support request:", error);
      res.status(500).json({
        error: "Failed to submit support request",
        details: error.message,
      });
    }
  }
);

// Update support request status
app.put(
  "/api/support/:id/status",
  [body("status").isIn(["pending", "resolved"])],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { id } = req.params;
      const { status } = req.body;

      if (!id || isNaN(id)) {
        return res
          .status(400)
          .json({ error: "Valid support request ID is required" });
      }

      await pool.execute(
        "UPDATE support_requests SET status = ? WHERE id = ?",
        [status, id]
      );

      res.json({ message: "Support request status updated successfully" });
    } catch (error) {
      console.error("Error updating support request status:", error);
      res
        .status(500)
        .json({ error: "Failed to update support request status" });
    }
  }
);

// Delete support request
app.delete("/api/support/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(id)) {
      return res
        .status(400)
        .json({ error: "Valid support request ID is required" });
    }

    await pool.execute("DELETE FROM support_requests WHERE id = ?", [id]);
    res.json({ message: "Support request deleted successfully" });
  } catch (error) {
    console.error("Error deleting support request:", error);
    res.status(500).json({ error: "Failed to delete support request" });
  }
});

// Admin login with plain text password
app.post(
  "/api/admin/login",
  [body("username").notEmpty().trim().escape(), body("password").notEmpty()],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { username, password } = req.body;

      const [rows] = await pool.execute(
        "SELECT * FROM admin WHERE username = ? AND password = ?",
        [username, password]
      );

      if (rows.length > 0) {
        res.json({ success: true, message: "Login successful" });
      } else {
        res.status(401).json({ success: false, error: "Invalid credentials" });
      }
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  }
);

// Single password change route with plain text
app.put(
  "/api/admin/password",
  [
    body("currentPassword").notEmpty(),
    body("newPassword").isLength({ min: 8 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { currentPassword, newPassword } = req.body;

      // Get admin user
      const [admin] = await pool.execute(
        "SELECT * FROM admin WHERE username = ? AND password = ?",
        ["admin", currentPassword]
      );

      if (admin.length === 0) {
        return res.status(401).json({ error: "Current password is incorrect" });
      }

      // Update password
      await pool.execute("UPDATE admin SET password = ? WHERE username = ?", [
        newPassword,
        "admin",
      ]);

      res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Error updating password:", error);
      res.status(500).json({ error: "Failed to update password" });
    }
  }
);

// Serve the main page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Global error handling middleware
app.use((error, req, res, next) => {
  console.error("Unhandled Error:", error);
  res.status(500).json({
    error: "Something went wrong!",
    ...(process.env.NODE_ENV === "development" && { details: error.message }),
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// DEBUG ROUTES - Add these to diagnose the issue
app.get('/api/debug/database', async (req, res) => {
  try {
    const [admin] = await pool.execute("SELECT * FROM admin");
    const [tables] = await pool.execute("SHOW TABLES");
    
    res.json({
      database_connected: true,
      tables: tables,
      admin_users: admin,
      admin_count: admin.length,
      env_vars: {
        DB_HOST: process.env.DB_HOST ? 'Set' : 'Not set',
        DB_USER: process.env.DB_USER ? 'Set' : 'Not set', 
        DB_NAME: process.env.DB_NAME ? 'Set' : 'Not set'
      }
    });
  } catch (error) {
    res.json({
      database_connected: false,
      error: error.message,
      env_vars: {
        DB_HOST: process.env.DB_HOST ? 'Set' : 'Not set',
        DB_USER: process.env.DB_USER ? 'Set' : 'Not set',
        DB_NAME: process.env.DB_NAME ? 'Set' : 'Not set'
      }
    });
  }
});

// Force create admin user
app.post('/api/debug/create-admin', async (req, res) => {
  try {
    const adminUsername = 'admin';
    const adminPassword = 'admin123';
    
    // First delete any existing admin
    await pool.execute("DELETE FROM admin WHERE username = ?", [adminUsername]);
    
    // Create new admin
    await pool.execute(
      "INSERT INTO admin (username, password) VALUES (?, ?)",
      [adminUsername, adminPassword]
    );
    
    res.json({ 
      success: true, 
      message: 'Admin user created successfully',
      username: adminUsername,
      password: adminPassword
    });
  } catch (error) {
    res.json({ 
      success: false, 
      error: error.message 
    });
  }
});
// Initialize database and start server
initializeDatabaseWithRetry().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`🔐 Admin login: username: ${process.env.ADMIN_USERNAME || 'admin'}, password: ${process.env.ADMIN_PASSWORD ? '***' : 'admin123'}`);
    console.log(`☁️  Cloudinary configured for folder: ugwunagbo`);
  });
});