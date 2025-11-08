const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const cors = require("cors");
const path = require("path");
const bodyParser = require("body-parser");
const multer = require("multer");
const fs = require("fs");
const helmet = require("helmet");
const { body, validationResult } = require("express-validator");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB Configuration - FIXED: Better error handling
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || "ugwunagbo_lga";
let db, client;

// Security Middleware
// Body parsing middleware
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));
app.use(express.static(path.join(__dirname, "public")));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "public", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "video/mp4",
      "video/mpeg",
      "video/quicktime",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"), false);
    }
  },
});

// MongoDB Connection
async function connectToDatabase() {
  try {
    console.log('🔗 Attempting to connect to MongoDB Atlas...');
    
    if (!MONGODB_URI) {
      console.error('❌ MONGODB_URI is not defined in environment variables');
      return null;
    }

    client = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });

    await client.connect();
    await client.db().admin().ping();
    
    db = client.db(DB_NAME);
    console.log("✅ Connected to MongoDB Atlas successfully!");
    
    await initializeCollections();
    return client;
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    console.log('💡 The website will run in limited mode (admin features disabled)');
    return null;
  }
}

// Initialize collections
async function initializeCollections() {
  try {
    const collections = [
      "governor", "video", "villages", "leaders", 
      "events", "news", "contacts", "support_requests", "admin"
    ];
    
    for (const collectionName of collections) {
      const collection = db.collection(collectionName);
      await collection.find({}).limit(1).toArray();
    }
    
    const adminCollection = db.collection("admin");
    const adminExists = await adminCollection.findOne({ username: "admin" });
    if (!adminExists) {
      await adminCollection.insertOne({
        username: process.env.ADMIN_USERNAME || "admin",
        password: process.env.ADMIN_PASSWORD || "admin123",
        createdAt: new Date()
      });
      console.log("✅ Default admin user created");
    }
    
    console.log("✅ Database initialized successfully");
  } catch (error) {
    console.log("⚠️  Database initialization warning:", error.message);
  }
}

// Database connection check middleware
app.use((req, res, next) => {
  if (!db) {
    if (req.path.startsWith('/api/') && !req.path.includes('/api/admin/login')) {
      return res.status(503).json({ 
        error: "Database not available", 
        message: "Please check your MongoDB connection" 
      });
    }
  }
  next();
});

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

// ========== API ROUTES ==========

// Governor Routes
app.get("/api/governor", async (req, res) => {
  try {
    if (!db) return res.json({});
    const governor = await db.collection("governor").findOne({});
    res.json(governor || {});
  } catch (error) {
    console.error("Error fetching governor:", error);
    res.status(500).json({ error: "Failed to fetch governor" });
  }
});

app.put("/api/governor", upload.single("image"), async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not available" });
    
    const { name } = req.body;
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: "Name is required" });
    }

    let imagePath = null;
    if (req.file) {
      imagePath = "/uploads/" + req.file.filename;
    }

    const updateData = {
      name: name.trim(),
      updatedAt: new Date()
    };

    if (imagePath) {
      updateData.image = imagePath;
    }

    await db.collection("governor").updateOne(
      {},
      { $set: updateData },
      { upsert: true }
    );

    res.json({ success: true, message: "Governor updated successfully" });
  } catch (error) {
    console.error("Error updating governor:", error);
    res.status(500).json({ error: "Failed to update governor" });
  }
});

// Video Routes
app.get("/api/video", async (req, res) => {
  try {
    if (!db) return res.json({});
    const video = await db.collection("video").findOne({});
    res.json(video || {});
  } catch (error) {
    console.error("Error fetching video:", error);
    res.status(500).json({ error: "Failed to fetch video" });
  }
});

app.put("/api/video", upload.single("video"), async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not available" });
    
    const { title, description } = req.body;

    let videoPath = null;
    if (req.file) {
      videoPath = "/uploads/" + req.file.filename;
    }

    const updateData = {
      title: title?.trim() || "Ugwunagbo Video",
      description: description?.trim() || "A video showcasing Ugwunagbo LGA",
      updatedAt: new Date()
    };

    if (videoPath) {
      updateData.video = videoPath;
    }

    await db.collection("video").updateOne(
      {},
      { $set: updateData },
      { upsert: true }
    );

    res.json({ success: true, message: "Video updated successfully" });
  } catch (error) {
    console.error("Error updating video:", error);
    res.status(500).json({ error: "Failed to update video" });
  }
});

