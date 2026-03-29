import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import Modal from "../../components/common/Modal";
import {
  getClearanceStatus,
  getEligibleParallelDepartments,
  initiateClearance,
  submitParallelBulk,
  submitParallelSingle,
  submitSequential
} from "../../services/studentService";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../components/common/Toast";
import ClearanceProgress from "../../components/clearance/ClearanceProgress";
import SequentialPhase from "../../components/clearance/SequentialPhase";
import ParallelPhase from "../../components/clearance/ParallelPhase";
import BulkUploadModal from "../../components/clearance/BulkUploadModal";
import ClearanceTimeline from "../../components/clearance/ClearanceTimeline";
import { connectSocketWhenHealthy } from "../../utils/socketClient";

function extractDeptId(item) {
  if (!item) return "";
  const d = item.departmentId;
  if (d == null) return "";
  if (typeof d === "string") return d;
  if (typeof d === "object") {
    if (d._id != null) return String(d._id);
    if (d.$oid) return String(d.$oid);
    if (d.id != null) return String(d.id);
    if (typeof d.toString === "function") {
      const s = String(d.toString());
      if (s && s !== "[object Object]") return s;
    }
  }
  return "";
}

export default function ClearanceStatus() {
  const { token, user } = useAuth();
  const toast = useToast();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadDeptId, setUploadDeptId] = useState("");
  const [uploadPhase, setUploadPhase] = useState("sequential");
  const [file, setFile] = useState(null);
  const [bulkOpen, setBulkOpen] = useState(false);

  const statusQ = useQuery({
    queryKey: ["student-clearance-status"],
    queryFn: () => getClearanceStatus(token),
    enabled: Boolean(token)
  });
  const eligibleQ = useQuery({
    queryKey: ["eligible-parallel"],
    queryFn: () => getEligibleParallelDepartments(token),
    enabled: Boolean(token && statusQ.data?.clearance?.parallelPhase?.canSubmit)
  });

  const initiateM = useMutation({
    mutationFn: () => initiateClearance(token),
    onSuccess: () => statusQ.refetch(),
    onError: (err) =>
      toast.push({
        type: "error",
        message: err?.response?.data?.error?.message || "Failed to initiate clearance"
      })
  });

  const uploadM = useMutation({
    mutationFn: () => submitSequential(token, uploadDeptId, file),
    onSuccess: () => {
      toast.push({ type: "success", message: "Uploaded successfully" });
      setUploadOpen(false);
      setFile(null);
      statusQ.refetch();
    },
    onError: (err) =>
      toast.push({
        type: "error",
        message: err?.response?.data?.error?.message || "Upload failed"
      })
  });
  const parallelSingleM = useMutation({
    mutationFn: ({ departmentId, nextFile }) => submitParallelSingle(token, departmentId, nextFile),
    onSuccess: () => {
      toast.push({ type: "success", message: "Parallel submission sent" });
      setUploadOpen(false);
      setFile(null);
      statusQ.refetch();
    },
    onError: (err) =>
      toast.push({
        type: "error",
        message: err?.response?.data?.error?.message || err?.message || "Upload failed"
      })
  });
  const parallelBulkM = useMutation({
    mutationFn: ({ departmentIds, files }) => submitParallelBulk(token, departmentIds, files),
    onSuccess: () => {
      toast.push({ type: "success", message: "Bulk parallel submission sent" });
      setBulkOpen(false);
      statusQ.refetch();
    },
    onError: (err) =>
      toast.push({
        type: "error",
        message: err?.response?.data?.error?.message || err?.message || "Bulk upload failed"
      })
  });

  useEffect(() => {
    if (!token || !user) return undefined;

    const celebrate = async () => {
      const confetti = (await import("canvas-confetti")).default;
      confetti({ particleCount: 120, spread: 90, origin: { y: 0.6 } });
    };

    return connectSocketWhenHealthy({
      setup: (socket) => socket.emit("join", { userId: user._id || user.id }),
      handlers: {
        parallel_ready: () => {
          toast.push({ type: "success", message: "Parallel phase unlocked" });
          celebrate().catch(() => {});
        },
        certificate_ready: () => {
          toast.push({ type: "success", message: "Certificate is now ready" });
          celebrate().catch(() => {});
        }
      }
    });
  }, [token, user, toast]);

  if (statusQ.isLoading) return <div className="p-6"><Loader /></div>;

  const clearance = statusQ.data?.clearance;
  const progress = statusQ.data?.progress || {};
  const seqSubs = clearance?.sequentialPhase?.submissions || [];
  const parSubs = clearance?.parallelPhase?.submissions || [];
  const seqPct = seqSubs.length ? Math.round((seqSubs.filter((s) => s.status === "approved").length / seqSubs.length) * 100) : 100;
  const parPct = parSubs.length ? Math.round((parSubs.filter((s) => s.status === "approved").length / parSubs.length) * 100) : 100;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Clearance Status</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Track your clearance in real time.
          </p>
        </div>
        {!clearance ? (
          <Button onClick={() => initiateM.mutate()} disabled={initiateM.isPending}>
            {initiateM.isPending ? "Starting..." : "Initiate clearance"}
          </Button>
        ) : null}
      </div>

      {clearance ? <ClearanceProgress overall={progress?.percent ?? 0} sequential={seqPct} parallel={parPct} status={clearance.status} /> : null}

      {clearance ? (
        <>
          <SequentialPhase
            submissions={seqSubs}
            currentStage={clearance?.sequentialPhase?.currentStage || 0}
            onUpload={(s) => {
              setUploadDeptId(extractDeptId(s));
              setUploadPhase("sequential");
              setUploadOpen(true);
            }}
          />
          <ParallelPhase
            canSubmit={Boolean(clearance?.parallelPhase?.canSubmit)}
            submissions={parSubs}
            onSubmitAll={() => setBulkOpen(true)}
            onSubmitSingle={(s) => {
              setUploadDeptId(extractDeptId(s));
              setUploadPhase("parallel");
              setUploadOpen(true);
            }}
          />
          <ClearanceTimeline clearance={clearance} />
        </>
      ) : null}

      <Modal
        open={uploadOpen}
        title="Upload document (single)"
        onClose={() => {
          setUploadOpen(false);
          setFile(null);
          setUploadPhase("sequential");
        }}
      >
        <div className="space-y-4">
          <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          <Button
            onClick={() => {
              if (!uploadDeptId) {
                toast.push({ type: "error", message: "Invalid department. Refresh and try again." });
                return;
              }
              if (uploadPhase === "parallel") {
                parallelSingleM.mutate({ departmentId: uploadDeptId, nextFile: file });
              } else {
                uploadM.mutate();
              }
            }}
            disabled={!file || !uploadDeptId || uploadM.isPending || parallelSingleM.isPending}
          >
            {uploadM.isPending || parallelSingleM.isPending ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </Modal>
      <BulkUploadModal
        open={bulkOpen}
        onClose={() => setBulkOpen(false)}
        departments={eligibleQ.data?.items || []}
        onSubmit={(departmentIds, files) => parallelBulkM.mutate({ departmentIds, files })}
        pending={parallelBulkM.isPending}
      />
    </div>
  );
}

