const Workout = require("../models/workout");

// GET /api/workouts - Users see only their workouts, admins see all
const getAllWorkouts = async (req, res, next) => {
  try {
    const query = req.user.role === 'admin' ? {} : { userId: req.user._id };
    const workouts = await Workout.find(query).sort({ createdAt: -1 });
    res.json(workouts);
  } catch (err) {
    next(err);
  }
};

// GET /api/workouts/:id - Users can only access their own workouts, admins can access any
const getWorkoutById = async (req, res, next) => {
  try {
    const workout = await Workout.findById(req.params.id);
    if (!workout) return res.status(404).json({ message: "Workout not found" });
    
    // Check ownership unless admin
    if (req.user.role !== 'admin' && workout.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden: You can only access your own workouts" });
    }
    
    res.json(workout);
  } catch (err) {
    next(err);
  }
};

// POST /api/workouts - Create workout for authenticated user
const createWorkout = async (req, res, next) => {
  try {
    const workout = await Workout.create({
      ...req.body,
      userId: req.user._id
    });
    res.status(201).json(workout);
  } catch (err) {
    next(err);
  }
};

// PUT /api/workouts/:id - Users can only update their own workouts, admins can update any
const updateWorkout = async (req, res, next) => {
  try {
    const workout = await Workout.findById(req.params.id);
    if (!workout) return res.status(404).json({ message: "Workout not found" });
    
    // Check ownership unless admin
    if (req.user.role !== 'admin' && workout.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden: You can only update your own workouts" });
    }
    
    // Don't allow changing userId unless admin
    const updateData = { ...req.body };
    if (req.user.role !== 'admin') {
      delete updateData.userId;
    }
    
    const updatedWorkout = await Workout.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });
    res.json(updatedWorkout);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/workouts/:id - Users can only delete their own workouts, admins can delete any
const deleteWorkout = async (req, res, next) => {
  try {
    const workout = await Workout.findById(req.params.id);
    if (!workout) return res.status(404).json({ message: "Workout not found" });
    
    // Check ownership unless admin
    if (req.user.role !== 'admin' && workout.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden: You can only delete your own workouts" });
    }
    
    await Workout.findByIdAndDelete(req.params.id);
    res.json({ message: "Workout deleted" });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllWorkouts,
  getWorkoutById,
  createWorkout,
  updateWorkout,
  deleteWorkout,
};