// Villages Routes
app.get("/api/villages", async (req, res) => {
  try {
    if (!db) return res.json([]);
    const villages = await db.collection("villages").find({}).sort({ name: 1 }).toArray();
    res.json(villages);
  } catch (error) {
    console.error("Error fetching villages:", error);
    res.status(500).json({ error: "Failed to fetch villages" });
  }
});

app.post("/api/villages", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not available" });
    
    const { name, description } = req.body;

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: "Village name is required" });
    }

    const result = await db.collection("villages").insertOne({
      name: name.trim(),
      description: description?.trim() || "",
      createdAt: new Date()
    });

    res.json({ 
      success: true, 
      message: "Village added successfully",
      id: result.insertedId 
    });
  } catch (error) {
    console.error("Error adding village:", error);
    res.status(500).json({ error: "Failed to add village" });
  }
});

app.delete("/api/villages/:id", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not available" });
    
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Village ID is required" });
    }

    const result = await db.collection("villages").deleteOne({ 
      _id: new ObjectId(id) 
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Village not found" });
    }

    res.json({ success: true, message: "Village deleted successfully" });
  } catch (error) {
    console.error("Error deleting village:", error);
    res.status(500).json({ error: "Failed to delete village" });
  }
});

// Leaders Routes
app.get("/api/leaders", async (req, res) => {
  try {
    if (!db) return res.json([]);
    const leaders = await db.collection("leaders").find({}).sort({ name: 1 }).toArray();
    res.json(leaders);
  } catch (error) {
    console.error("Error fetching leaders:", error);
    res.status(500).json({ error: "Failed to fetch leaders" });
  }
});

app.post("/api/leaders", upload.single("image"), async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not available" });
    
    const { name, position, bio, email, phone, twitter, facebook, linkedin } = req.body;

    if (!name || !position || !bio) {
      return res.status(400).json({ error: "Name, position, and bio are required" });
    }

    let imagePath = null;
    if (req.file) {
      imagePath = "/uploads/" + req.file.filename;
    }

    const result = await db.collection("leaders").insertOne({
      name: name.trim(),
      position: position.trim(),
      bio: bio.trim(),
      email: email?.trim() || "",
      phone: phone?.trim() || "",
      twitter: twitter?.trim() || "",
      facebook: facebook?.trim() || "",
      linkedin: linkedin?.trim() || "",
      image: imagePath,
      createdAt: new Date()
    });

    res.json({ 
      success: true, 
      message: "Leader added successfully",
      id: result.insertedId 
    });
  } catch (error) {
    console.error("Error adding leader:", error);
    res.status(500).json({ error: "Failed to add leader" });
  }
});

app.put("/api/leaders/:id", upload.single("image"), async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not available" });
    
    const { id } = req.params;
    const { name, position, bio, email, phone, twitter, facebook, linkedin } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Leader ID is required" });
    }

    const updateData = {
      name: name?.trim(),
      position: position?.trim(),
      bio: bio?.trim(),
      email: email?.trim() || "",
      phone: phone?.trim() || "",
      twitter: twitter?.trim() || "",
      facebook: facebook?.trim() || "",
      linkedin: linkedin?.trim() || "",
      updatedAt: new Date()
    };

    if (req.file) {
      updateData.image = "/uploads/" + req.file.filename;
    }

    // Remove undefined fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const result = await db.collection("leaders").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Leader not found" });
    }

    res.json({ success: true, message: "Leader updated successfully" });
  } catch (error) {
    console.error("Error updating leader:", error);
    res.status(500).json({ error: "Failed to update leader" });
  }
});

app.delete("/api/leaders/:id", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not available" });
    
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Leader ID is required" });
    }

    const result = await db.collection("leaders").deleteOne({ 
      _id: new ObjectId(id) 
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Leader not found" });
    }

    res.json({ success: true, message: "Leader deleted successfully" });
  } catch (error) {
    console.error("Error deleting leader:", error);
    res.status(500).json({ error: "Failed to delete leader" });
  }
});

// News Routes
app.get("/api/news", async (req, res) => {
  try {
    if (!db) return res.json([]);
    const news = await db.collection("news").find({}).sort({ date: -1 }).toArray();
    res.json(news);
  } catch (error) {
    console.error("Error fetching news:", error);
    res.status(500).json({ error: "Failed to fetch news" });
  }
});

