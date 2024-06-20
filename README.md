# NodeJs_login_template# Node.js Basic Login System

## Overview
This Node.js application implements a basic login system using Express, MongoDB, and various middleware for session handling, cookie parsing, and email confirmation. The application includes user signup, login, email verification, password reset, and session management.

## Features
- User Signup
- User Login
- Email Confirmation
- Password Reset
- Session Management
- Dashboard Access

## Prerequisites
- Node.js (v14.x or higher)
- MongoDB
- NPM (Node Package Manager)

## Installation

1. **Clone the repository:**
   ```sh
   git clone https://github.com/yourusername/basic-login-system.git
   cd basic-login-system
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory and add the following:
   ```env
   BASE_URL=http://localhost:3000
   ```

4. **Start the application:**
   ```sh
   node index.js
   ```

## Project Structure
```plaintext
.
├── client
│   ├── index.html
│   ├── dash.html
│   └── reset-password.html
├── index.js
├── checkip.js
├── mongologin.js
├── email.js
├── package.json
└── .env
```

## API Endpoints

### User Signup
**Endpoint:** `/signup`
**Method:** `POST`
**Description:** Registers a new user and sends a confirmation email.
**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```
**Response:**
```json
{
  "error": false,
  "message": "User created successfully. Please check your email to confirm your account."
}
```

### User Login
**Endpoint:** `/login`
**Method:** `POST`
**Description:** Authenticates the user and starts a session.
**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
**Response:**
```json
{
  "error": false,
  "message": "Login successful",
  "redirectTo": "/dashboard"
}
```

### Confirm Email
**Endpoint:** `/confirm-email`
**Method:** `GET`
**Description:** Verifies the user's email using the token sent via email.
**Query Parameters:**
- `token`: The email verification token.

### Reset Password Request
**Endpoint:** `/request-password-reset`
**Method:** `POST`
**Description:** Sends a password reset email to the user.
**Request Body:**
```json
{
  "email": "user@example.com"
}
```
**Response:**
```json
{
  "error": false,
  "message": "Password reset email sent"
}
```

### Reset Password
**Endpoint:** `/reset-password`
**Method:** `POST`
**Description:** Resets the user's password using the token sent via email.
**Request Body:**
```json
{
  "token": "resetToken",
  "password": "newpassword123"
}
```
**Response:**
```json
{
  "error": false,
  "message": "Password reset successfully"
}
```

### Logout
**Endpoint:** `/logout`
**Method:** `POST`
**Description:** Logs the user out and destroys the session.
**Response:**
```json
{
  "error": false,
  "message": "Logged out successfully"
}
```

## Session Management
- Sessions are managed using `client-sessions` middleware.
- The session cookie is named `session` and is configured with a secret and duration.

## Email Verification and Password Reset
- Email verification and password reset functionality are implemented using tokens stored in the database.
- Email content and sending are handled by the `email.js` module.

## Middleware
- **CORS:** Configured to allow all origins and common HTTP methods.
- **Body Parser:** Parses incoming request bodies in JSON and URL-encoded formats.
- **Cookie Parser:** Parses cookies attached to the client request.

## Running the Application
After completing the installation steps, start the application with:
```sh
node index.js
```
Access the application at `http://localhost:3000`.

## Contributing
Contributions are welcome! Please fork the repository and submit a pull request for review.

## License
This project is licensed under the MIT License.

---

Feel free to customize this README to better fit your project's needs.
