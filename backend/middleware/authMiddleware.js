const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    console.log('🔐 Verifying token...');

    if (!token) {
      console.log('❌ No token provided');
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided' 
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
console.log('✅ Token verified for user:', decoded.id);

// Ensure employee_id is always set for employees
if (decoded.role === 'employee' && !decoded.employee_id) {
  decoded.employee_id = decoded.id;
}

req.user = decoded;
next();

  } catch (error) {
    console.error('❌ Token verification error:', error.message);
    res.status(401).json({ 
      success: false, 
      message: 'Invalid token' 
    });
  }
};

// Export BOTH ways for compatibility
module.exports = verifyToken;
module.exports.verifyToken = verifyToken;