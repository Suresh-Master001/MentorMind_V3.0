import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 1000
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  requiredSkills: [{
    type: String,
    trim: true
  }],
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'delayed', 'unassigned'],
    default: 'pending'
  },
  deadline: {
    type: Date
  },
  // ========== NEW: Time & Duration Fields ==========
  estimatedHours: {
    type: Number,
    min: 0.5,
    max: 160,
    default: 4
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'expert'],
    default: 'medium'
  },
  estimatedStartDate: {
    type: Date
  },
  actualHours: {
    type: Number,
    default: 0
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  // Track if this task is blocking others
  isBlocking: {
    type: Boolean,
    default: false
  },
  // AI match breakdown scores (for transparency)
  skillScore: {
    type: Number,
    default: 0
  },
  availabilityScore: {
    type: Number,
    default: 0
  },
  workloadScore: {
    type: Number,
    default: 0
  },
  finalScore: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Virtual: estimatedDays from estimatedHours
taskSchema.virtual('estimatedDays').get(function() {
  if (!this.estimatedHours) return 0;
  return Math.ceil(this.estimatedHours / 8);
});

// Ensure virtuals are included in JSON output
taskSchema.set('toJSON', { virtuals: true });
taskSchema.set('toObject', { virtuals: true });

const Task = mongoose.model('Task', taskSchema);

export default Task;