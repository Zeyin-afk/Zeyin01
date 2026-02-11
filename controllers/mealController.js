const Meal = require("../models/meal");

// GET /api/meals - Users see only their meals, admins see all
const getAllMeals = async (req, res, next) => {
  try {
    const query = req.user.role === 'admin' ? {} : { userId: req.user._id };
    const meals = await Meal.find(query).sort({ createdAt: -1 });
    res.json(meals);
  } catch (err) {
    next(err);
  }
};

// GET /api/meals/:id - Users can only access their own meals, admins can access any
const getMealById = async (req, res, next) => {
  try {
    const meal = await Meal.findById(req.params.id);
    if (!meal) return res.status(404).json({ message: "Meal not found" });
    
    // Check ownership unless admin
    if (req.user.role !== 'admin' && meal.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden: You can only access your own meals" });
    }
    
    res.json(meal);
  } catch (err) {
    next(err);
  }
};

// POST /api/meals - Create meal for authenticated user
const createMeal = async (req, res, next) => {
  try {
    const meal = await Meal.create({
      ...req.body,
      userId: req.user._id
    });

    res.status(201).json(meal);
  } catch (err) {
    next(err);
  }
};

// PUT /api/meals/:id - Users can only update their own meals, admins can update any
const updateMeal = async (req, res, next) => {
  try {
    const meal = await Meal.findById(req.params.id);
    if (!meal) return res.status(404).json({ message: "Meal not found" });
    
    // Check ownership unless admin
    if (req.user.role !== 'admin' && meal.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden: You can only update your own meals" });
    }
    
    // Don't allow changing userId unless admin
    const updateData = { ...req.body };
    if (req.user.role !== 'admin') {
      delete updateData.userId;
    }
    
    const updatedMeal = await Meal.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });
    res.json(updatedMeal);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/meals/:id - Users can only delete their own meals, admins can delete any
const deleteMeal = async (req, res, next) => {
  try {
    const meal = await Meal.findById(req.params.id);
    if (!meal) return res.status(404).json({ message: "Meal not found" });
    
    // Check ownership unless admin
    if (req.user.role !== 'admin' && meal.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden: You can only delete your own meals" });
    }
    
    await Meal.findByIdAndDelete(req.params.id);
    res.json({ message: "Meal deleted" });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllMeals,
  getMealById,
  createMeal,
  updateMeal,
  deleteMeal,
};
