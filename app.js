const express = require('express');
const http = require('http');
const path = require('path');
const bodyParser = require('body-parser');
const sessions = require('client-sessions');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
const { checkip } = require('./checkip.js');
const mongo = require('./mongologin.js');
const { sendConfirmationEmail } = require('./email.js');
const app = express();
const httpPort = 3000;
const httpServer = http.createServer(app);
require('dotenv').config();


httpServer.listen(httpPort, () => {
    console.log('App listening on HTTP port ' + httpPort);
});

app.set('trust proxy', true);
app.use('/client', express.static(path.join(__dirname, '/client')));

app.get('/', (req, res) => {
    checkip(req.path, req);
    res.sendFile(__dirname + '/client/index.html');
});

app.use(cors({
  'allowedHeaders': ['sessionId', 'Content-Type'],
  'exposedHeaders': ['sessionId'],
  'origin': '*',
  'methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
  'preflightContinue': false
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(sessions({
    cookieName: 'session',
    secret: 'djdpq,24a2dd5f8v25s6sa38ss0s8dfsdkfj209u834029ukj3333',
    duration: 30 * 60 * 1000,
    activeDuration: 5 * 60 * 1000
}));

app.use(cookieParser());

const baseURL = process.env.BASE_URL || 'http://localhost:3000';

app.post('/signup', async (req, res) => {
    const { email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        return res.status(400).json({ error: 'Passwords do not match' });
    }

    try {
        const existingUser = await mongo.userExists(email);
        if (existingUser) {
            return res.json({ error: true, message: 'Email already registered. Please log in.' });
        }

        const emailToken = await mongo.createUser(email, password);

        const subject = "Welcome to Our Members!";
        const htmlContent = `
        <html>
            <body>
                <h1>Welcome to Our Members!</h1>
                <p>Thank you for joining our community. Here are some benefits you can enjoy:</p>
                <ul>
                    <li>Exclusive content</li>
                    <li>Special discounts</li>
                    <li>Early access to new products</li>
                </ul>
                <p>We hope you enjoy being a member!</p>
                <p>Please confirm your email by clicking the link below:</p>
                <a href="${baseURL}/confirm-email?token=${emailToken}">Confirm Email</a>
            </body>
        </html>
    `;
    

        await sendConfirmationEmail(email, subject, htmlContent);

        res.json({ error: false, message: 'User created successfully. Please check your email to confirm your account.' });
    } catch (error) {
        console.error('Error signing up user:', error);
        res.json({ error: true, message: 'There was an error!' });
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await mongo.findUserByEmail(email);

        if (!user) {
            return res.status(400).json({ error: true, message: 'Invalid email or password' });
        }

        const isPasswordValid = await mongo.comparePassword(password, user.password);

        if (!isPasswordValid) {
            return res.status(400).json({ error: true, message: 'Invalid email or password' });
        }

        if (!user.emailVerified) {
            return res.status(400).json({ error: true, message: 'Please verify your email first' });
        }

        req.session.user = { id: user._id, email: user.email };

        res.json({ error: false, message: 'Login successful', redirectTo: '/dashboard' });  // Include redirect URL in response
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ error: true, message: 'Internal server error' });
    }
});



app.get('/reset-password', (req, res) => {
    res.sendFile(path.join(__dirname, '/client/reset-password.html'));
});



app.get('/confirm-email', async (req, res) => {
    const { token } = req.query;
    console.log(`Received token: ${token}`);  // Debug log

    try {
        const user = await mongo.verifyEmail(token);
        if (user) {
            console.log(`User after verification: ${user}`);  // Debug log

            req.session.user = { id: user._id, email: user.email };
            res.redirect('/'); // Redirect to the main page
        } else {
            res.status(400).send('Invalid or expired token.');
        }
    } catch (error) {
        console.error('Error confirming email:', error);
        res.status(500).send('Internal server error.');
    }
});



app.get('/dashboard', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/');
    }
    res.sendFile(path.join(__dirname, '/client/dash.html'));  // Serve the new dashboard HTML file
});



app.get('/user', (req, res) => {
    if (!req.session.user) {
        return res.json({ error: true, message: 'Not authenticated' });
    }
    res.json({ error: false, email: req.session.user.email });
});



app.post('/logout', (req, res) => {
    req.session.reset();
    res.json({ error: false, message: 'Logged out successfully' });
});




app.post('/request-password-reset', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await mongo.findUserByEmail(email);
        if (!user) {
            return res.status(400).json({ error: true, message: 'Email not found' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = Date.now() + 3600000; // Token valid for 1 hour

        await mongo.savePasswordResetToken(email, resetToken, resetTokenExpiry);

        const subject = "Password Reset Request";
        const htmlContent = `
        <html>
            <body>
                <h1>Password Reset Request</h1>
                <p>You have requested to reset your password. Click the link below to reset your password:</p>
                <a href="${baseURL}/reset-password?token=${resetToken}">Reset Password</a>
            </body>
        </html>
    `;

        await sendConfirmationEmail(email, subject, htmlContent);

        res.json({ error: false, message: 'Password reset email sent' });
    } catch (error) {
        console.error('Error requesting password reset:', error);
        res.status(500).json({ error: true, message: 'Internal server error' });
    }
});





app.post('/reset-password', async (req, res) => {
    const { token, password } = req.body;

    try {
        const user = await mongo.findUserByToken(token);
        if (!user || user.resetTokenExpiry < Date.now()) {
            return res.status(400).json({ error: true, message: 'Invalid or expired token' });
        }

        const hashedPassword = await mongo.hashPassword(password);

        await mongo.updateUserPassword(user.email, hashedPassword);

        res.json({ error: false, message: 'Password reset successfully' });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ error: true, message: 'Internal server error' });
    }
});


