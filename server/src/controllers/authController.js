import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { v4 as uuidv4 } from 'uuid';

const generateToken = (user) => {
  const secret = process.env.JWT_SECRET || 'bcs502_cti_super_secret_jwt_key_2026_amity_rajasthan';
  return jwt.sign(
    { id: user._id, userId: user.userId, email: user.email, role: user.role },
    secret,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

export const register = async (req, res) => {
  try {
    const { email, password, role, name } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ success: false, error: 'User with this email already exists.' });
    }

    const validRoles = ['SECURITY_ANALYST', 'SOC_TEAM', 'TI_RESEARCHER'];
    const assignedRole = validRoles.includes(role) ? role : 'SECURITY_ANALYST';

    const userId = `USR-${Date.now().toString().slice(-6)}`;
    const user = await User.register({
      userId,
      email: email.toLowerCase(),
      password,
      role: assignedRole,
      name: name || email.split('@')[0],
    });

    const token = generateToken(user);
    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      sessionState: 'Authenticated',
      token,
      user: {
        userId: user.userId,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, sessionState: 'Anonymous' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    // Log login attempt (State Machine: Anonymous -> Authenticating)
    console.log(`[Auth] Authenticating login attempt for: ${email}`);

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password.',
        sessionState: 'Anonymous',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.warn(`[Auth] Login failed: User ${email} not found.`);
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials. User does not exist.',
        sessionState: 'Anonymous',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.warn(`[Auth] Login failed: Password mismatch for ${email}.`);
      return res.status(401).json({
        success: false,
        error: 'Invalid credentials. Incorrect password.',
        sessionState: 'Anonymous',
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user);
    console.log(`[Auth] User ${user.email} authenticated successfully as ${user.role}.`);

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      sessionState: 'Authenticated',
      token,
      user: {
        userId: user.userId,
        email: user.email,
        name: user.name,
        role: user.role,
        lastLogin: user.lastLogin,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message, sessionState: 'Anonymous' });
  }
};

export const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    sessionState: 'Authenticated',
    user: {
      userId: req.user.userId,
      email: req.user.email,
      name: req.user.name,
      role: req.user.role,
      lastLogin: req.user.lastLogin,
    },
  });
};

export const logout = async (req, res) => {
  // User Session State Machine: Authenticated -> Anonymous
  res.status(200).json({
    success: true,
    message: 'User logged out successfully.',
    sessionState: 'Anonymous',
  });
};

/**
 * 1-Click Demo Role Switcher helper
 */
export const demoSwitch = async (req, res) => {
  try {
    const { role } = req.body;
    const emailMap = {
      SECURITY_ANALYST: 'a.rao@soc.org',
      SOC_TEAM: 'soc.lead@soc.org',
      TI_RESEARCHER: 'researcher@soc.org',
    };

    const targetEmail = emailMap[role] || 'a.rao@soc.org';
    const user = await User.findOne({ email: targetEmail });
    if (!user) {
      return res.status(404).json({ success: false, error: `Demo user for role ${role} not found.` });
    }

    const token = generateToken(user);
    res.status(200).json({
      success: true,
      message: `Switched to demo role: ${user.role}`,
      sessionState: 'Authenticated',
      token,
      user: {
        userId: user.userId,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
