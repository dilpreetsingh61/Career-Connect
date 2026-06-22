const { createClient } = require('redis');
require('dotenv').config();

const client = createClient({
    username: process.env.REDIS_UNAME,
    password: process.env.REDIS_PASS,
    socket: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT
    }
});

client.on('error', err => console.error('Redis Client Error', err));
client.on('connect', () => console.log('Redis Client Connected'));

// Export an async function to get the connected client, 
// or immediately invoke connect and export the client if it's top-level
const connectRedis = async () => {
    if (!client.isOpen) {
        await client.connect();
    }
    return client;
};

// Initialize connection
connectRedis().catch(console.error);

module.exports = client;
