import mongoose from 'mongoose';
import { getModel } from '../config/db.js';

const mitreMappingSchema = new mongoose.Schema(
  {
    mappingId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    tacticId: {
      type: String,
      required: true,
      index: true,
    },
    tacticName: {
      type: String,
      required: true,
    },
    techniqueId: {
      type: String,
      required: true,
      index: true,
    },
    techniqueName: {
      type: String,
      required: true,
    },
    subTechniqueId: {
      type: String,
      default: '',
    },
    subTechniqueName: {
      type: String,
      default: '',
    },
    linkedType: {
      type: String,
      enum: ['CVE', 'IOC', 'MALWARE', 'GENERAL'],
      default: 'GENERAL',
    },
    linkedRef: {
      type: String,
      required: true,
      index: true,
    },
    evidence: {
      type: String,
      default: '',
    },
    confidence: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH'],
      default: 'HIGH',
    },
  },
  { timestamps: true }
);

mitreMappingSchema.methods.mapThreat = function () {
  return {
    mappingId: this.mappingId,
    tactic: `${this.tacticId} - ${this.tacticName}`,
    technique: `${this.techniqueId} - ${this.techniqueName}`,
    linkedType: this.linkedType,
    linkedRef: this.linkedRef,
    confidence: this.confidence,
  };
};

const MongooseMitreMapping = mongoose.model('MitreMapping', mitreMappingSchema);
const MitreMapping = getModel('MitreMapping', MongooseMitreMapping);
export default MitreMapping;
