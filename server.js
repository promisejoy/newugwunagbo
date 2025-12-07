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

const leadershipHistoryRoutes = require('./routes/leadership-history.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB Configuration - LOCAL DATABASE
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || "ugwunagbo_lga";
let db, client;

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(cors());

// Body parsing middleware
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, "public")));








// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "public", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("✅ Created uploads directory");
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
    console.log('🔗 Connecting to local MongoDB...');
    
    client = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });

    await client.connect();
    
    // Test the connection
    await client.db().admin().ping();
    
    db = client.db(DB_NAME);
    console.log("✅ Connected to local MongoDB successfully!");
    app.locals.db = db;
    
    await initializeCollections();
    return client;
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    console.log('💡 Please make sure MongoDB is installed and running on your system');
    console.log('💡 Run: sudo systemctl start mongod (Linux) or start MongoDB service (Windows)');
    return null;
  }
}

// Initialize collections and default data
// Initialize collections and default data
// Update the initializeCollections function in server.js
async function initializeCollections() {
  try {
    const collections = [
      "governor", "video", "villages", "leaders", 
      "events", "news", "contacts", "support_requests", "admin",
      "service_applications", "payments", "notifications",
      "leadership_history",
      "academia", "gallery"

    ];
    
    for (const collectionName of collections) {
      const collection = db.collection(collectionName);
      // This will create the collection if it doesn't exist
      await collection.find({}).limit(1).toArray();
    }
    
    // Insert default admin if not exists
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
    
    console.log("✅ Database collections initialized successfully");
  } catch (error) {
    console.log("⚠️  Database initialization note:", error.message);
  }
}
// Database connection check middleware

app.use('/api/leadership-history', leadershipHistoryRoutes);

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
    if (!db) return res.status(503).json({ error: "Database not available" });
    
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
    if (!db) return res.status(503).json({ error: "Database not available" });
    
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
    if (!db) return res.status(503).json({ error: "Database not available" });
    
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
    if (!db) return res.status(503).json({ error: "Database not available" });
    
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
    if (!db) return res.status(503).json({ error: "Database not available" });
    
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
    if (!db) return res.status(503).json({ error: "Database not available" });
    
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


// Forum API Routes

// Forum API Routes
app.get("/api/forum/topics", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not available" });
    
    const topics = await db.collection("forum_topics").find({})
      .sort({ lastActivity: -1 })
      .toArray();
    res.json(topics);
  } catch (error) {
    console.error("Error fetching forum topics:", error);
    res.status(500).json({ error: "Failed to fetch forum topics" });
  }
});

app.post("/api/forum/topics", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not available" });
    
    const { title, category, author, content } = req.body;

    if (!title || !category || !content) {
      return res.status(400).json({ error: "Title, category, and content are required" });
    }

    const result = await db.collection("forum_topics").insertOne({
      title: title.trim(),
      category: category.trim(),
      author: author?.trim() || "Anonymous",
      content: content.trim(),
      createdAt: new Date(),
      views: 0,
      replyCount: 0,
      lastActivity: new Date()
    });

    res.json({ 
      success: true, 
      message: "Topic created successfully",
      id: result.insertedId 
    });
  } catch (error) {
    console.error("Error creating forum topic:", error);
    res.status(500).json({ error: "Failed to create forum topic" });
  }
});

app.get("/api/forum/topics/:id", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not available" });
    
    const { id } = req.params;

    const topic = await db.collection("forum_topics").findOne({ 
      _id: new ObjectId(id) 
    });

    if (!topic) {
      return res.status(404).json({ error: "Topic not found" });
    }

    // Increment views
    await db.collection("forum_topics").updateOne(
      { _id: new ObjectId(id) },
      { $inc: { views: 1 } }
    );

    res.json(topic);
  } catch (error) {
    console.error("Error fetching forum topic:", error);
    res.status(500).json({ error: "Failed to fetch forum topic" });
  }
});

