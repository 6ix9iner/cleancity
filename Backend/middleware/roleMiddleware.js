/**
 * Role-based access control middleware.
 * Usage: router.get('/admin-only', authMiddleware, roleMiddleware('admin'), handler)
 * Usage: router.get('/admin-or-agency', authMiddleware, roleMiddleware('admin', 'agency'), handler)
 */
const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}.`,
      });
    }
    next();
  };
};

module.exports = roleMiddleware;