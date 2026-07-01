import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true,
    maxlength: 500
  },
  type: {
    type: String,
    enum: ['delay', 'assignment', 'completion'],
    default: 'delay'
  },
  read: {
    type: Boolean,
    default: false
  },
  relatedTask: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  }
}, {
  timestamps: true
});

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;