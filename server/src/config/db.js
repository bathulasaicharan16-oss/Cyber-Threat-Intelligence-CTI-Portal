import mongoose from 'mongoose';
import { memoryDb } from '../db/memoryStore.js';

let isMongooseActive = false;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/cti_portal';

  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 1500,
    });
    isMongooseActive = true;
    console.log(`[Database] Connected to external/local MongoDB at: ${uri}`);
    return;
  } catch (err) {
    console.warn(`[Database] External MongoDB not active (${err.message}).`);
  }

  // Gracefully use high-speed in-memory database store
  isMongooseActive = false;
  console.log(`[Database] In-memory Document Store activated seamlessly. Zero-config mode ready!`);
};

export const isConnected = () => isMongooseActive;

export const getModel = (name, mongooseModel) => {
  return new Proxy(mongooseModel, {
    get(target, prop, receiver) {
      if (!isMongooseActive && memoryDb[name]) {
        const memColl = memoryDb[name];
        const val = memColl[prop];
        if (typeof val === 'function') {
          return val.bind(memColl);
        }
        return val;
      }
      return Reflect.get(target, prop, receiver);
    },
    construct(target, args) {
      if (!isMongooseActive && memoryDb[name]) {
        const memColl = memoryDb[name];
        const doc = memColl.decorate({ ...args[0] });
        return doc;
      }
      return new target(...args);
    },
  });
};
