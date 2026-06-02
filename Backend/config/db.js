const mongoose = require('mongoose');
 
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    // Do not exit the process here to allow the server to start in
    // development environments where MongoDB is not available.
    // Routes that depend on the database should handle missing
    // connections appropriately.
    return null;
  }
};
 
module.exports = connectDB;