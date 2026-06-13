const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  res.status(403);
  throw new Error('Admin access required');
};

const authorize = (...roles) => (req, res, next) => {
  if (req.user && roles.includes(req.user.role)) {
    return next();
  }
  res.status(403);
  throw new Error('Access denied');
};

module.exports = { admin, authorize };
