const mongoose = require('mongoose');

// Task Schema with validation and indexing for production-grade database
const taskSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Task text is required'],
    trim: true,
    minlength: [1, 'Task text must be at least 1 character'],
    maxlength: [500, 'Task text cannot exceed 500 characters']
  },
  completed: {
    type: Boolean,
    default: false,
    index: true // Index for efficient filtering
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true // Index for sorting by creation date
  },
  lastModified: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true, // Automatically manage createdAt and updatedAt
  versionKey: false // Remove __v field
});

// Text index for search functionality
taskSchema.index({ text: 'text' });

// Compound index for efficient queries
taskSchema.index({ completed: 1, createdAt: -1 });

// Middleware to update lastModified on every update
taskSchema.pre('findOneAndUpdate', function(next) {
  this.set({ lastModified: new Date() });
  next();
});

// Static method for paginated search with filters
taskSchema.statics.searchTasks = async function(query = {}, options = {}) {
  const {
    search,
    completed,
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = options;

  const filter = {};
  
  // Text search
  if (search) {
    filter.$text = { $search: search };
  }
  
  // Filter by completion status
  if (completed !== undefined) {
    filter.completed = completed === 'true' || completed === true;
  }

  const sort = {};
  sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

  const skip = (page - 1) * limit;

  const [tasks, total] = await Promise.all([
    this.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .lean(),
    this.countDocuments(filter)
  ]);

  return {
    tasks,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit)
    }
  };
};

// Instance method to toggle completion status
taskSchema.methods.toggleComplete = async function() {
  this.completed = !this.completed;
  this.lastModified = new Date();
  return this.save();
};

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
