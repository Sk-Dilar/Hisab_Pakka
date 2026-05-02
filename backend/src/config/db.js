import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

/** 
 * Global is used here to maintain a cached connection across hot reloads
 * in development and function executions in serverless environments.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  // 1. If we already have a connection, return it immediately
  if (cached.conn) {
    return cached.conn;
  }

  // 2. If no connection promise exists, create a new one
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log("✅ MongoDB Connected (Serverless Cached)");
      return mongoose;
    });
  }

  // 3. Wait for the promise to resolve and cache the connection
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null; // Reset promise on error
    console.error("❌ MongoDB Connection Error:", e);
    throw e;
  }

  return cached.conn;
}

export default connectDB;
