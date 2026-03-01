const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect('mongodb://127.0.0.1:27017/jalt');
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('⚠️ MongoDB connection error:', err.message);
    console.log('⚠️ The server is still running, but saving users will fail until the database is on.');
    // No process.exit(1) here!
  }
};

module.exports = connectDB;