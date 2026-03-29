function roleCheck(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401);
      return next(new Error("Not authorized"));
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403);
      return next(new Error("Forbidden"));
    }

    return next();
  };
}

module.exports = { roleCheck };