app.post("/api/news", upload.single("image"), async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not available" });
    
    const { title, content, date } = req.body;

    if (!title || !content || !date) {
      return res.status(400).json({ error: "Title, content, and date are required" });
    }

    let imagePath = null;
    if (req.file) {
      imagePath = "/uploads/" + req.file.filename;
    }

    const result = await db.collection("news").insertOne({
      title: title.trim(),
      content: content.trim(),
      date: new Date(date),
      image: imagePath,
      createdAt: new Date()
    });

    res.json({ 
      success: true, 
      message: "News added successfully",
      id: result.insertedId 
    });
  } catch (error) {
    console.error("Error adding news:", error);
    res.status(500).json({ error: "Failed to add news" });
  }
});

app.put("/api/news/:id", upload.single("image"), async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not available" });
    
    const { id } = req.params;
    const { title, content, date } = req.body;

    if (!id) {
      return res.status(400).json({ error: "News ID is required" });
    }

    const updateData = {
      title: title?.trim(),
      content: content?.trim(),
      date: date ? new Date(date) : undefined,
      updatedAt: new Date()
    };

    if (req.file) {
      updateData.image = "/uploads/" + req.file.filename;
    }

    // Remove undefined fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const result = await db.collection("news").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "News not found" });
    }

    res.json({ success: true, message: "News updated successfully" });
  } catch (error) {
    console.error("Error updating news:", error);
    res.status(500).json({ error: "Failed to update news" });
  }
});

app.delete("/api/news/:id", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not available" });
    
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "News ID is required" });
    }

    const result = await db.collection("news").deleteOne({ 
      _id: new ObjectId(id) 
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "News not found" });
    }

    res.json({ success: true, message: "News deleted successfully" });
  } catch (error) {
    console.error("Error deleting news:", error);
    res.status(500).json({ error: "Failed to delete news" });
  }
});

// Events Routes
app.get("/api/events", async (req, res) => {
  try {
    if (!db) return res.json([]);
    const events = await db.collection("events").find({}).sort({ date: 1 }).toArray();
    res.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

app.post("/api/events", upload.single("image"), async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not available" });
    
    const { title, category, description, date, time, location, organizer } = req.body;

    if (!title || !category || !description || !date || !location) {
      return res.status(400).json({ error: "Title, category, description, date, and location are required" });
    }

    let imagePath = null;
    if (req.file) {
      imagePath = "/uploads/" + req.file.filename;
    }

    const result = await db.collection("events").insertOne({
      title: title.trim(),
      category: category.trim(),
      description: description.trim(),
      date: new Date(date),
      time: time?.trim() || "",
      location: location.trim(),
      organizer: organizer?.trim() || "",
      image: imagePath,
      createdAt: new Date()
    });

    res.json({ 
      success: true, 
      message: "Event added successfully",
      id: result.insertedId 
    });
  } catch (error) {
    console.error("Error adding event:", error);
    res.status(500).json({ error: "Failed to add event" });
  }
});

app.put("/api/events/:id", upload.single("image"), async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not available" });
    
    const { id } = req.params;
    const { title, category, description, date, time, location, organizer } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Event ID is required" });
    }

    const updateData = {
      title: title?.trim(),
      category: category?.trim(),
      description: description?.trim(),
      date: date ? new Date(date) : undefined,
      time: time?.trim() || "",
      location: location?.trim(),
      organizer: organizer?.trim() || "",
      updatedAt: new Date()
    };

    if (req.file) {
      updateData.image = "/uploads/" + req.file.filename;
    }

    // Remove undefined fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    const result = await db.collection("events").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.json({ success: true, message: "Event updated successfully" });
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ error: "Failed to update event" });
  }
});

app.delete("/api/events/:id", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not available" });
    
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Event ID is required" });
    }

    const result = await db.collection("events").deleteOne({ 
      _id: new ObjectId(id) 
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    res.json({ success: true, message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ error: "Failed to delete event" });
  }
});

// Contacts Routes
app.get("/api/contacts", async (req, res) => {
  try {
    if (!db) return res.json([]);
    const contacts = await db.collection("contacts").find({})
      .sort({ date: -1 })
      .limit(50)
      .toArray();
    res.json(contacts);
  } catch (error) {
    console.error("Error fetching contacts:", error);
    res.status(500).json({ error: "Failed to fetch contacts" });
  }
});

app.post("/api/contacts", validateContact, async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not available" });
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, subject, message } = req.body;

    await db.collection("contacts").insertOne({
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim(),
      date: new Date(),
      status: "new"
    });

    res.json({ success: true, message: "Contact message submitted successfully" });
  } catch (error) {
    console.error("Error submitting contact:", error);
    res.status(500).json({ error: "Failed to submit contact message" });
  }
});

