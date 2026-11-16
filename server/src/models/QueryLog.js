import mongoose from 'mongoose';
import { getModel } from '../config/db.js';

const queryLogSchema = new mongoose.Schema(
  {
    endpoint: {
      type: String,
      required: true,
    },
    queryType: {
      type: String,
      enum: ['CVE', 'IOC', 'MALWARE', 'MITRE', 'REPORT'],
      required: true,
    },
    queryParam: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: 'SUCCESS',
    },
    source: {
      type: String,
      default: 'EXTERNAL_API',
    },
    responseTimeMs: {
      type: Number,
      default: 0,
    },
    userEmail: {
      type: String,
      default: 'anonymous',
    },
  },
  { timestamps: true }
);

const MongooseQueryLog = mongoose.model('QueryLog', queryLogSchema);
const QueryLog = getModel('QueryLog', MongooseQueryLog);
export default QueryLog;
