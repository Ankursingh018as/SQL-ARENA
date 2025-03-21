const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No authentication token, access denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Add user ID to request object
    req.user = {
      id: decoded.id,
      username: decoded.username
    };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token is invalid or expired' });
  }
}; 