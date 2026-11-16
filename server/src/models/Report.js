import mongoose from 'mongoose';
import { getModel } from '../config/db.js';

const reportSchema = new mongoose.Schema(
  {
    reportId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
    },
    createdDate: {
      type: Date,
      default: Date.now,
    },
    format: {
      type: String,
      enum: ['PDF'],
      default: 'PDF',
    },
    executiveSummary: {
      type: String,
      default: '',
    },
    records: {
      cves: [
        {
          cveId: String,
          description: String,
          cvssScore: Number,
          severity: String,
        },
      ],
      iocs: [
        {
          value: String,
          type: String,
          reputationScore: Number,
          abuseConfidence: Number,
        },
      ],
      malwareSamples: [
        {
          hash: String,
          fileName: String,
          detectionRatio: Number,
          malwareFamily: String,
        },
      ],
      mitreMappings: [
        {
          tacticId: String,
          tacticName: String,
          techniqueId: String,
          techniqueName: String,
          linkedRef: String,
        },
      ],
    },
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    authorName: {
      type: String,
      default: 'TI Researcher',
    },
    filePath: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

reportSchema.methods.generate = function () {
  return {
    reportId: this.reportId,
    title: this.title,
    createdDate: this.createdDate,
    format: this.format,
    recordsCount: {
      cves: this.records?.cves?.length || 0,
      iocs: this.records?.iocs?.length || 0,
      malware: this.records?.malwareSamples?.length || 0,
      mitre: this.records?.mitreMappings?.length || 0,
    },
  };
};

reportSchema.methods.export = function () {
  return {
    downloadUrl: `/api/reports/${this.reportId}/export`,
    format: this.format,
    reportId: this.reportId,
  };
};

const MongooseReport = mongoose.model('Report', reportSchema);
const Report = getModel('Report', MongooseReport);
export default Report;
