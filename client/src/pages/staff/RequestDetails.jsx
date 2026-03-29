import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import Card from "../../components/common/Card";
import Loader from "../../components/common/Loader";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { useState } from "react";
import {
  approveParallel,
  approveSequential,
  getRequestDetails,
  rejectParallel,
  rejectSequential
} from "../../services/staffService";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../components/common/Toast";
import { createApi } from "../../services/api";

export default function RequestDetails() {
  const { clearanceId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const toast = useToast();
  const [remarks, setRemarks] = useState("");

  const q = useQuery({
    queryKey: ["staff-request", clearanceId],
    queryFn: () => getRequestDetails(token, clearanceId),
    enabled: Boolean(token && clearanceId),
    retry: false
  });

  const phase = q.data?.sequentialSubmission ? "sequential" : "parallel";
  const approveM = useMutation({
    mutationFn: () =>
      phase === "sequential"
        ? approveSequential(token, clearanceId, remarks)
        : approveParallel(token, clearanceId, remarks),
    onSuccess: () => {
      toast.push({ type: "success", message: "Approved" });
      q.refetch();
    },
    onError: (err) =>
      toast.push({ type: "error", message: err?.response?.data?.error?.message || "Failed" })
  });
  const rejectM = useMutation({
    mutationFn: () =>
      phase === "sequential"
        ? rejectSequential(token, clearanceId, remarks)
        : rejectParallel(token, clearanceId, remarks),
    onSuccess: () => {
      toast.push({ type: "warning", message: "Rejected" });
      q.refetch();
    },
    onError: (err) =>
      toast.push({ type: "error", message: err?.response?.data?.error?.message || "Failed" })
  });

  if (q.isLoading) return <div className="p-6"><Loader /></div>;

  if (q.isError) {
    const status = q.error?.response?.status;
    const msg = q.error?.response?.data?.error?.message || q.error?.message;
    return (
      <div className="p-6 space-y-4">
        <Card>
          <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
            {status === 403
              ? "This clearance is not assigned to your department. You can only review requests for your own department."
              : status === 404
                ? "Request not found."
                : msg || "Could not load this request."}
          </p>
          <Button className="mt-4" variant="secondary" onClick={() => navigate("/staff")}>
            Back to staff dashboard
          </Button>
        </Card>
      </div>
    );
  }

  const { student, clearance, documents, sequentialSubmission, parallelSubmission } = q.data || {};
  const submission = sequentialSubmission || parallelSubmission;
  const decided = submission?.status && submission.status !== "pending";
  const hasDocs = (documents || []).length > 0;

  return (
    <div className="p-6 space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Request details</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Matric: {clearance?.matricNumber}
        </p>
      </div>

      <Card>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-medium">Student</div>
            <div>{student?.name}</div>
            <div className="text-slate-600 dark:text-slate-300">{student?.email}</div>
          </div>
          <div>
            <div className="font-medium">Submission</div>
            <div>Status: {submission?.status}</div>
            <div className="text-slate-600 dark:text-slate-300">{submission?.remarks || ""}</div>
          </div>
        </div>
      </Card>

      <Card>
        <div className="font-semibold mb-3">Documents</div>
        <div className="space-y-2">
          {(documents || []).map((d) => (
            <div key={d._id} className="flex items-center justify-between gap-4 text-sm">
              <div>
                <div className="font-medium">{d.filename}</div>
                <div className="text-xs text-slate-600 dark:text-slate-300">
                  {d.uploadDate ? new Date(d.uploadDate).toLocaleString() : ""}
                </div>
              </div>
              <Button
                variant="ghost"
                onClick={async () => {
                  const api = createApi(token);
                  const res = await api.get(`/documents/${d._id}/download`, { responseType: "blob" });
                  const url = URL.createObjectURL(res.data);
                  window.open(url, "_blank");
                  setTimeout(() => URL.revokeObjectURL(url), 30000);
                }}
              >
                Download
              </Button>
            </div>
          ))}
          {(!documents || documents.length === 0) && (
            <div className="text-sm text-slate-600 dark:text-slate-300">No documents uploaded yet.</div>
          )}
        </div>
      </Card>

      <Card>
        <div className="grid md:grid-cols-2 gap-4 items-end">
          {decided ? (
            <div className="md:col-span-2 flex items-center justify-between gap-4">
              <div className="text-sm">
                Decision:{" "}
                <span className="rounded-full px-3 py-1 bg-slate-100/70 dark:bg-slate-900/40">
                  {submission?.status}
                </span>
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-300">
                Actions are disabled after a decision.
              </div>
            </div>
          ) : (
            <>
              <Input label="Remarks (optional)" value={remarks} onChange={(e) => setRemarks(e.target.value)} />
              <div className="flex gap-2 md:justify-end">
                <Button
                  variant="danger"
                  onClick={() => rejectM.mutate()}
                  disabled={rejectM.isPending || !hasDocs}
                >
                  {rejectM.isPending ? "Rejecting..." : "Reject"}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => approveM.mutate()}
                  disabled={approveM.isPending || !hasDocs}
                >
                  {approveM.isPending ? "Approving..." : "Approve"}
                </Button>
              </div>
              {!hasDocs ? (
                <div className="md:col-span-2 text-xs text-amber-800 dark:text-amber-200">
                  Staff actions are disabled until the student uploads at least one document for your department.
                </div>
              ) : null}
            </>
          )}
        </div>
      </Card>
    </div>
  );
}

