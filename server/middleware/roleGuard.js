const { error } = require('../utils/apiResponse');

/**
 * roleGuard factory — pass allowed roles as arguments
 * Usage: roleGuard('team_leader', 'project_manager')
 */
const roleGuard = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json(error('Unauthorized', 401));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json(
        error(`Access denied. Required roles: ${allowedRoles.join(', ')}`, 403)
      );
    }
    next();
  };
};

module.exports = roleGuard;
