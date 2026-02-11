# Fitness Tracker - Full-Stack Application

A production-ready fitness tracking application with user authentication, workout tracking, and nutrition logging.

## Features

- **User Authentication**: JWT-based authentication with registration and login
- **Workout Tracking**: Create, view, update, and delete workouts
- **Nutrition Logging**: Track meals with calories and macronutrients (protein, fat, carbs)
- **Role-Based Access Control**: Admin users can access all data, regular users see only their own
- **Responsive Design**: Works on desktop and mobile devices
- **Data Validation**: Server-side validation and sanitization

## Tech Stack

### Backend
- Node.js with Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcrypt for password hashing

### Frontend
- HTML5, CSS3, JavaScript (ES6+)
- Bootstrap 5 for responsive UI
- Fetch API for HTTP requests

## Project Structure

```
final/
├── models/           # MongoDB schemas (User, Workout, Meal, Exercise)
├── controllers/      # Business logic (workoutController, mealController, userController)
├── routes/           # API routes (workoutRoutes, mealRoutes, userRoutes)
├── middleware/       # Auth, RBAC, validation, error handling
├── server.js         # Express server setup
├── package.json      # Dependencies
├── .env              # Environment variables (not in git)
├── .env.example      # Example environment variables
├── render.yaml       # Render deployment configuration
└── [HTML/CSS/JS]    # Frontend files
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```env
MONGO_URI=your_mongodb_connection_string
DB_NAME=fitness_tracker
PORT=3000
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development
```

### 3. Start the Server

```bash
npm start
```

The server will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login user
- `GET /api/users/profile` - Get user profile (requires auth)

### Workouts (requires authentication)
- `GET /api/workouts` - Get all workouts (user's own, or all if admin)
- `GET /api/workouts/:id` - Get workout by ID
- `POST /api/workouts` - Create a new workout
- `PUT /api/workouts/:id` - Update a workout
- `DELETE /api/workouts/:id` - Delete a workout

### Meals (requires authentication)
- `GET /api/meals` - Get all meals (user's own, or all if admin)
- `GET /api/meals/:id` - Get meal by ID
- `POST /api/meals` - Create a new meal
- `PUT /api/meals/:id` - Update a meal
- `DELETE /api/meals/:id` - Delete a meal

## Deployment to Render

1. **Create a Render Account**: Sign up at [render.com](https://render.com)

2. **Create a New Web Service**:
   - Connect your GitHub repository
   - Select "Web Service"
   - Use the following settings:
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Environment**: Node

3. **Set Environment Variables** in Render dashboard:
   - `MONGO_URI` - Your MongoDB connection string
   - `DB_NAME` - `fitness_tracker`
   - `JWT_SECRET` - A strong random string
   - `NODE_ENV` - `production`
   - `PORT` - Render sets this automatically (usually 10000)

4. **Deploy**: Render will automatically deploy your application

5. **Update Frontend API URLs**: The frontend automatically detects production vs development, but ensure your Render URL is accessible.

## Admin Access

To create an admin user:
1. Register a user normally through the app
2. Connect to your MongoDB database
3. Update the user document:
   ```javascript
   db.users.updateOne(
     { email: "admin@example.com" },
     { $set: { role: "admin" } }
   )
   ```

## Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Role-based access control (RBAC)
- Input validation and sanitization
- User data isolation (users can only access their own data)
- Secure environment variable management

## Code Quality

- Clean MVC architecture
- Comprehensive error handling
- Input validation middleware
- Consistent code structure
- Environment-based configuration

## License

ISC
