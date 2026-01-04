const mongoose = require('mongoose');

const PomodoroSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  duration: {
    type: Number,
    required: true,
    default: 25
  },
  taskName: {
    type: String,
    default: 'Focus Session'
  },
  completedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PomodoroSession', PomodoroSessionSchema);