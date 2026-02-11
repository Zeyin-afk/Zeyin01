// validation.js - Input validation middleware

// Validate workout data
const validateWorkout = (req, res, next) => {
  const { name, type, duration } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push('Name is required and must be a non-empty string');
  }

  if (!type || typeof type !== 'string' || type.trim().length === 0) {
    errors.push('Type is required and must be a non-empty string');
  }

  if (duration === undefined || duration === null) {
    errors.push('Duration is required');
  } else if (typeof duration !== 'number' || duration <= 0) {
    errors.push('Duration must be a positive number');
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  // Sanitize inputs
  req.body.name = name.trim();
  req.body.type = type.trim();
  req.body.duration = Math.floor(duration);

  next();
};

// Validate meal data
const validateMeal = (req, res, next) => {
  const { name, calories, protein, fat, carbs } = req.body;
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push('Name is required and must be a non-empty string');
  }

  if (calories === undefined || calories === null) {
    errors.push('Calories is required');
  } else if (typeof calories !== 'number' || calories < 0) {
    errors.push('Calories must be a non-negative number');
  }

  if (protein === undefined || protein === null) {
    errors.push('Protein is required');
  } else if (typeof protein !== 'number' || protein < 0) {
    errors.push('Protein must be a non-negative number');
  }

  if (fat === undefined || fat === null) {
    errors.push('Fat is required');
  } else if (typeof fat !== 'number' || fat < 0) {
    errors.push('Fat must be a non-negative number');
  }

  if (carbs === undefined || carbs === null) {
    errors.push('Carbs is required');
  } else if (typeof carbs !== 'number' || carbs < 0) {
    errors.push('Carbs must be a non-negative number');
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  // Sanitize inputs
  req.body.name = name.trim();
  req.body.calories = Math.max(0, Math.floor(calories));
  req.body.protein = Math.max(0, Math.floor(protein));
  req.body.fat = Math.max(0, Math.floor(fat));
  req.body.carbs = Math.max(0, Math.floor(carbs));

  next();
};

// Validate user registration/login
const validateUser = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || typeof email !== 'string') {
    errors.push('Email is required');
  } else {
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      errors.push('Email must be a valid email address');
    }
  }

  if (!password || typeof password !== 'string') {
    errors.push('Password is required');
  } else if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  // Sanitize inputs
  req.body.email = email.trim().toLowerCase();
  req.body.password = password;

  next();
};

module.exports = {
  validateWorkout,
  validateMeal,
  validateUser
};
