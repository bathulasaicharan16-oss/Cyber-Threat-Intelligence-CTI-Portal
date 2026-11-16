import mongoose from 'mongoose';
import { getModel } from '../config/db.js';

const alertSchema = new mongoose.Schema(
  {
    alertId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    severity: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      required: true,
      default: 'MEDIUM',
    },
    status: {
      type: String,
      enum: ['GENERATED', 'UNREAD', 'READ', 'DISMISSED'],
      default: 'UNREAD',
      index: true,
    },
    sourceType: {
      type: String,
      enum: ['CVE', 'IOC', 'MALWARE', 'SYSTEM'],
      default: 'SYSTEM',
    },
    sourceRef: {
      type: String,
      required: true,
    },
    mitreTactic: {
      type: String,
      default: '',
    },
    mitreTechnique: {
      type: String,
      default: '',
    },
    readAt: {
      type: Date,
      default: null,
    },
    dismissedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

alertSchema.methods.markRead = async function () {
  this.status = 'READ';
  this.readAt = new Date();
  return await this.save();
};

alertSchema.methods.dismiss = async function () {
  this.status = 'DISMISSED';
  this.dismissedAt = new Date();
  return await this.save();
};

const MongooseAlert = mongoose.model('Alert', alertSchema);
const Alert = getModel('Alert', MongooseAlert);
export default Alert;
