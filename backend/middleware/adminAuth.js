module.exports = function (req, res, next) {
  // req.user should be set by the auth middleware
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied: Admin role required' });
  }
  next();
};