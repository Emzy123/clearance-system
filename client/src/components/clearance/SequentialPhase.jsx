import { motion } from "framer-motion";
import {
  Layers,
  UploadCloud,
  CheckCircle2,
  Clock,
  AlertCircle,
  Lock,
  FileText
} from "lucide-react";
import Button from "../common/Button";
import Card from "../common/Card";

export default function SequentialPhase({ submissions = [], currentStage = 0, onUpload }) {
  const getStepStatus = (s, idx) => {
    if (s.status === "approved") return "approved";
    if (s.status === "pending") return "pending";
    if (s.status === "rejected") return "rejected";
    if (idx === currentStage) return "active";
    return "locked";
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-900 pb-3">
          <div className="p-2 rounded-xl bg-brand-secondary/15 text-brand-secondary">
            <Layers size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-950 dark:text-white font-display">
              Sequential Clearance Stages
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              These departments must be completed sequentially in the order shown.
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {submissions.map((s, idx) => {
            const status = getStepStatus(s, idx);
            const deptName = s.departmentName || s.departmentId?.name || "Department";
            const deptCode = s.departmentId?.code || "CODE";
            const filename = s.documents?.[s.documents.length - 1]?.filename;

            // Define borders, badges and styles depending on the state
            let borderStyle = "border-slate-100 dark:border-slate-900 bg-white/40 dark:bg-slate-950/20";
            let statusBadge = null;
            let actionButton = null;

            if (status === "approved") {
              borderStyle = "border-emerald-500/20 dark:border-emerald-500/10 bg-emerald-50/10 dark:bg-emerald-950/5";
              statusBadge = (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-md border border-emerald-200/40 dark:border-emerald-900/30">
                  <CheckCircle2 size={12} />
                  Approved
                </span>
              );
              actionButton = (
                <div className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold text-center py-2 bg-emerald-50/40 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900/10 mt-3">
                  Verification Complete
                </div>
              );
            } else if (status === "pending") {
              borderStyle = "border-amber-500/20 dark:border-amber-500/10 bg-amber-50/10 dark:bg-amber-950/5";
              statusBadge = (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded-md border border-amber-200/40 dark:border-amber-900/30">
                  <Clock size={12} className="animate-pulse" />
                  Review Pending
                </span>
              );
              actionButton = (
                <div className="text-xs text-amber-600 dark:text-amber-400 font-semibold text-center py-2 bg-amber-50/40 dark:bg-amber-950/20 rounded-xl border border-amber-100 dark:border-amber-900/10 mt-3 animate-pulse">
                  Awaiting Approval
                </div>
              );
            } else if (status === "rejected") {
              borderStyle = "border-rose-500/30 dark:border-rose-500/10 bg-rose-50/15 dark:bg-rose-950/5";
              statusBadge = (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 px-2 py-0.5 rounded-md border border-rose-200/40 dark:border-rose-900/30">
                  <AlertCircle size={12} />
                  Rejected
                </span>
              );
              actionButton = (
                <Button
                  className="mt-3 w-full bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-sm text-xs font-semibold py-2"
                  onClick={() => onUpload?.(s)}
                >
                  <UploadCloud size={14} className="mr-1.5" />
                  Resubmit Requirement
                </Button>
              );
            } else if (status === "active") {
              borderStyle = "border-brand-secondary/40 dark:border-brand-secondary/20 bg-brand-secondary/[0.04] ring-2 ring-brand-secondary/10";
              statusBadge = (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-brand-secondary bg-brand-secondary/10 px-2 py-0.5 rounded-md border border-brand-secondary/20">
                  Active Stage
                </span>
              );
              actionButton = (
                <Button
                  className="mt-3 w-full rounded-xl text-xs font-semibold py-2 shadow-md shadow-brand-secondary/10"
                  variant="secondary"
                  onClick={() => onUpload?.(s)}
                >
                  <UploadCloud size={14} className="mr-1.5" />
                  Upload Requirement
                </Button>
              );
            } else {
              // Locked
              statusBadge = (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded-md">
                  <Lock size={11} />
                  Locked
                </span>
              );
              actionButton = (
                <Button
                  className="mt-3 w-full rounded-xl text-xs font-semibold py-2"
                  variant="ghost"
                  disabled
                >
                  Locked stage
                </Button>
              );
            }

            return (
              <motion.div
                key={`seq-${idx}-${deptCode}`}
                whileHover={status !== "locked" ? { y: -2 } : {}}
                className={`p-4 rounded-2xl border ${borderStyle} transition-all duration-300 flex flex-col justify-between`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
                      Step {idx + 1}
                    </span>
                    {statusBadge}
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-2 leading-snug font-display">
                    {deptName}
                  </h4>
                  <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    {deptCode}
                  </span>

                  {filename && (
                    <div className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/30 border border-slate-100/50 dark:border-slate-800/40 p-2 rounded-xl">
                      <FileText size={13} className="text-slate-400 flex-shrink-0" />
                      <span className="truncate font-medium">{filename}</span>
                    </div>
                  )}
                </div>

                {actionButton}
              </motion.div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