app.get("/api/forum/topics/:id/replies", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not available" });
    
    const { id } = req.params;

    const replies = await db.collection("forum_replies").find({ 
      topicId: id 
    }).sort({ createdAt: 1 }).toArray();

    res.json(replies);
  } catch (error) {
    console.error("Error fetching forum replies:", error);
    res.status(500).json({ error: "Failed to fetch forum replies" });
  }
});

app.post("/api/forum/topics/:id/replies", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not available" });
    
    const { id } = req.params;
    const { author, content } = req.body;

    if (!content) {
      return res.status(400).json({ error: "Reply content is required" });
    }

    const result = await db.collection("forum_replies").insertOne({
      topicId: id,
      author: author?.trim() || "Anonymous",
      content: content.trim(),
      createdAt: new Date()
    });

    // Update topic reply count and last activity
    await db.collection("forum_topics").updateOne(
      { _id: new ObjectId(id) },
      { 
        $inc: { replyCount: 1 },
        $set: { lastActivity: new Date() }
      }
    );

    res.json({ 
      success: true, 
      message: "Reply posted successfully",
      id: result.insertedId 
    });
  } catch (error) {
    console.error("Error posting forum reply:", error);
    res.status(500).json({ error: "Failed to post forum reply" });
  }
});

// Serve uploaded files
app.get("/uploads/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(uploadsDir, filename);
  
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: "File not found" });
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



// Contacts Routes
app.get("/api/contacts", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not available" });
    
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
    if (!db) return res.status(503).json({ error: "Database not available" });
    
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
      return res.status(503).json({ error: "Database not available" });
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
      return res.status(503).json({ error: "Database not available" });
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






// Service Applications Routes
app.get("/api/service-applications", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not available" });
    
    const applications = await db.collection("service_applications").find({})
      .sort({ applicationDate: -1 })
      .toArray();
    res.json(applications);
  } catch (error) {
    console.error("Error fetching service applications:", error);
    res.status(500).json({ error: "Failed to fetch service applications" });
  }
});

// Service Applications Routes
app.post("/api/service-applications", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not available" });
    
    const {
      serviceType,
      wardNumber,
      applicationDate,
      firstName,
      lastName,
      email,
      phone,
      address,
      dateOfBirth, // Add this
      purpose,
      additionalInfo,
      documents
    } = req.body;

    // Validate required fields
    if (!serviceType || !wardNumber || !applicationDate || !firstName || !lastName || !email || !phone || !address) {
      return res.status(400).json({ error: "All required fields must be filled" });
    }

    // Generate application ID
    const applicationId = generateApplicationId();

    const result = await db.collection("service_applications").insertOne({
      applicationId,
      serviceType,
      wardNumber,
      applicationDate: new Date(applicationDate),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null, // Add this
      purpose: purpose?.trim() || "",
      additionalInfo: additionalInfo?.trim() || "",
      documents: documents || [],
      status: "pending",
      payment: null, // Initialize payment field
      createdAt: new Date(),
      updatedAt: new Date()
    });

    res.json({ 
      success: true, 
      message: "Application submitted successfully",
      applicationId: applicationId
    });
  } catch (error) {
    console.error("Error submitting service application:", error);
    res.status(500).json({ error: "Failed to submit application" });
  }
});
app.put("/api/service-applications/:id/status", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not available" });
    
    const { id } = req.params;
    const { status } = req.body;

    if (!id || !status) {
      return res.status(400).json({ error: "ID and status are required" });
    }

    if (!["pending", "in-review", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const result = await db.collection("service_applications").updateOne(
      { _id: new ObjectId(id) },
      { $set: { status, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Application not found" });
    }

    res.json({ success: true, message: "Application status updated successfully" });
  } catch (error) {
    console.error("Error updating application status:", error);
    res.status(500).json({ error: "Failed to update application status" });
  }
});

app.delete("/api/service-applications/:id", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not available" });
    
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Application ID is required" });
    }

    const result = await db.collection("service_applications").deleteOne({ 
      _id: new ObjectId(id) 
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Application not found" });
    }

    res.json({ success: true, message: "Application deleted successfully" });
  } catch (error) {
    console.error("Error deleting application:", error);
    res.status(500).json({ error: "Failed to delete application" });
  }
});

