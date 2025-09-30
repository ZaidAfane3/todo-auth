# Authentication Service

A simple authentication service for elm-phase2 that provides user authentication with cookie-based sessions.

## Features

- User login with username/password
- User logout
- Session validation endpoint for backend services
- PostgreSQL database for user storage
- Cookie-based session management

## Setup

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your database credentials
```

3. Setup the database:
```bash
# Create the database
psql -U postgres -c "CREATE DATABASE auth_db;"

# Run the setup script
psql -U postgres -d auth_db -f setup.sql
```

### Running the Service

Development mode with auto-reload:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The service will run on port 3001 by default.

## API Endpoints

### POST /login
Login with username and password.

**Request:**
```json
{
  "username": "admin",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "admin"
  }
}
```

Sets a `sessionId` cookie on success.

### POST /logout
Logout the current user.

**Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

Clears the `sessionId` cookie.

### GET /is-logged-in
Check if the user is currently logged in (used by backend services).

**Response (logged in):**
```json
{
  "success": true,
  "message": "User is logged in",
  "isLoggedIn": true,
  "user": {
    "id": 1,
    "username": "admin"
  }
}
```

**Response (not logged in):**
```json
{
  "success": false,
  "message": "Not logged in",
  "isLoggedIn": false
}
```

### GET /health
Health check endpoint.

**Response:**
```json
{
  "success": true,
  "message": "Auth service is running",
  "timestamp": "2025-09-30T12:00:00.000Z"
}
```

## Database Schema

The database includes:
- `users` table: Stores user credentials
- `sessions` table: Optional persistent session storage

### Sample Users

The setup script creates three sample users (all with password `password123`):
- `admin`
- `user1`
- `testuser`

**Note:** The actual password hashes in the SQL file need to be generated. You can use the following Node.js script:

```javascript
const bcrypt = require('bcrypt');
bcrypt.hash('password123', 10, (err, hash) => {
  console.log(hash);
});
```

## Security Notes

- Passwords are hashed using bcrypt
- Sessions are stored in-memory (consider Redis for production)
- Cookies are httpOnly and use sameSite=strict
- CORS is configured for specified frontend URL

## TODO

- Implement password reset functionality
- Add rate limiting
- Implement refresh tokens
- Add user registration endpoint
- Move sessions to Redis or database
