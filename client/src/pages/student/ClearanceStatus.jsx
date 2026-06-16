import { useEffect, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  UploadCloud,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Download,
  Sparkles,
  User,
  GraduationCap
} from "lucide-react";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import {
  getClearanceStatus,
  getProfile,
  updateProfile,
  initiateClearance,
  submitSequential,
  downloadCertificateUrl,
  downloadDocumentFile
} from "../../services/studentService";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../components/common/Toast";
import ClearanceProgress from "../../components/clearance/ClearanceProgress";
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
  }
  return "";
}

export default function ClearanceStatus() {
  const { token, user } = useAuth();
  const toast = useToast();
  const [file, setFile] = useState(null);

  // Profile Form States
  const [name, setName] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [department, setDepartment] = useState("");
  const [faculty, setFaculty] = useState("");
  const [matricNumber, setMatricNumber] = useState("");
  const [yearOfAdmission, setYearOfAdmission] = useState("");
  const [yearOfGraduation, setYearOfGraduation] = useState("");
  const [classOfDegree, setClassOfDegree] = useState("");

  const statusQ = useQuery({
    queryKey: ["student-clearance-status"],
    queryFn: () => getClearanceStatus(token),
    enabled: Boolean(token)
  });

  const profileQ = useQuery({
    queryKey: ["student-profile"],
    queryFn: () => getProfile(token),
    enabled: Boolean(token)
  });

  useEffect(() => {
    if (profileQ.data) {
      setName(profileQ.data.user?.name || "");
      setProfilePicture(profileQ.data.user?.profilePicture || "");
      setDepartment(profileQ.data.user?.department || "");
      setFaculty(profileQ.data.user?.faculty || "");
      setMatricNumber(profileQ.data.user?.matricNumber || "");
      setYearOfAdmission(profileQ.data.user?.yearOfAdmission || "");
      setYearOfGraduation(profileQ.data.user?.yearOfGraduation || "");
      setClassOfDegree(profileQ.data.user?.classOfDegree || "");
    }
  }, [profileQ.data]);

  const saveProfileM = useMutation({
    mutationFn: () =>
      updateProfile(token, {
        name,
        profilePicture,
        department,
        faculty,
        matricNumber,
        yearOfAdmission,
        yearOfGraduation,
        classOfDegree
      }),
    onSuccess: () => {
      toast.push({ type: "success", message: "Profile saved successfully" });
      profileQ.refetch();
      statusQ.refetch();
    },
    onError: (err) => {
      toast.push({
        type: "error",
        message: err?.response?.data?.error?.message || "Failed to save profile"
      });
    }
  });

  const initiateM = useMutation({
    mutationFn: () => initiateClearance(token),
    onSuccess: () => {
      toast.push({ type: "success", message: "Clearance initiated successfully" });
      statusQ.refetch();
    },
    onError: (err) =>
      toast.push({
        type: "error",
        message: err?.response?.data?.error?.message || "Failed to initiate clearance"
      })
  });

  const handleInitiateClearance = async () => {
    if (!matricNumber.trim()) {
      toast.push({ type: "error", message: "Matric number is required to initiate clearance." });
      return;
    }
    try {
      await saveProfileM.mutateAsync();
      await initiateM.mutateAsync();
    } catch (e) {
      // Error handled by mutations
    }
  };

  const activeSubmission = statusQ.data?.clearance?.sequentialPhase?.submissions?.[
    statusQ.data?.clearance?.sequentialPhase?.currentStage ?? 0
  ];
  const activeDeptId = extractDeptId(activeSubmission);

  const uploadM = useMutation({
    mutationFn: () => submitSequential(token, activeDeptId, file),
    onSuccess: () => {
      toast.push({ type: "success", message: "Clearance document uploaded successfully" });
      setFile(null);
      statusQ.refetch();
    },
    onError: (err) =>
      toast.push({
        type: "error",
        message: err?.response?.data?.error?.message || "Upload failed"
      })
  });

  const downloadCertificateM = useMutation({
    mutationFn: () => downloadCertificateUrl(token),
    onSuccess: (blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `clearance-certificate-${matricNumber || "student"}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.push({ type: "success", message: "Certificate downloaded successfully" });
    },
    onError: (err) =>
      toast.push({
        type: "error",
        message: err?.response?.data?.error?.message || "Failed to download certificate"
      })
  });

  const handleDownload = async (filename, fileUrl) => {
    if (!fileUrl) return;
    const fileId = fileUrl.replace("gridfs:", "");
    try {
      toast.push({ type: "info", message: `Downloading ${filename}...` });
      const blob = await downloadDocumentFile(token, fileId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.push({ type: "success", message: `${filename} downloaded successfully` });
    } catch (err) {
      toast.push({ type: "error", message: "Failed to download document" });
    }
  };

  useEffect(() => {
    if (!token || !user) return undefined;

    const celebrate = async () => {
      const confetti = (await import("canvas-confetti")).default;
      confetti({ particleCount: 120, spread: 90, origin: { y: 0.6 } });
    };

    return connectSocketWhenHealthy({
      setup: (socket) => socket.emit("join", { userId: user._id || user.id }),
      handlers: {
        certificate_ready: () => {
          toast.push({ type: "success", message: "Your graduation clearance certificate is ready!" });
          celebrate().catch(() => {});
          statusQ.refetch();
        }
      }
    });
  }, [token, user, toast, statusQ]);

  if (statusQ.isLoading || profileQ.isLoading) return <div className="p-6"><Loader /></div>;

  const clearance = statusQ.data?.clearance;
  const progress = statusQ.data?.progress || {};

  const currentStageIndex = clearance?.sequentialPhase?.currentStage ?? 0;
  const seqSubs = clearance?.sequentialPhase?.submissions || [];
  const isCompleted = clearance?.status === "approved" || currentStageIndex >= seqSubs.length;

  const activeDeptName = activeSubmission?.departmentName || activeSubmission?.departmentId?.name || "Active Department";
  const activeDeptCode = activeSubmission?.departmentId?.code || "DEPT";
  const activeRemarks = activeSubmission?.remarks || "";
  const lastDoc = activeSubmission?.documents?.[activeSubmission.documents.length - 1];

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 dark:border-slate-900 pb-4">
        <div>
          <h2 className="text-2xl font-bold font-display text-slate-950 dark:text-white">
            Student Clearance Workspace
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Submit academic credentials and track your stage-by-stage clearance.
          </p>
        </div>
        {clearance?.status === "approved" && (
          <Button
            onClick={() => downloadCertificateM.mutate()}
            disabled={downloadCertificateM.isPending}
            className="w-full sm:w-auto bg-brand-secondary hover:bg-brand-secondary/90 text-slate-950 shadow-md shadow-brand-secondary/15 font-semibold"
          >
            {downloadCertificateM.isPending ? "Downloading..." : "Download Clearance Certificate"}
          </Button>
        )}
      </div>

      {/* Standalone Overall Progress Bar */}
      {clearance && (
        <ClearanceProgress
          overall={progress?.percent ?? 0}
          status={clearance.status}
        />
      )}

      {/* Merged Profile & Active Clearance Step Card */}
      <Card className="overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-900 flex items-center gap-3">
          <div className="p-2 bg-brand-primary/10 text-brand-primary rounded-xl">
            <User size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold font-display text-slate-950 dark:text-white">
              Academic Record & Active Requirements
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Update your student records and upload documents for review.
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 p-6">
          {/* Profile Form (Left Column) */}
          <div className="lg:col-span-7 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 flex items-center gap-2">
              <GraduationCap size={15} className="text-brand-secondary" />
              Student Profile Information
            </h4>
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
              <Input label="Matric Number" value={matricNumber} onChange={(e) => setMatricNumber(e.target.value)} />
              <Input label="Faculty" value={faculty} onChange={(e) => setFaculty(e.target.value)} />
              <Input label="Department" value={department} onChange={(e) => setDepartment(e.target.value)} />
              <Input label="Year of Admission" value={yearOfAdmission} onChange={(e) => setYearOfAdmission(e.target.value)} placeholder="e.g. 2022" />
              <Input label="Year of Graduation" value={yearOfGraduation} onChange={(e) => setYearOfGraduation(e.target.value)} placeholder="e.g. 2026" />
              <div className="sm:col-span-2">
                <Input label="Class of Degree" value={classOfDegree} onChange={(e) => setClassOfDegree(e.target.value)} placeholder="e.g. First Class Honours" />
              </div>
            </div>
          </div>

          {/* Active Clearance Requirements (Right Column) */}
          <div className="lg:col-span-5 flex flex-col justify-between p-5 rounded-2xl bg-slate-50/60 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
                Active Clearance Requirement
              </h4>

              {!clearance ? (
                <div className="space-y-3 py-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                    <AlertCircle size={22} />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-slate-800 dark:text-slate-200">Clearance Not Initiated</h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                      Fill in your profile details on the left, especially your Matric Number, and click "Initiate Clearance" to start.
                    </p>
                  </div>
                </div>
              ) : isCompleted ? (
                <div className="space-y-3 py-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center mx-auto text-emerald-500">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-slate-800 dark:text-slate-200">Clearance Complete</h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto leading-relaxed">
                      Your clearance request has been fully verified and approved by all departments. You can download the graduation certificate.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Department Title & Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] uppercase font-extrabold text-brand-secondary bg-brand-secondary/10 px-2 py-0.5 rounded border border-brand-secondary/20">
                        Stage {currentStageIndex + 1}
                      </span>
                      <h5 className="text-sm font-extrabold text-slate-900 dark:text-white mt-1.5 font-display">
                        {activeDeptName} ({activeDeptCode})
                      </h5>
                    </div>
                    
                    {activeSubmission?.status === "pending" && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/50">
                        <Clock size={11} className="animate-pulse" />
                        Pending Review
                      </span>
                    )}
                    {activeSubmission?.status === "rejected" && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200/50">
                        <AlertCircle size={11} />
                        Rejected
                      </span>
                    )}
                    {(activeSubmission?.status === "not_started" || !activeSubmission?.status) && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                        Requires Action
                      </span>
                    )}
                  </div>

                  {/* Active Rejection Comments */}
                  {activeSubmission?.status === "rejected" && activeRemarks && (
                    <div className="p-3 rounded-xl bg-rose-50/50 border border-rose-100 flex items-start gap-2 text-xs text-rose-800">
                      <AlertCircle size={15} className="text-rose-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Remarks: </span>
                        {activeRemarks}
                      </div>
                    </div>
                  )}

                  {/* Upload/Attachment Input Section */}
                  {(activeSubmission?.status === "not_started" || activeSubmission?.status === "rejected") ? (
                    <div className="space-y-3">
                      <label className="block text-xs font-bold text-slate-500 dark:text-slate-400">
                        Upload Supporting Credentials:
                      </label>
                      <div className="group relative border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-brand-primary rounded-2xl p-6 transition-all bg-white dark:bg-slate-950 flex flex-col items-center justify-center cursor-pointer text-center">
                        <input
                          type="file"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={(e) => setFile(e.target.files?.[0] || null)}
                          aria-label="Select file"
                        />
                        <UploadCloud size={28} className="text-slate-400 group-hover:text-brand-primary transition-colors" />
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-2 block">
                          {file ? file.name : "Click or drag file to upload"}
                        </span>
                        <span className="text-[10px] text-slate-400 block mt-1">
                          PDF, JPG, PNG up to 10MB
                        </span>
                      </div>
                    </div>
                  ) : (
                    /* Display Submitted File */
                    lastDoc && (
                      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block">
                          Submitted File:
                        </span>
                        <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-xs">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <FileText size={15} className="text-slate-400 shrink-0" />
                            <span className="truncate font-semibold text-slate-700 dark:text-slate-300">{lastDoc.filename}</span>
                          </div>
                          <button
                            onClick={() => handleDownload(lastDoc.filename, lastDoc.url)}
                            className="inline-flex items-center gap-1 text-xs text-brand-primary dark:text-brand-secondary hover:underline font-semibold shrink-0"
                          >
                            <Download size={13} />
                            Download
                          </button>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            {/* Document Action Button */}
            {clearance && !isCompleted && (
              <div className="mt-6">
                <Button
                  onClick={() => uploadM.mutate()}
                  disabled={
                    !file ||
                    uploadM.isPending ||
                    activeSubmission?.status === "pending"
                  }
                  className="w-full shadow-md bg-brand-primary text-white"
                >
                  {uploadM.isPending ? "Uploading..." : "Submit Stage Requirement"}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Form Action Controls at the Bottom of the Profile Card */}
        <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-950/20 border-t border-slate-100 dark:border-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {clearance ? (
              <span className="inline-flex items-center gap-1.5 font-medium">
                <Sparkles size={13} className="text-brand-secondary" />
                Clearance in progress: Stage {currentStageIndex + 1} of {seqSubs.length} ({activeDeptCode})
              </span>
            ) : (
              <span>Profile updates must be saved prior to initiating clearance.</span>
            )}
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={() => saveProfileM.mutate()}
              disabled={saveProfileM.isPending}
              className="w-full sm:w-auto border-slate-200 hover:bg-slate-100"
            >
              {saveProfileM.isPending ? "Saving..." : "Save Profile"}
            </Button>
            {!clearance && (
              <Button
                onClick={handleInitiateClearance}
                disabled={initiateM.isPending || saveProfileM.isPending}
                className="w-full sm:w-auto bg-brand-primary text-white"
              >
                {initiateM.isPending ? "Initiating..." : "Initiate Clearance"}
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Clearance Roadmap/Timeline */}
      {clearance && <ClearanceTimeline clearance={clearance} />}
    </div>
  );
}
