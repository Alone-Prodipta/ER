import mongoose from 'mongoose';

export default async function connectDatabase() {
  const uri = process.env.MONGODB_URI;
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  console.log('Connected to MongoDB');
}
