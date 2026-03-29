/**
 * After protect + roleCheck("staff"): staff must have a department string
 * so clearance data is always scoped to one department.
 */
function requireStaffDepartment(req, res, next) {
  if (!req.user) {
    res.status(401);
    return next(new Error("Not authorized"));
  }
  const dept = req.user.department && String(req.user.department).trim();
  if (!dept) {
    res.status(403);
    return next(new Error("Staff account is not assigned to a department"));
  }
  return next();
}

module.exports = { requireStaffDepartment };
