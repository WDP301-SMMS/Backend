import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('MongoDB connected successfully');
  } catch (error: unknown) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectDB;
