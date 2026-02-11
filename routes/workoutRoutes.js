const express = require("express");
const router = express.Router();

const workoutController = require("../controllers/workoutController");
const { authenticate } = require("../middleware/auth");
const { requireAdmin } = require("../middleware/rbac");
const { validateWorkout } = require("../middleware/validation");

// All workout routes require authentication
router.use(authenticate);

// Public routes (for authenticated users)
router.get("/", workoutController.getAllWorkouts);
router.get("/:id", workoutController.getWorkoutById);
router.post("/", validateWorkout, workoutController.createWorkout);
router.put("/:id", validateWorkout, workoutController.updateWorkout);
router.delete("/:id", workoutController.deleteWorkout);

module.exports = router;

