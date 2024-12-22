import mongoose, { ConnectOptions } from 'mongoose';

interface MongoConnectionOptions extends ConnectOptions {
  useNewUrlParser: boolean;
  useUnifiedTopology: boolean;
  serverSelectionTimeoutMS: number;
  socketTimeoutMS: number;
  retryWrites: boolean;
  retryReads: boolean;
}

const connectDB = async (retries = 5): Promise<void> => {
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

    await mongoose.connect(mongoURI, options);

    const db = mongoose.connection;
    
    db.on('error', (err: Error) => {
      console.error('MongoDB connection error:', err);
      if (retries > 0) {
        console.log(`Retrying connection... (${retries} attempts left)`);
        setTimeout(() => connectDB(retries - 1), 5000);
      }
    });
    
    db.once('open', () => {
      console.log('MongoDB connected successfully');
    });
  } catch (error: unknown) {
    if (retries > 0) {
      console.log(`Connection failed, retrying... (${retries} attempts left)`);
      setTimeout(() => connectDB(retries - 1), 5000);
    } else {
      console.error('MongoDB connection failed:', error instanceof Error ? error.message : error);
      process.exit(1);
    }
  }
};

export default connectDB;
