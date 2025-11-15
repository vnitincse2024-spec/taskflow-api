MONGODB_SETUP.md# MongoDB Database Setup & Implementation Guide
## Full Stack Task 4 - Production-Grade Database Layer

### ✅ What's Already Done
1. **Task Model** - Created at `src/models/Task.js`
   - Mongoose schema with validation
   - Text search indexing
   - Pagination support
   - Enterprise-ready features

### 🚀 Step 1: Install Required Packages

Run the following command in your project root:

```bash
npm install mongoose dotenv
```

### 🔧 Step 2: MongoDB Atlas Setup

1. **Sign up for MongoDB Atlas**
   - Go to https://www.mongodb.com/cloud/atlas/register
   - Sign up with your Google account (vnitin.cse2024@citchennai.net)
   - Or create account with email/password

2. **Create a Free Cluster**
   - Click "Build a Database"
   - Select FREE tier (M0 Sandbox)
   - Choose a cloud provider (AWS recommended)
   - Choose region closest to you
   - Cluster name: `TaskFlow-Cluster`
   - Click "Create Cluster"

3. **Create Database User**
   - Under Security → Database Access
   - Click "Add New Database User"
   - Username: `taskflow_admin`
   - Password: Generate a secure password (save it!)
   - Database User Privileges: Read and write to any database
   - Click "Add User"

4. **Whitelist IP Address**
   - Under Security → Network Access
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - For production, use specific IPs
   - Click "Confirm"

5. **Get Connection String**
   - Go to Database → Connect
   - Choose "Connect your application"
   - Driver: Node.js
   - Version: 5.5 or later
   - Copy the connection string
   - It looks like: `mongodb+srv://taskflow_admin:<password>@taskflow-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority`

### 📁 Step 3: Create Environment File

Create `.env` in project root:

```env
# MongoDB Configuration
MONGDB_URI=mongodb+srv://taskflow_admin:YOUR_PASSWORD@taskflow-cluster.xxxxx.mongodb.net/taskflow?retryWrites=true&w=majority

# Server Configuration
PORT=3000
NODE_ENV=development
```

**Replace:**
- `YOUR_PASSWORD` with the password you created
- `xxxxx` with your cluster ID

### 📄 Step 4: Create Required Files

#### File 1: `src/config/database.js`

Create this file with the database connection code (already provided in the repo - see separate file if not created)

#### File 2: Update `package.json`

Ensure these dependencies are listed:

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^8.0.0",
    "dotenv": "^16.3.1",
    "helmet": "^7.1.0",
    "morgan": "^1.10.0",
    "cors": "^2.8.5"
  }
}
```

### 🔄 Step 5: Update server.js

Modify `server.js` to connect to MongoDB:

```javascript
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
require('dotenv').config();

// Import database connection
const connectDB = require('./src/config/database');

// Import routes
const taskRoutes = require('./src/routes/taskRoutes');
const securityHeaders = require('./src/middleware/security');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet());
app.use(securityHeaders);
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/tasks', taskRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
```

### ✏️ Step 6: Update Task Controller

Update `src/controllers/taskController.js` to use MongoDB:

```javascript
const Task = require('../models/Task');

// Get all tasks with pagination and search
exports.getAllTasks = async (req, res) => {
  try {
    const { search, completed, page, limit, sortBy, sortOrder } = req.query;
    
    const result = await Task.searchTasks({}, {
      search,
      completed,
      page: page || 1,
      limit: limit || 10,
      sortBy: sortBy || 'createdAt',
      sortOrder: sortOrder || 'desc'
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Server error', message: error.message });
  }
};

// Get task by ID
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ error: 'Invalid task ID' });
    }
    res.status(500).json({ error: 'Server error', message: error.message });
  }
};

// Create new task
exports.createTask = async (req, res) => {
  try {
    const task = new Task({
      text: req.body.text,
      completed: req.body.completed || false
    });

    const savedTask = await task.save();
    res.status(201).json(savedTask);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validation error', message: error.message });
    }
    res.status(500).json({ error: 'Server error', message: error.message });
  }
};

// Update task
exports.updateTask = async (req, res) => {
  try {
    const updates = {
      text: req.body.text,
      completed: req.body.completed,
      lastModified: new Date()
    };

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ error: 'Invalid task ID' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validation error', message: error.message });
    }
    res.status(500).json({ error: 'Server error', message: error.message });
  }
};

// Delete task
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ message: 'Task deleted successfully', task });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ error: 'Invalid task ID' });
    }
    res.status(500).json({ error: 'Server error', message: error.message });
  }
};
```

### 🧪 Step 7: Testing

1. **Start the server:**
```bash
node server.js
```

2. **Test with curl or Postman:**

```bash
# Create a task
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{"text": "Complete MongoDB integration"}'

# Get all tasks with pagination
curl http://localhost:3000/api/tasks?page=1&limit=10

# Search tasks
curl http://localhost:3000/api/tasks?search=MongoDB

# Filter completed tasks
curl http://localhost:3000/api/tasks?completed=true
```

### 📊 Step 8: Performance Testing

Create test script `test-performance.js`:

```javascript
const mongoose = require('mongoose');
const Task = require('./src/models/Task');
require('dotenv').config();

async function generateTestData() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  console.log('🔄 Generating 10,000 test tasks...');
  const tasks = [];
  
  for (let i = 0; i < 10000; i++) {
    tasks.push({
      text: `Test task ${i + 1} - ${Math.random().toString(36).substr(2, 9)}`,
      completed: Math.random() > 0.5
    });
  }
  
  const startTime = Date.now();
  await Task.insertMany(tasks);
  const endTime = Date.now();
  
  console.log(`✅ Created 10,000 tasks in ${endTime - startTime}ms`);
  
  // Test query performance
  const queryStart = Date.now();
  await Task.find({ completed: true }).limit(100).lean();
  const queryEnd = Date.now();
  
  console.log(`✅ Query completed in ${queryEnd - queryStart}ms`);
  
  mongoose.connection.close();
}

generateTestData();
```

### ✅ Features Implemented

✓ Mongoose Task model with validation
✓ Database indexing for performance
✓ Text search functionality
✓ Pagination support
✓ Connection pooling
✓ Automatic retry logic
✓ Error handling
✓ Graceful shutdown
✓ Environment-based configuration

### 🎯 Next Steps

1. ✅ Complete MongoDB Atlas signup
2. ✅ Get connection string
3. ✅ Create .env file
4. ✅ Update server.js
5. ✅ Update taskController.js
6. ✅ Test endpoints
7. ✅ Run performance tests
8. ✅ Document results

### 📝 Submission Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Connection string configured
- [ ] All files updated
- [ ] Server starts without errors
- [ ] All CRUD operations work
- [ ] Pagination tested
- [ ] Search functionality tested
- [ ] Performance test completed
- [ ] Code committed to GitHub

---

**Created**: Full Stack Task 4
**Author**: V Nitin CSE 2024
**Repository**: taskflow-api
