const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

console.log('🚀 Starting Edvora Server...');
console.log('🔍 Checking MongoDB Atlas connection...');

// ==================== DATABASE SETUP ====================

// User Schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  name: {
    type: String,
    required: true
  },
  studentId: {
    type: String,
    unique: true,
    sparse: true // Allows null values while maintaining uniqueness
  },
  department: {
    type: String,
    default: 'Computer Science'
  },
  avatar: String,
  role: {
    type: String,
    enum: ['student', 'admin', 'employer'],
    default: 'student'
  },
  bio: String,
  phone: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Remove password from JSON response
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.__v;
  return user;
};

// Task Schema
const taskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  course: String,
  type: {
    type: String,
    enum: ['assignment', 'project', 'exam', 'other'],
    default: 'assignment'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  deadline: Date,
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'overdue'],
    default: 'pending'
  },
  tags: [String],
  completed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Event Schema
const eventSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  date: {
    type: Date,
    required: true
  },
  startTime: String,
  endTime: String,
  type: {
    type: String,
    enum: ['class', 'meeting', 'deadline', 'personal', 'other'],
    default: 'class'
  },
  color: {
    type: String,
    default: '#667eea'
  }
}, {
  timestamps: true
});

// Create models
const User = mongoose.model('User', userSchema);
const Task = mongoose.model('Task', taskSchema);
const Event = mongoose.model('Event', eventSchema);

// Connect to MongoDB
let useMongoDB = false;

(async () => {
  try {
    if (process.env.MONGODB_URI) {
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      
      useMongoDB = true;
      console.log('✅ MongoDB Atlas Connected!');
      console.log(`📊 Database: ${mongoose.connection.name}`);
      console.log('💾 Data will persist in cloud database');
    } else {
      console.log('⚠️  MONGODB_URI not found in .env file');
      console.log('💡 Using in-memory storage (data lost on restart)');
    }
  } catch (error) {
    console.log('❌ MongoDB Connection Failed:', error.message);
    console.log('💡 Using in-memory storage (data lost on restart)');
  }
})();

// In-memory storage (fallback)
const users = [];
const tasks = [];
const events = [];

// ==================== AUTHENTICATION MIDDLEWARE ====================
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: 'Access token required' 
    });
  }
  
  jwt.verify(token, process.env.JWT_SECRET || 'dev-secret', (err, decoded) => {
    if (err) {
      return res.status(403).json({ 
        success: false, 
        error: 'Invalid or expired token' 
      });
    }
    
    req.userId = decoded.userId;
    req.user = decoded;
    next();
  });
};

// ==================== AUTH ROUTES ====================

// Register route
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password, name, studentId, department } = req.body;

    // Validation
    if (!username || !email || !password || !name) {
      return res.status(400).json({ 
        success: false, 
        error: 'Username, email, password, and name are required' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        error: 'Password must be at least 6 characters' 
      });
    }
    
    if (useMongoDB) {
      // Check if user already exists
      const existingUser = await User.findOne({ 
        $or: [{ username }, { email }, { studentId }] 
      });
      
      if (existingUser) {
        const field = existingUser.username === username ? 'username' : 
                     existingUser.email === email ? 'email' : 'studentId';
        return res.status(400).json({ 
          success: false, 
          error: `${field} already exists` 
        });
      }

      // Create new user
      const user = new User({
        username,
        email,
        password, // Will be hashed by pre-save middleware
        name,
        studentId,
        department: department || 'Computer Science',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=667eea&color=fff`
      });

      await user.save();

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user._id, 
          username: user.username,
          email: user.email,
          role: user.role 
        },
        process.env.JWT_SECRET || 'dev-secret',
        { expiresIn: '7d' }
      );

      res.status(201).json({
        success: true,
        message: 'Registration successful!',
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          name: user.name,
          studentId: user.studentId,
          department: user.department,
          avatar: user.avatar,
          role: user.role
        }
      });
    } else {
      // In-memory version
      const existingUser = users.find(u => 
        u.username === username || u.email === email || u.studentId === studentId
      );
      
      if (existingUser) {
        const field = existingUser.username === username ? 'username' : 
                     existingUser.email === email ? 'email' : 'studentId';
        return res.status(400).json({ 
          success: false, 
          error: `${field} already exists` 
        });
      }

      // Hash password for in-memory storage
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = {
        id: users.length + 1,
        username,
        email,
        password: hashedPassword,
        name,
        studentId,
        department: department || 'Computer Science',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=667eea&color=fff`,
        role: 'student',
        createdAt: new Date()
      };

      users.push(user);

      const token = jwt.sign(
        { 
          userId: user.id, 
          username: user.username,
          email: user.email,
          role: user.role 
        },
        process.env.JWT_SECRET || 'dev-secret',
        { expiresIn: '7d' }
      );

      const { password: _, ...userWithoutPassword } = user;

      res.status(201).json({
        success: true,
        message: 'Registration successful!',
        token,
        user: userWithoutPassword
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Registration failed' 
    });
  }
});

