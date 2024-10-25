const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Attempt to connect to the database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully');
    
    // Additional event listeners for connection status
    mongoose.connection.on('connected', () => {
      console.log('Mongoose is connected to the database');
    });

    mongoose.connection.on('error', (err) => {
      console.error('Mongoose connection error:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('Mongoose is disconnected from the database');
    });
    
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1); // Exit with failure
  }
};

module.exports = connectDB;
