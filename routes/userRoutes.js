const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const { authenticate } = require("../middleware/auth");
const { validateUser } = require("../middleware/validation");

router.post("/register", validateUser, userController.register);
router.post("/login", validateUser, userController.login);
router.get("/profile", authenticate, userController.getProfile);

module.exports = router;

