export const runtime = 'nodejs';

import mongoose from 'mongoose';
import { isBuildTime } from './buildUtils';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI && process.env.NODE_ENV !== 'development' && !isBuildTime()) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

const cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function connectDB() {
  if (isBuildTime()) {
    console.log('Skipping DB connection during build/static generation');
    return null;
  }

  try {
    if (cached.conn) {
      return cached.conn;
    }

    console.log('Connecting to MongoDB:', {
      timestamp: new Date().toISOString(),
      uri: process.env.MONGODB_URI?.replace(/:[^:@]+@/, ':***@'),
      currentState: mongoose.connection.readyState
    });

    if (!cached.promise) {
      const opts = {
        bufferCommands: true,
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 10000,
      };

      cached.promise = mongoose.connect(MONGODB_URI!, opts);
    }

    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    console.error('MongoDB connection error:', {
      error: e,
      stack: e instanceof Error ? e.stack : undefined,
      uri: process.env.MONGODB_URI?.replace(/:[^:@]+@/, ':***@')
    });
    throw e;
  }
}

export default connectDB; 