// Login route - FIXED and IMPROVED
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, username, password } = req.body;

    console.log('🔐 Login attempt with:', { email, username });

    // Determine login identifier (accept either email or username)
    const loginIdentifier = email || username;
    
    if (!loginIdentifier || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email/Username and password are required' 
      });
    }

    if (useMongoDB) {
      // MongoDB version - find user by either email or username
      const user = await User.findOne({ 
        $or: [{ email: loginIdentifier }, { username: loginIdentifier }] 
      });

      if (!user) {
        console.log(`❌ User not found: ${loginIdentifier}`);
        return res.status(401).json({ 
          success: false, 
          error: 'Invalid credentials' 
        });
      }

      console.log(`✅ User found: ${user.username} (${user.email})`);
      
      // Compare password
      const isMatch = await user.comparePassword(password);
      
      if (!isMatch) {
        console.log('❌ Password mismatch');
        return res.status(401).json({ 
          success: false, 
          error: 'Invalid credentials' 
        });
      }

      console.log(`✅ Password verified for ${user.username}`);

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user._id, 
          username: user.username,
          email: user.email,
          role: user.role 
        },
        process.env.JWT_SECRET || 'dev-secret',
        { expiresIn: '7d' }
      );

      res.json({
        success: true,
        message: 'Login successful!',
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          name: user.name,
          studentId: user.studentId,
          department: user.department,
          avatar: user.avatar,
          role: user.role
        }
      });
    } else {
      // In-memory version
      const user = users.find(u => 
        u.email === loginIdentifier || u.username === loginIdentifier
      );

      if (!user) {
        return res.status(401).json({ 
          success: false, 
          error: 'Invalid credentials' 
        });
      }

      // Compare password
      const isMatch = await bcrypt.compare(password, user.password);
      
      if (!isMatch) {
        return res.status(401).json({ 
          success: false, 
          error: 'Invalid credentials' 
        });
      }

      const token = jwt.sign(
        { 
          userId: user.id, 
          username: user.username,
          email: user.email,
          role: user.role 
        },
        process.env.JWT_SECRET || 'dev-secret',
        { expiresIn: '7d' }
      );

      const { password: _, ...userWithoutPassword } = user;

      res.json({
        success: true,
        message: 'Login successful!',
        token,
        user: userWithoutPassword
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Login failed' 
    });
  }
});

// Get current user profile
app.get('/api/auth/profile', verifyToken, async (req, res) => {
  try {
    if (useMongoDB) {
      const user = await User.findById(req.userId).select('-password');
      
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          error: 'User not found' 
        });
      }
      
      res.json({
        success: true,
        user
      });
    } else {
      const user = users.find(u => u.id == req.userId);
      
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          error: 'User not found' 
        });
      }
      
      const { password: _, ...userWithoutPassword } = user;
      res.json({
        success: true,
        user: userWithoutPassword
      });
    }
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch profile' 
    });
  }
});

// ==================== TASK ROUTES ====================
app.get('/api/tasks', verifyToken, async (req, res) => {
  try {
    if (useMongoDB) {
      const userTasks = await Task.find({ userId: req.userId }).sort({ deadline: 1 });
      res.json({
        success: true,
        tasks: userTasks
      });
    } else {
      const userTasks = tasks.filter(task => task.userId == req.userId);
      res.json({
        success: true,
        tasks: userTasks
      });
    }
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch tasks' 
    });
  }
});

app.post('/api/tasks', verifyToken, async (req, res) => {
  try {
    const taskData = {
      userId: req.userId,
      ...req.body
    };

    if (useMongoDB) {
      const task = new Task(taskData);
      await task.save();
      res.status(201).json({
        success: true,
        task
      });
    } else {
      const task = {
        id: tasks.length + 1,
        userId: req.userId,
        ...req.body,
        status: 'pending',
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      tasks.push(task);
      res.status(201).json({
        success: true,
        task
      });
    }
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create task' 
    });
  }
});

