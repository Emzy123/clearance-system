const ClearanceRequest = require("../models/ClearanceRequest");
const Department = require("../models/Department");

async function getAnalytics(req, res, next) {
  try {
    const total = await ClearanceRequest.countDocuments({});
    const approved = await ClearanceRequest.countDocuments({ status: "approved" });
    const completionRate = total === 0 ? 0 : Math.round((approved / total) * 100);

    const deptList = await Department.find({ isActive: true }).sort({ clearanceOrder: 1 }).lean();
    const departmentStats = [];

    for (const d of deptList) {
      const pending = await ClearanceRequest.countDocuments({
        $or: [
          { "sequentialPhase.submissions": { $elemMatch: { departmentId: d._id, status: "pending" } } },
          { "parallelPhase.submissions": { $elemMatch: { departmentId: d._id, status: "pending" } } }
        ],
        status: { $in: ["pending", "in_progress", "partial_sequential", "parallel_pending"] }
      });
      const approvedForDept = await ClearanceRequest.countDocuments({
        $or: [
          { "sequentialPhase.submissions": { $elemMatch: { departmentId: d._id, status: "approved" } } },
          { "parallelPhase.submissions": { $elemMatch: { departmentId: d._id, status: "approved" } } }
        ]
      });
      departmentStats.push({
        departmentId: d._id,
        name: d.name,
        code: d.code,
        phase: d.phase?.type || "parallel",
        pending,
        approved: approvedForDept
      });
    }

    const [studentsInSequentialPhase, studentsInParallelPhase] = await Promise.all([
      ClearanceRequest.countDocuments({ "sequentialPhase.isCompleted": false }),
      ClearanceRequest.countDocuments({ "parallelPhase.canSubmit": true, status: { $ne: "approved" } })
    ]);

    // Trend by day (last 14 days) based on createdAt approvals count.
    const from = new Date();
    from.setDate(from.getDate() - 13);
    from.setHours(0, 0, 0, 0);

    const trendAgg = await ClearanceRequest.aggregate([
      { $match: { createdAt: { $gte: from } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          total: { $sum: 1 },
          approved: { $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        metrics: {
          totalRequests: total,
          approvedRequests: approved,
          completionRate,
          studentsInSequentialPhase,
          studentsInParallelPhase
        },
        departmentStats,
        trend: trendAgg.map((t) => ({ date: t._id, total: t.total, approved: t.approved }))
      }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { getAnalytics };

