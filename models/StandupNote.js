import mongoose from 'mongoose';

const standupNoteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  todayUpdate: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000,
  },
  blockers: {
    type: String,
    trim: true,
    maxlength: 2000,
    default: '',
  },
  date: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

standupNoteSchema.index({ user: 1, date: 1 }, { unique: true });

const StandupNote = mongoose.model('StandupNote', standupNoteSchema);

export default StandupNote;
