const jwt = require('jsonwebtoken');

const verifyToken = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(403).json({ error: 'A token is required for authentication' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
    req.user = decoded;

    // Retrieve the user from the database to check if they are active
    const { User } = require('../models');
    const user = await User.findByPk(decoded.id);
    if (!user || user.is_active === false) {
      return res.status(403).json({ error: 'Access denied. Your account is blocked.' });
    }
  } catch (err) {
    return res.status(401).json({ error: 'Invalid Token' });
  }
  
  return next();
};

const isRole = (role) => {
  return (req, res, next) => {
    if (req.user && req.user.role === role) {
      return next();
    }
    return res.status(403).json({ error: `Requires ${role} role` });
  };
};

const isAdmin = isRole('ADMIN');
const isInterviewer = isRole('INTERVIEWER');
const isStudent = isRole('STUDENT');

module.exports = {
  verifyToken,
  isAdmin,
  isInterviewer,
  isStudent
};
