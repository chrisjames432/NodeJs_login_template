const moment = require('moment-timezone');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config();


async function writeToMongo(pageName, ipAddress, timestamp, db, collectionName) {
    const dataToUpdate = {
        $push: {
            visits: {
                timestamp: timestamp,
                pageName: pageName
            }
        }
    };

    try {
        const collection = db.collection(collectionName); // Collection to store visited pages

        // Update the document with the new visit information or create a new document if it doesn't exist
        const result = await collection.updateOne(
            { ipAddress: ipAddress }, // Filter by IP address
            { $setOnInsert: { ipAddress: ipAddress }, ...dataToUpdate }, // Set IP address if creating a new document
            { upsert: true } // Create a new document if one doesn't exist
        );

        console.log('Page name and timestamp updated/added for IP:', ipAddress, pageName, timestamp);

        return result;
    } catch (error) {
        console.error('Error writing to MongoDB:', error);
        throw error;
    }
}

async function connectAndWriteToMongo(pageName, req, dbName, collectionName) {
    const timestamp = moment().tz('America/Phoenix').format('YYYY-MM-DD HH:mm:ss');
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    let ipAddress = ip;

    // Extract IPv4 address from IPv6 representation
    if (ipAddress && ipAddress.startsWith('::ffff:')) {
        ipAddress = ipAddress.substr(7);
    }

    // Connect to MongoDB
    
    const uri = process.env.MONGO_URI;
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        await client.connect();
        const db = client.db(dbName); // Access the database

        // Call writeToMongo function with actual data
        await writeToMongo(pageName, ipAddress, timestamp, db, collectionName);
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw error;
    } finally {
        try {
            await client.close();
        } catch (closeError) {
            console.error('Error closing MongoDB connection:', closeError);
        }
    }
}

async function checkip(pageName, req) {
    // Specify the database and collection names
    const dbName = 'mtcdata';
    const collectionName = 'visited_pages';
    console.log('check ip')
    try {
        // Call connectAndWriteToMongo function with real data
        await connectAndWriteToMongo(pageName, req, dbName, collectionName);
        console.log('Operation completed successfully.');
    } catch (error) {
        console.error('Operation failed:', error);
    }
}

module.exports = { checkip };
