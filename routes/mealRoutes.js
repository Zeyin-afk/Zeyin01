const express = require("express");
const router = express.Router();

const mealController = require("../controllers/mealController");
const { authenticate } = require("../middleware/auth");
const { validateMeal } = require("../middleware/validation");

// All meal routes require authentication
router.use(authenticate);

// Public routes (for authenticated users)
router.get("/", mealController.getAllMeals);
router.get("/:id", mealController.getMealById);
router.post("/", validateMeal, mealController.createMeal);
router.put("/:id", validateMeal, mealController.updateMeal);
router.delete("/:id", mealController.deleteMeal);

module.exports = router;