// Support Routes
app.get("/api/support", async (req, res) => {
  try {
    if (!db) return res.json([]);
    const supportRequests = await db.collection("support_requests").find({})
      .sort({ date: -1 })
      .toArray();
    res.json(supportRequests);
  } catch (error) {
    console.error("Error fetching support requests:", error);
    res.status(500).json({ error: "Failed to fetch support requests" });
  }
});

app.post("/api/support", validateSupport, async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not available" });
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { fullName, email, phone, village, issueType, priority, subject, description, suggestions } = req.body;

    await db.collection("support_requests").insertOne({
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone?.trim() || "",
      village: village.trim(),
      issueType: issueType.trim(),
      priority: priority.trim(),
      subject: subject.trim(),
      description: description.trim(),
      suggestions: suggestions?.trim() || "",
      date: new Date(),
      status: "pending"
    });

    res.json({ success: true, message: "Support request submitted successfully" });
  } catch (error) {
    console.error("Error submitting support request:", error);
    res.status(500).json({ error: "Failed to submit support request" });
  }
});

app.put("/api/support/:id/status", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not available" });
    
    const { id } = req.params;
    const { status } = req.body;

    if (!id || !status) {
      return res.status(400).json({ error: "ID and status are required" });
    }

    if (!["pending", "resolved"].includes(status)) {
      return res.status(400).json({ error: "Status must be either 'pending' or 'resolved'" });
    }

    const result = await db.collection("support_requests").updateOne(
      { _id: new ObjectId(id) },
      { $set: { status, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Support request not found" });
    }

    res.json({ success: true, message: "Support request status updated successfully" });
  } catch (error) {
    console.error("Error updating support request status:", error);
    res.status(500).json({ error: "Failed to update support request status" });
  }
});

app.delete("/api/support/:id", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not available" });
    
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Support request ID is required" });
    }

    const result = await db.collection("support_requests").deleteOne({ 
      _id: new ObjectId(id) 
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Support request not found" });
    }

    res.json({ success: true, message: "Support request deleted successfully" });
  } catch (error) {
    console.error("Error deleting support request:", error);
    res.status(500).json({ error: "Failed to delete support request" });
  }
});

// Admin Routes
app.post("/api/admin/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!db) {
      const adminUsername = process.env.ADMIN_USERNAME || "admin";
      const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
      
      if (username === adminUsername && password === adminPassword) {
        return res.json({ success: true, message: "Login successful (offline mode)" });
      } else {
        return res.status(401).json({ success: false, error: "Invalid credentials" });
      }
    }

    const admin = await db.collection("admin").findOne({
      username: username,
      password: password
    });

    if (admin) {
      res.json({ success: true, message: "Login successful" });
    } else {
      res.status(401).json({ success: false, error: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

app.put("/api/admin/password", async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current password and new password are required" });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: "New password must be at least 8 characters long" });
    }

    if (!db) {
      const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
      if (currentPassword !== adminPassword) {
        return res.status(401).json({ error: "Current password is incorrect" });
      }
      return res.json({ success: true, message: "Password changed successfully (offline mode)" });
    }

    const admin = await db.collection("admin").findOne({
      password: currentPassword
    });

    if (!admin) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    await db.collection("admin").updateOne(
      { username: admin.username },
      { $set: { password: newPassword, updatedAt: new Date() } }
    );

    res.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ error: "Failed to change password" });
  }
});

// Serve the main page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Serve other pages
app.get("/:page", (req, res) => {
  const page = req.params.page;
  const filePath = path.join(__dirname, "public", `${page}.html`);
  
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send("Page not found");
  }
});

// Global error handling middleware
app.use((error, req, res, next) => {
  console.error("Unhandled Error:", error);
  res.status(500).json({
    error: "Something went wrong!",
    ...(process.env.NODE_ENV === "development" && { details: error.message }),
  });
});

// 404 handler for API routes
app.use("/api/*", (req, res) => {
  res.status(404).json({ error: "API route not found" });
});

// Initialize database and start server
async function startServer() {
  try {
    const databaseClient = await connectToDatabase();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📁 Uploads directory: ${uploadsDir}`);
      console.log(`🗄️  MongoDB Database: ${DB_NAME}`);
      
      if (!databaseClient) {
        console.log('❌ DATABASE STATUS: DISCONNECTED - Admin features disabled');
        console.log('💡 To enable database features:');
        console.log('1. Check your MONGODB_URI in .env file');
        console.log('2. Make sure your IP is whitelisted in MongoDB Atlas');
        console.log('3. Verify your database user credentials');
      } else {
        console.log('✅ DATABASE STATUS: CONNECTED - All features available');
      }
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();