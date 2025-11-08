require('dotenv').config();

const { MongoClient } = require('mongodb');

async function testConnection() {
    console.log('Testing MongoDB Connection...');
    console.log('Connection String:', process.env.MONGODB_URI.replace(/:(.*)@/, ':****@'));
    
    try {
        const client = new MongoClient(process.env.MONGODB_URI);
        await client.connect();
        console.log('✅ SUCCESS: Connected to MongoDB!');
        await client.close();
    } catch (error) {
        console.log('❌ ERROR:', error.message);
        console.log('💡 TIPS:');
        console.log('1. Check your username/password in the connection string');
        console.log('2. Make sure your IP is whitelisted in MongoDB Atlas');
        console.log('3. Verify your cluster name is correct');
    }
}

testConnection();