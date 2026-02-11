const mongoose = require("mongoose");

const mealSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },     
    calories: { type: Number, required: true, min: 0 },     
    protein: { type: Number, required: true, min: 0 },      
    fat: { type: Number, required: true, min: 0 },          
    carbs: { type: Number, required: true, min: 0 },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Meal", mealSchema);
