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





Access the application at `http://localhost:3000`.

## Contributing
Contributions are welcome! Please fork the repository and submit a pull request for review.

## License
This project is licensed under the MIT License.

---


