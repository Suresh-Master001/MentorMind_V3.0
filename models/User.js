import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: 50
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['admin', 'Team Lead', 'member'],
    default: 'member'
  },
  skills: [{
    type: String,
    trim: true
  }],
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    default: null
  },
  companyName: {
    type: String,
    trim: true,
    default: ''
  },
  teamName: {
    type: String,
    trim: true,
    default: ''
  },
  availability: {
    type: Number,
    min: 0,
    max: 100,
    default: 100
  },
  currentWorkload: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  // ========== NEW: Time Management Fields ==========
  workingHoursPerDay: {
    type: Number,
    min: 1,
    max: 16,
    default: 8
  },
  maxTasksPerDay: {
    type: Number,
    min: 1,
    max: 20,
    default: 5
  },
  // Track total hours assigned across all active tasks
  totalAssignedHours: {
    type: Number,
    default: 0
  },
  // Track hours already logged
  loggedHours: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Virtual: remaining capacity in hours for today
userSchema.virtual('remainingCapacity').get(function() {
  return Math.max(0, this.workingHoursPerDay - (this.totalAssignedHours - this.loggedHours));
});

// Virtual: capacity utilization percentage
userSchema.virtual('capacityUtilization').get(function() {
  if (this.workingHoursPerDay === 0) return 0;
  return Math.min(100, Math.round(((this.totalAssignedHours - this.loggedHours) / this.workingHoursPerDay) * 100));
});

// Ensure virtuals are included in JSON output
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;