// Utility function to generate application ID
function generateApplicationId() {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `UGW-${timestamp}-${random}`.toUpperCase();
}














// ========== ACADEMIA API ROUTES ==========

// Get all academia entries
app.get("/api/academia", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not available" });
    
    const academia = await db.collection("academia").find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    // Ensure _id is converted to string
    const formattedAcademia = academia.map(item => ({
      ...item,
      _id: item._id.toString()
    }));
    
    res.json(formattedAcademia);
  } catch (error) {
    console.error("Error fetching academia:", error);
    res.status(500).json({ error: "Failed to fetch academia" });
  }
});

// Add new academia entry - FIXED VERSION
app.post("/api/academia", upload.single("photo"), async (req, res) => {
  try {
    console.log("📝 Academia POST request received");
    console.log("📦 Body:", req.body);
    console.log("📁 File:", req.file);
    
    if (!db) return res.status(503).json({ error: "Database not available" });
    
    const { title, full_name, village, qualification } = req.body;
    
    console.log("🔍 Validation check:", { title, full_name, village, qualification });

    if (!title || !full_name || !village || !qualification) {
      console.log("❌ Missing fields");
      return res.status(400).json({ 
        error: "All fields are required",
        missing: {
          title: !title,
          full_name: !full_name,
          village: !village,
          qualification: !qualification
        }
      });
    }

    let photoPath = null;
    if (req.file) {
      photoPath = "/uploads/" + req.file.filename;
      console.log("📸 Photo uploaded:", photoPath);
    }

    const academiaData = {
      title: title.trim(),
      full_name: full_name.trim(),
      village: village.trim(),
      qualification: qualification.trim(),
      photo: photoPath,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log("💾 Saving to database:", academiaData);

    const result = await db.collection("academia").insertOne(academiaData);

    console.log("✅ Saved successfully, ID:", result.insertedId);

    res.json({ 
      success: true, 
      message: "Academician added successfully",
      id: result.insertedId,
      data: academiaData
    });
  } catch (error) {
    console.error("❌ Error adding academician:", error);
    res.status(500).json({ 
      error: "Failed to add academician",
      details: error.message 
    });
  }
});

// Delete academia entry
app.delete("/api/academia/:id", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not available" });
    
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Academician ID is required" });
    }

    const result = await db.collection("academia").deleteOne({ 
      _id: new ObjectId(id) 
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Academician not found" });
    }

    res.json({ success: true, message: "Academician deleted successfully" });
  } catch (error) {
    console.error("Error deleting academician:", error);
    res.status(500).json({ error: "Failed to delete academician" });
  }
});

// ========== GALLERY API ROUTES ==========

// Get all gallery items
app.get("/api/gallery", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not available" });
    
    const gallery = await db.collection("gallery").find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    // Ensure _id is converted to string
    const formattedGallery = gallery.map(item => ({
      ...item,
      _id: item._id.toString()
    }));
    
    res.json(formattedGallery);
  } catch (error) {
    console.error("Error fetching gallery:", error);
    res.status(500).json({ error: "Failed to fetch gallery" });
  }
});