app.put('/api/tasks/:id', verifyToken, async (req, res) => {
  try {
    if (useMongoDB) {
      const updatedTask = await Task.findOneAndUpdate(
        { _id: req.params.id, userId: req.userId },
        { ...req.body, updatedAt: new Date() },
        { new: true }
      );
      
      if (!updatedTask) {
        return res.status(404).json({ 
          success: false, 
          error: 'Task not found' 
        });
      }
      
      res.json({
        success: true,
        task: updatedTask
      });
    } else {
      const taskIndex = tasks.findIndex(task => 
        task.id == req.params.id && task.userId == req.userId
      );
      
      if (taskIndex === -1) {
        return res.status(404).json({ 
          success: false, 
          error: 'Task not found' 
        });
      }
      
      tasks[taskIndex] = { 
        ...tasks[taskIndex], 
        ...req.body, 
        updatedAt: new Date() 
      };
      
      res.json({
        success: true,
        task: tasks[taskIndex]
      });
    }
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to update task' 
    });
  }
});

app.delete('/api/tasks/:id', verifyToken, async (req, res) => {
  try {
    if (useMongoDB) {
      const deletedTask = await Task.findOneAndDelete({ 
        _id: req.params.id, 
        userId: req.userId 
      });
      
      if (!deletedTask) {
        return res.status(404).json({ 
          success: false, 
          error: 'Task not found' 
        });
      }
      
      res.json({
        success: true,
        message: 'Task deleted successfully'
      });
    } else {
      const taskIndex = tasks.findIndex(task => 
        task.id == req.params.id && task.userId == req.userId
      );
      
      if (taskIndex === -1) {
        return res.status(404).json({ 
          success: false, 
          error: 'Task not found' 
        });
      }
      
      tasks.splice(taskIndex, 1);
      res.json({
        success: true,
        message: 'Task deleted successfully'
      });
    }
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete task' 
    });
  }
});

// ==================== EVENT ROUTES ====================
app.get('/api/events', verifyToken, async (req, res) => {
  try {
    if (useMongoDB) {
      const userEvents = await Event.find({ userId: req.userId }).sort({ date: 1 });
      res.json({
        success: true,
        events: userEvents
      });
    } else {
      const userEvents = events.filter(event => event.userId == req.userId);
      res.json({
        success: true,
        events: userEvents
      });
    }
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch events' 
    });
  }
});

app.post('/api/events', verifyToken, async (req, res) => {
  try {
    const eventData = {
      userId: req.userId,
      ...req.body
    };

    if (useMongoDB) {
      const event = new Event(eventData);
      await event.save();
      res.status(201).json({
        success: true,
        event
      });
    } else {
      const event = {
        id: events.length + 1,
        userId: req.userId,
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      events.push(event);
      res.status(201).json({
        success: true,
        event
      });
    }
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to create event' 
    });
  }
});

// ==================== STATS & QUOTES ====================
app.get('/api/stats', verifyToken, async (req, res) => {
  try {
    let userTasks = [];
    
    if (useMongoDB) {
      userTasks = await Task.find({ userId: req.userId });
    } else {
      userTasks = tasks.filter(task => task.userId == req.userId);
    }
    
    const completedTasks = userTasks.filter(task => task.status === 'completed' || task.completed).length;
    const pendingTasks = userTasks.filter(task => task.status === 'pending').length;
    const totalTasks = userTasks.length;
    
    res.json({
      success: true,
      stats: {
        totalTasks,
        completedTasks,
        pendingTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch stats' 
    });
  }
});

app.get('/api/quote', (req, res) => {
  const quotes = [
    "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
    "Don't watch the clock; do what it does. Keep going. - Sam Levenson",
    "The only way to do great work is to love what you do. - Steve Jobs",
    "Believe you can and you're halfway there. - Theodore Roosevelt",
    "It does not matter how slowly you go as long as you do not stop. - Confucius",
    "Your time is limited, don't waste it living someone else's life. - Steve Jobs"
  ];
  
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  res.json({ 
    success: true,
    quote: randomQuote 
  });
});

// ==================== HEALTH CHECK ====================
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'OK',
    server: 'Running',
    database: useMongoDB ? 'MongoDB Atlas' : 'In-Memory (Demo Mode)',
    timestamp: new Date().toISOString(),
    note: useMongoDB ? 'Data persists in cloud' : 'Data lost on server restart'
  });
});

// ==================== WELCOME ====================
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Edvora Student Platform API',
    version: '2.0',
    mode: useMongoDB ? 'Production (MongoDB Atlas)' : 'Development (In-Memory)',
    endpoints: {
      auth: ['POST /api/auth/register', 'POST /api/auth/login', 'GET /api/auth/profile'],
      tasks: ['GET /api/tasks', 'POST /api/tasks', 'PUT /api/tasks/:id', 'DELETE /api/tasks/:id'],
      events: ['GET /api/events', 'POST /api/events'],
      stats: ['GET /api/stats', 'GET /api/quote']
    },
    health: '/health'
  });
});

// ==================== START SERVER ====================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`💾 Database: ${useMongoDB ? 'MongoDB Atlas Connected' : 'In-Memory (Demo Mode)'}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/`);
});

// Export for testing
module.exports = app;