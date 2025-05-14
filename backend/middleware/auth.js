const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'No auth token found, access denied'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    
    // Add user to request
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({
      status: 'fail',
      message: 'Token is not valid'
    });
  }
};

module.exports = auth;