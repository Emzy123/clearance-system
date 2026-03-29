const Department = require("../models/Department");

function extractId(value) {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    if (value._id != null) return String(value._id);
    if (value.$oid) return String(value.$oid);
    if (typeof value.toString === "function") {
      const s = String(value.toString());
      if (s && s !== "[object Object]") return s;
    }
  }
  return "";
}

function mapDocumentRef({ filename, url }) {
  return { filename, url, uploadedAt: new Date() };
}

async function getDepartmentPhases() {
  const departments = await Department.find({ isActive: true }).sort({ clearanceOrder: 1 }).lean();
  const hasConfiguredPhases = departments.some((d) => d.phase?.type === "sequential" || d.phase?.type === "parallel");

  // Backward compatibility: if old departments don't have phase configuration yet,
  // treat all active departments as sequential in clearanceOrder.
  const normalized = hasConfiguredPhases
    ? departments
    : departments.map((d, idx) => ({
        ...d,
        phase: { ...(d.phase || {}), type: "sequential", order: idx + 1 }
      }));

  const sequential = normalized
    .filter((d) => d.phase?.type === "sequential")
    .sort((a, b) => (a.phase?.order || 9999) - (b.phase?.order || 9999));
  const parallel = normalized.filter((d) => d.phase?.type === "parallel");
  return { departments, sequential, parallel };
}

function buildInitialPhases(sequential, parallel) {
  return {
    sequentialPhase: {
      isCompleted: sequential.length === 0,
      currentStage: 0,
      submissions: sequential.map((d, idx) => ({
        departmentId: d._id,
        departmentName: d.name,
        order: idx + 1,
        status: "pending",
        remarks: "",
        documents: [],
        resubmissionCount: 0
      }))
    },
    parallelPhase: {
      // Parallel submissions are always open; departments can be submitted independently.
      isActive: true,
      canSubmit: true,
      submissions: parallel.map((d) => ({
        departmentId: d._id,
        departmentName: d.name,
        status: "not_started",
        remarks: "",
        documents: []
      }))
    }
  };
}

function calculateProgress(clearance) {
  const seqTotal = clearance.sequentialPhase?.submissions?.length || 0;
  const parTotal = clearance.parallelPhase?.submissions?.length || 0;
  const seqApproved =
    clearance.sequentialPhase?.submissions?.filter((s) => s.status === "approved").length || 0;
  const parApproved =
    clearance.parallelPhase?.submissions?.filter((s) => s.status === "approved").length || 0;
  const seqScore = seqTotal ? (seqApproved / seqTotal) * 50 : 50;
  const parScore = parTotal ? (parApproved / parTotal) * 50 : 50;
  return Math.round(seqScore + parScore);
}

function currentSequentialSubmission(clearance) {
  const idx = clearance.sequentialPhase?.currentStage || 0;
  return clearance.sequentialPhase?.submissions?.[idx] || null;
}

function applyTopLevelStatus(clearance) {
  const seqItems = clearance.sequentialPhase?.submissions || [];
  const parItems = clearance.parallelPhase?.submissions || [];
  const seqRejected = seqItems.some((s) => s.status === "rejected");
  const parRejected = parItems.some((s) => s.status === "rejected");
  if (seqRejected || parRejected) {
    clearance.status = "rejected";
    clearance.overallProgress = calculateProgress(clearance);
    return;
  }

  const seqDone = seqItems.every((s) => s.status === "approved");
  const parDone = parItems.length === 0 || parItems.every((s) => s.status === "approved");
  if (seqDone && parDone) {
    clearance.status = "approved";
  } else if (seqDone) {
    clearance.status = "parallel_pending";
  } else if (seqItems.some((s) => s.status === "approved")) {
    clearance.status = "partial_sequential";
  } else {
    clearance.status = "in_progress";
  }

  clearance.overallProgress = calculateProgress(clearance);
}

function addSequentialDocument(clearance, departmentId, documentRef) {
  const current = currentSequentialSubmission(clearance);
  if (!current) return false;
  const currentDeptId = extractId(current.departmentId);
  if (!currentDeptId || currentDeptId !== extractId(departmentId)) return false;
  current.documents.push(mapDocumentRef(documentRef));
  if (current.documents.length > 1) current.resubmissionCount += 1;
  current.lastResubmissionAt = new Date();
  return true;
}

function addParallelDocuments(clearance, submissions) {
  const rows = clearance.parallelPhase?.submissions;
  if (!Array.isArray(rows)) return;
  for (const item of submissions) {
    const target = rows.find((s) => extractId(s.departmentId) === extractId(item.departmentId));
    if (!target) continue;
    target.documents.push(...(item.documents || []).map(mapDocumentRef));
    target.submittedAt = new Date();
    target.status = "pending";
  }
}

function decideSequential(clearance, staffUserId, remarks, approved) {
  const current = currentSequentialSubmission(clearance);
  if (!current) return { movedToParallel: false, done: false };
  current.status = approved ? "approved" : "rejected";
  current.remarks = remarks || "";
  current.approvedBy = staffUserId;
  current.approvedAt = new Date();
  if (!approved) {
    applyTopLevelStatus(clearance);
    return { movedToParallel: false, done: false };
  }

  const nextIndex = (clearance.sequentialPhase.currentStage || 0) + 1;
  if (nextIndex >= clearance.sequentialPhase.submissions.length) {
    clearance.sequentialPhase.isCompleted = true;
    clearance.parallelPhase.isActive = true;
    clearance.parallelPhase.canSubmit = true;
    applyTopLevelStatus(clearance);
    return { movedToParallel: true, done: true };
  }

  clearance.sequentialPhase.currentStage = nextIndex;
  applyTopLevelStatus(clearance);
  return { movedToParallel: false, done: false };
}

function decideParallel(clearance, departmentId, staffUserId, remarks, approved) {
  const item = clearance.parallelPhase?.submissions?.find(
    (s) => extractId(s.departmentId) === extractId(departmentId)
  );
  if (!item) return false;
  item.status = approved ? "approved" : "rejected";
  item.remarks = remarks || "";
  item.approvedBy = staffUserId;
  item.approvedAt = new Date();
  applyTopLevelStatus(clearance);
  return true;
}

module.exports = {
  extractId,
  getDepartmentPhases,
  buildInitialPhases,
  calculateProgress,
  currentSequentialSubmission,
  applyTopLevelStatus,
  addSequentialDocument,
  addParallelDocuments,
  decideSequential,
  decideParallel
};
