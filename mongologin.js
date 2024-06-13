const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
require('dotenv').config();
const uri = process.env.MONGO_URI;

const dbName = 'mtcdata';  // Database name is 'mtcdata'

async function connectToDatabase() {
    const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    return client.db(dbName);
}

async function userExists(email) {
    const db = await connectToDatabase();
    const collection = db.collection('users');
    const user = await collection.findOne({ email });
    return !!user;
}

async function createUser(email, password) {
    const hashedPassword = await hashPassword(password);
    const db = await connectToDatabase();
    const collection = db.collection('users');
    const signupTimestamp = new Date();
    const emailToken = crypto.randomBytes(32).toString('hex');

    await collection.insertOne({
        email,
        password: hashedPassword,
        emailVerified: false,
        emailToken,
        admin: false,
        signupTimestamp
    });

    return emailToken;
}

async function verifyEmail(token) {
    const db = await connectToDatabase();
    const collection = db.collection('users');
    console.log(`Verifying token: ${token}`);  // Debug log

    const user = await collection.findOne({ emailToken: token });
    if (user) {
        const result = await collection.updateOne(
            { emailToken: token },
            { $set: { emailVerified: true }, $unset: { emailToken: "" } }
        );
        console.log(`Verification result: ${result}`);  // Debug log
        return user;
    }
    return null;
}

async function findUserByEmail(email) {
    const db = await connectToDatabase();
    const collection = db.collection('users');
    return collection.findOne({ email });
}

async function findUserByToken(token) {
    const db = await connectToDatabase();
    const collection = db.collection('users');

    console.log(`Finding user by token: ${token}`);  // Debug log
    const user = await collection.findOne({ resetToken: token });

    console.log(`Found user: ${user}`);  // Debug log
    return user;
}

async function hashPassword(password) {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
}

async function comparePassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
}

async function savePasswordResetToken(email, resetToken, resetTokenExpiry) {
    const db = await connectToDatabase();
    const collection = db.collection('users');

    const result = await collection.updateOne(
        { email },
        { $set: { resetToken, resetTokenExpiry } }
    );

    console.log(`Token saved: ${resetToken} for email: ${email}`); // Add this log for debugging
    return result;
}

async function updateUserPassword(email, hashedPassword) {
    const db = await connectToDatabase();
    const collection = db.collection('users');

    await collection.updateOne(
        { email },
        { $set: { password: hashedPassword }, $unset: { resetToken: "", resetTokenExpiry: "" } }
    );
}

module.exports = {
    connectToDatabase,
    userExists,
    createUser,
    verifyEmail,
    findUserByEmail,
    findUserByToken,
    hashPassword, // Ensure hashPassword is exported
    comparePassword,
    savePasswordResetToken,
    updateUserPassword
};
