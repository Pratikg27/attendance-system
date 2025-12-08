const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

const requireAdmin = (req, res, next) => {
  console.log('🔍 User attempting access:', req.user);
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      message: 'Admin access required',
      currentRole: req.user.role
    });
  }
  
  console.log('✅ Admin access granted');
  next();
};

module.exports = { authenticateToken, requireAdmin };