// Add new gallery item - FIXED VERSION
app.post("/api/gallery", upload.single("file"), async (req, res) => {
  try {
    console.log("📝 Gallery POST request received");
    console.log("📦 Body:", req.body);
    console.log("📁 File:", req.file);
    
    if (!db) return res.status(503).json({ error: "Database not available" });
    
    const { type, description } = req.body;
    const file = req.file;

    if (!type) {
      return res.status(400).json({ error: "Type is required" });
    }

    if (!file) {
      return res.status(400).json({ error: "File is required" });
    }

    if (!["image", "video"].includes(type)) {
      return res.status(400).json({ error: "Type must be either 'image' or 'video'" });
    }

    // Validate file types
    if (type === "image" && !file.mimetype.startsWith("image/")) {
      return res.status(400).json({ 
        error: "Invalid image file type",
        mimeType: file.mimetype 
      });
    }

    if (type === "video" && !file.mimetype.startsWith("video/")) {
      return res.status(400).json({ 
        error: "Invalid video file type",
        mimeType: file.mimetype 
      });
    }

    const filePath = "/uploads/" + file.filename;

    const galleryData = {
      type: type.trim(),
      file_url: filePath,
      description: description?.trim() || "",
      file_name: file.originalname,
      file_size: file.size,
      mime_type: file.mimetype,
      createdAt: new Date()
    };

    console.log("💾 Saving gallery item:", galleryData);

    const result = await db.collection("gallery").insertOne(galleryData);

    console.log("✅ Gallery item saved successfully, ID:", result.insertedId);

    res.json({ 
      success: true, 
      message: "Gallery item uploaded successfully",
      id: result.insertedId,
      data: galleryData
    });
  } catch (error) {
    console.error("❌ Error uploading gallery item:", error);
    res.status(500).json({ 
      error: "Failed to upload gallery item",
      details: error.message 
    });
  }
});

// Delete gallery item
app.delete("/api/gallery/:id", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not available" });
    
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "Gallery item ID is required" });
    }

    // First get the item to delete the file
    const item = await db.collection("gallery").findOne({ _id: new ObjectId(id) });
    
    if (!item) {
      return res.status(404).json({ error: "Gallery item not found" });
    }

    // Delete the file from server
    if (item.file_url) {
      const filePath = path.join(__dirname, "public", item.file_url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Delete from database
    const result = await db.collection("gallery").deleteOne({ 
      _id: new ObjectId(id) 
    });

    res.json({ success: true, message: "Gallery item deleted successfully" });
  } catch (error) {
    console.error("Error deleting gallery item:", error);
    res.status(500).json({ error: "Failed to delete gallery item" });
  }
});



















// Payment Routes
// Payment Routes
app.post("/api/service-applications/payments", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not available" });
    
    const { applicationId, paymentMethod, transactionId, amount } = req.body;

    if (!applicationId || !paymentMethod || !transactionId || !amount) {
      return res.status(400).json({ error: "All payment fields are required" });
    }

    // Check if application exists
    const application = await db.collection("service_applications").findOne({ 
      applicationId: applicationId 
    });

    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    // Save payment to payments collection
    const payment = await db.collection("payments").insertOne({
      applicationId,
      paymentMethod,
      transactionId: transactionId.trim(),
      amount: parseFloat(amount),
      status: "pending_verification",
      paidAt: new Date(),
      createdAt: new Date()
    });

    // Update application with payment info
    await db.collection("service_applications").updateOne(
      { applicationId: applicationId },
      { 
        $set: { 
          "payment": {
            paymentMethod,
            transactionId: transactionId.trim(),
            amount: parseFloat(amount),
            status: "pending_verification",
            paidAt: new Date()
          },
          status: "payment_pending",
          updatedAt: new Date()
        }
      }
    );

    // Create admin notification
    await db.collection("notifications").insertOne({
      type: "payment",
      title: "💰 New Payment Received",
      message: `Payment of ₦${amount} for Application #${applicationId}`,
      applicationId: applicationId,
      paymentId: payment.insertedId,
      amount: parseFloat(amount),
      transactionId: transactionId.trim(),
      read: false,
      createdAt: new Date()
    });

    res.json({ 
      success: true, 
      message: "Payment submitted successfully",
      paymentId: payment.insertedId
    });
  } catch (error) {
    console.error("Error processing payment:", error);
    res.status(500).json({ error: "Failed to process payment" });
  }
});

