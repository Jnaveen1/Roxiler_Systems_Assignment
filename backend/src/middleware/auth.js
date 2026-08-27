const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const { sendError } = require('../utils/apiResponse');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    return sendError(res, 401, 'Authentication token is required');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');

    // Fetch user from DB to ensure user exists and hasn't been deleted
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        role: true,
        createdAt: true,
      },
    });

    if (!user) {
      return sendError(res, 403, 'Invalid token: User no longer exists');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 403, 'Session expired. Please log in again.');
    }
    return sendError(res, 403, 'Invalid authentication token.');
  }
};

const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return sendError(res, 403, 'Access denied: User role undefined');
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(res, 403, 'Access denied: You do not have permission to perform this action');
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRoles,
};
