import mongoose from 'mongoose';

/** Connects to MongoDB. Exits the process if the connection fails. */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 8000 });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`MongoDB connection error: ${err.message}`);
    console.error('Check: MongoDB service chal rahi hai? MONGO_URI sahi hai? (Atlas me IP whitelist?)');
    process.exit(1);
  }
};

export default connectDB;
