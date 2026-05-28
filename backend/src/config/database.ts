import mongoose from 'mongoose';
import { config } from './index';

export const connectDatabase = async (): Promise<void> => {

  // makes query filtering stricter/safer (helps avoid unexpected query behavior).
  mongoose.set('strictQuery', true);

  await mongoose.connect(config.mongodbUri);
  console.log(`MongoDB connected (${mongoose.connection.name})`);
};

export const disconnectDatabase = async (): Promise<void> => {
  await mongoose.disconnect();
};
