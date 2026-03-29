const test = require("node:test");
const assert = require("node:assert/strict");

const { calculateProgress, applyTopLevelStatus } = require("../utils/clearanceFlow");

test("calculateProgress gives 100 for fully approved phases", () => {
  const clearance = {
    sequentialPhase: {
      submissions: [{ status: "approved" }, { status: "approved" }]
    },
    parallelPhase: {
      submissions: [{ status: "approved" }, { status: "approved" }]
    }
  };

  assert.equal(calculateProgress(clearance), 100);
});

test("applyTopLevelStatus marks request as rejected if any phase rejects", () => {
  const clearance = {
    status: "in_progress",
    sequentialPhase: {
      submissions: [{ status: "approved" }, { status: "rejected" }]
    },
    parallelPhase: {
      submissions: [{ status: "not_started" }]
    },
    overallProgress: 0
  };

  applyTopLevelStatus(clearance);
  assert.equal(clearance.status, "rejected");
  assert.equal(typeof clearance.overallProgress, "number");
});

test("applyTopLevelStatus marks approved when all items are approved", () => {
  const clearance = {
    status: "in_progress",
    sequentialPhase: {
      submissions: [{ status: "approved" }]
    },
    parallelPhase: {
      submissions: [{ status: "approved" }]
    },
    overallProgress: 0
  };

  applyTopLevelStatus(clearance);
  assert.equal(clearance.status, "approved");
  assert.equal(clearance.overallProgress, 100);
});
