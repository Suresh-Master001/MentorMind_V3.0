import mongoose from 'mongoose';

const taskTemplateSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  requiredSkills: [{ type: String }]
});

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: [true, 'Project description is required'],
    maxlength: 1000
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    default: null
  },
  requiredTasks: [taskTemplateSchema],
  status: {
    type: String,
    enum: ['planning', 'in-progress', 'completed', 'delayed'],
    default: 'planning'
  },
  deadline: {
    type: Date,
    required: [true, 'Deadline is required']
  }
}, {
  timestamps: true
});

const Project = mongoose.model('Project', projectSchema);

export default Project;