// Verify payment
app.put("/api/service-applications/:id/payment/verify", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not available" });
    
    const { id } = req.params;
    const { verified } = req.body;

    if (typeof verified !== 'boolean') {
      return res.status(400).json({ error: "Verification status is required" });
    }

    // Update payment status
    const result = await db.collection("service_applications").updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: { 
          "payment.status": verified ? "verified" : "rejected",
          status: verified ? "in_review" : "payment_rejected",
          updatedAt: new Date()
        }
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Application not found" });
    }

    res.json({ 
      success: true, 
      message: verified ? "Payment verified successfully" : "Payment rejected"
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    res.status(500).json({ error: "Failed to verify payment" });
  }
});




// Get notifications for admin
app.get("/api/admin/notifications", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not available" });
    
    const notifications = await db.collection("notifications").find({})
      .sort({ createdAt: -1 })
      .limit(50)
      .toArray();
    
    // Count unread notifications
    const unreadCount = await db.collection("notifications").countDocuments({ 
      read: false 
    });

    res.json({ 
      notifications, 
      unreadCount 
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// Mark notification as read
app.put("/api/admin/notifications/:id/read", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not available" });
    
    const { id } = req.params;

    const result = await db.collection("notifications").updateOne(
      { _id: new ObjectId(id) },
      { $set: { read: true, readAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Notification not found" });
    }

    res.json({ success: true, message: "Notification marked as read" });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
});

// Mark all notifications as read
app.put("/api/admin/notifications/read-all", async (req, res) => {
  try {
    if (!db) return res.status(503).json({ error: "Database not available" });
    
    const result = await db.collection("notifications").updateMany(
      { read: false },
      { $set: { read: true, readAt: new Date() } }
    );

    res.json({ 
      success: true, 
      message: `${result.modifiedCount} notifications marked as read` 
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ error: "Failed to mark notifications as read" });
  }
});


// Serve uploaded files
app.get("/uploads/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(uploadsDir, filename);
  
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: "File not found" });
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

// Initialize database and start server
async function startServer() {
  try {
    console.log('🚀 Starting Ugwunagbo LGA website server...');
    const databaseClient = await connectToDatabase();
    
    if (databaseClient) {
      app.locals.db = db; // Make database available to routes
    }
    
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🌐 Website URL: http://localhost:${PORT}`);
      
      if (!databaseClient) {
        console.log('❌ DATABASE STATUS: DISCONNECTED - Please start MongoDB service');
        console.log('💡 On Windows: Start MongoDB Service from Services');
        console.log('💡 On Linux: sudo systemctl start mongod');
        console.log('💡 On macOS: brew services start mongodb-community');
      } else {
        console.log('✅ DATABASE STATUS: CONNECTED - All features available');
        console.log('📁 Uploads directory:', uploadsDir);
        console.log('👥 Leadership History API: http://localhost:' + PORT + '/api/leadership-history');
      }
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();









// Example Node.js/Express backend code
app.post('/api/service-applications/payments', async (req, res) => {
    try {
        const { applicationId, paymentMethod, transactionId, amount } = req.body;
        
        // Save payment to database
        const payment = await Payment.create({
            applicationId,
            paymentMethod,
            transactionId,
            amount,
            status: 'pending_verification',
            paymentDate: new Date()
        });
        
        // Create admin notification
        await Notification.create({
            type: 'payment',
            title: 'New Payment Received',
            message: `Payment of ₦${amount} for Application #${applicationId}`,
            data: { applicationId, paymentId: payment.id },
            adminId: 'all', // For all admins
            priority: 'high',
            read: false
        });
        
        // Send email notification to admin
        await sendEmailToAdmin({
            to: 'admin@ugwunagbolga.gov.ng',
            subject: `New Payment - Application #${applicationId}`,
            template: 'payment-notification',
            data: { applicationId, amount, transactionId }
        });
        
        res.json({ success: true, paymentId: payment.id });
    } catch (error) {
        console.error('Payment processing error:', error);
        res.status(500).json({ error: 'Failed to process payment' });
    }
});