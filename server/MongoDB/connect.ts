import mongoose, { ConnectOptions } from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

interface MongoConnectionOptions extends ConnectOptions {
  useNewUrlParser: boolean;
  useUnifiedTopology: boolean;
  serverSelectionTimeoutMS: number;
  socketTimeoutMS: number;
  retryWrites: boolean;
  retryReads: boolean;
}

const connectDB = async (retries = 5): Promise<typeof mongoose> => {
  try {
    const mongoURI = process.env.MONGODB_URL;

    if (!mongoURI) {
      throw new Error('MONGODB_URL is not defined in environment variables');
    }

    const options: MongoConnectionOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      retryReads: true,
    };

    const connection = await mongoose.connect(mongoURI, options);
    
    mongoose.connection.on('error', (err: Error) => {
      console.error('MongoDB connection error:', err);
      if (retries > 0) {
        console.log(`Retrying connection... (${retries} attempts left)`);
        setTimeout(() => connectDB(retries - 1), 5000);
      }
    });
    
    mongoose.connection.once('open', () => {
      console.log('MongoDB connected successfully');
    });

    return connection;
  } catch (error: unknown) {
    if (retries > 0) {
      console.log(`Connection failed, retrying... (${retries} attempts left)`);
      return await connectDB(retries - 1);
    } else {
      console.error('MongoDB connection failed:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  }
};

export default connectDB;
