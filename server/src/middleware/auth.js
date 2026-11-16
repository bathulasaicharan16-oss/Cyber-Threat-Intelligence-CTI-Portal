import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: No Bearer token provided. Session state: Anonymous.',
        sessionState: 'Anonymous',
      });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'bcs502_cti_super_secret_jwt_key_2026_amity_rajasthan';
    
    let decoded;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      return res.status(401).json({
        success: false,
        error: 'Session expired or invalid token. Session state: Anonymous.',
        sessionState: 'Anonymous',
      });
    }

    const userQuery = User.findById(decoded.id);
    const user = userQuery && typeof userQuery.select === 'function' 
      ? await userQuery.select('-passwordHash') 
      : await userQuery;
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User account not found. Session state: Anonymous.',
        sessionState: 'Anonymous',
      });
    }

    req.user = user;
    req.sessionState = 'Authenticated';
    next();
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: `Authentication failed: ${err.message}`,
      sessionState: 'Anonymous',
    });
  }
};

/**
 * RBAC Guard Middleware
 * @param {Array<string>} allowedRoles
 */
export const authorizeRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. Current state: Anonymous.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Access Denied: Role '${req.user.role}' is not authorized for this operation. Requires one of: [${allowedRoles.join(', ')}].`,
        userRole: req.user.role,
        allowedRoles,
      });
    }

    next();
  };
};
