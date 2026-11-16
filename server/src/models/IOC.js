import mongoose from 'mongoose';
import { getModel } from '../config/db.js';

const iocSchema = new mongoose.Schema(
  {
    value: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['IP', 'DOMAIN', 'URL', 'HASH'],
      required: true,
    },
    reputationScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 0,
    },
    abuseConfidence: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 0,
    },
    otxPulses: [
      {
        id: String,
        name: String,
        author: String,
        created: Date,
        tags: [String],
        adversary: String,
      },
    ],
    geolocation: {
      country: String,
      countryCode: String,
      city: String,
      isp: String,
    },
    lastReportedAt: {
      type: Date,
      default: Date.now,
    },
    queriedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

iocSchema.methods.consolidate = function () {
  const pulseFactor = Math.min((this.otxPulses?.length || 0) * 12, 100);
  const abuseFactor = this.abuseConfidence || 0;
  this.reputationScore = Number(((abuseFactor * 0.6) + (pulseFactor * 0.4)).toFixed(1));
  return this.reputationScore;
};

const MongooseIOC = mongoose.model('IOC', iocSchema);
const IOC = getModel('IOC', MongooseIOC);
export default IOC;
