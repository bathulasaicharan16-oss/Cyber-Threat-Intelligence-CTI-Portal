import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { getModel } from '../config/db.js';

const userSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['SECURITY_ANALYST', 'SOC_TEAM', 'TI_RESEARCHER'],
      required: true,
      default: 'SECURITY_ANALYST',
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

userSchema.statics.register = async function ({ userId, email, password, role, name }) {
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);
  const user = new this({
    userId,
    name: name || email.split('@')[0],
    email,
    passwordHash,
    role,
  });
  return await user.save();
};

const MongooseUser = mongoose.model('User', userSchema);
const User = getModel('User', MongooseUser);
export default User;
