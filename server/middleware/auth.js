const jwt = require("jsonwebtoken");
const User = require("../models/User");

function getTokenFromRequest(req) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) return authHeader.slice("Bearer ".length);
  return null;
}

async function protect(req, res, next) {
  try {
    const token = getTokenFromRequest(req);
    if (!token) {
      res.status(401);
      throw new Error("Not authorized: missing token");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user || user.isActive === false) {
      res.status(401);
      throw new Error("Not authorized: invalid user");
    }

    req.user = user;
    return next();
  } catch (err) {
    res.status(401);
    return next(err);
  }
}

module.exports = { protect };

