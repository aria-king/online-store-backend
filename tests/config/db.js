import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/online-shop";
    const conn = await mongoose.connect(uri);
    console.log(`ðŸŸ¢ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("âŒ MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;
