const checkRole = (roles) => {
  return (req, res, next) => {
    // req.user is set by your existing authMiddleware
    if (!req.user || !roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Access Denied: Insufficient Permissions" });
    }
    next();
  };
};

module.exports = checkRole;
