const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  duration: { type: Number, required: true }, // минуты
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Workout', workoutSchema);
