import { motion } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Lock,
  Download,
  FileText,
  Calendar,
  UserCheck
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../components/common/Toast";
import { downloadDocumentFile } from "../../services/studentService";
import Card from "../common/Card";

export default function ClearanceTimeline({ clearance }) {
  const { token } = useAuth();
  const toast = useToast();

  const seq = clearance?.sequentialPhase?.submissions || [];

  // Sequential stages for visual timeline display
  const timelineItems = seq.map((s, idx) => ({
    ...s,
    stepLabel: `Stage ${idx + 1}`
  }));

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

  const getStatusStyle = (status) => {
    switch (status) {
      case "approved":
        return {
          icon: <CheckCircle2 className="text-emerald-500" size={20} />,
          badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/50",
          border: "border-emerald-500/30 dark:border-emerald-500/10 bg-emerald-50/20 dark:bg-emerald-950/5",
          dot: "bg-emerald-500 ring-emerald-400/30 dark:ring-emerald-500/20"
        };
      case "pending":
        return {
          icon: <Clock className="text-amber-500 animate-pulse" size={20} />,
          badge: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/50",
          border: "border-amber-500/30 dark:border-amber-500/10 bg-amber-50/20 dark:bg-amber-950/5",
          dot: "bg-amber-500 ring-amber-400/30 dark:ring-amber-500/20"
        };
      case "rejected":
        return {
          icon: <AlertTriangle className="text-rose-500 animate-bounce" size={20} />,
          badge: "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border border-rose-200/50 dark:border-rose-900/50",
          border: "border-rose-500/30 dark:border-rose-500/10 bg-rose-50/20 dark:bg-rose-950/5",
          dot: "bg-rose-500 ring-rose-400/30 dark:ring-rose-500/20"
        };
      case "not_started":
      default:
        return {
          icon: <Lock className="text-slate-400 dark:text-slate-500" size={20} />,
          badge: "bg-slate-100 text-slate-600 dark:bg-slate-900/60 dark:text-slate-400 border border-slate-200/50 dark:border-slate-800/50",
          border: "border-slate-150 dark:border-slate-900 bg-white/20 dark:bg-slate-950/2",
          dot: "bg-slate-300 dark:bg-slate-700 ring-slate-200/30 dark:ring-slate-800/20"
        };
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-8 border-b border-slate-100 dark:border-slate-900 pb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-950 dark:text-white font-display">
            Interactive Clearance Roadmap
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Follow the stage flow below to track approvals and review feedback.
          </p>
        </div>
      </div>

      <div className="relative pl-8 sm:pl-10 space-y-8 before:absolute before:inset-y-2 before:left-[15px] sm:before:left-[19px] before:w-[2px] before:bg-slate-200 dark:before:bg-slate-800">
        {timelineItems.map((item, idx) => {
          const style = getStatusStyle(item.status);
          const deptName = item.departmentName || item.departmentId?.name || "Department";
          const deptCode = item.departmentId?.code || "CODE";
          const hasDocs = item.documents && item.documents.length > 0;

          return (
            <motion.div
              key={`${item.phaseType}-${idx}-${deptCode}`}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="relative group"
            >
              {/* Timeline Bullet Node */}
              <div className="absolute -left-[32px] sm:-left-[36px] top-1.5">
                <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white dark:bg-slate-950 border-2 border-slate-200 dark:border-slate-800 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}>
                  {style.icon}
                </div>
              </div>

              {/* Department Block Card */}
              <div className={`p-5 rounded-2xl border ${style.border} transition-all duration-300 hover:shadow-sm`}>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
                        {item.stepLabel}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1 font-display">
                      {deptName}
                      <span className="text-xs font-medium text-slate-400 dark:text-slate-500 ml-2">
                        ({deptCode})
                      </span>
                    </h4>
                  </div>

                  {/* Status Badge */}
                  <span className={`inline-flex self-start rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider capitalize ${style.badge}`}>
                    {item.status.replace("_", " ")}
                  </span>
                </div>

                {/* Rejection comments callout */}
                {item.status === "rejected" && item.remarks && (
                  <div className="mt-4 p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-900/30 flex items-start gap-2 text-sm text-rose-900 dark:text-rose-400">
                    <AlertTriangle size={16} className="text-rose-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-semibold text-xs uppercase tracking-wider text-rose-700 dark:text-rose-300">
                        Review Remarks
                      </div>
                      <p className="mt-1 leading-relaxed text-xs">{item.remarks}</p>
                    </div>
                  </div>
                )}

                {/* Audit details when approved */}
                {item.status === "approved" && (item.approvedAt || item.approvedBy) && (
                  <div className="mt-3 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                    {item.approvedAt && (
                      <span className="flex items-center gap-1">
                        <Calendar size={13} />
                        Approved: {new Date(item.approvedAt).toLocaleDateString()}
                      </span>
                    )}
                    {item.approvedBy && (
                      <span className="flex items-center gap-1">
                        <UserCheck size={13} />
                        Verified by Department
                      </span>
                    )}
                  </div>
                )}

                {/* Uploaded Documents List */}
                {hasDocs && (
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-900">
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                      Submitted Requirements:
                    </div>
                    <div className="space-y-2">
                      {item.documents.map((doc, docIdx) => (
                        <div
                          key={`doc-${docIdx}-${doc.url}`}
                          className="flex items-center justify-between gap-4 p-2.5 rounded-xl bg-slate-50/60 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 text-sm text-slate-800 dark:text-slate-200"
                        >
                          <div className="flex items-center gap-2 overflow-hidden">
                            <FileText size={15} className="text-slate-400 shrink-0" />
                            <span className="truncate text-xs font-medium">{doc.filename}</span>
                          </div>
                          <button
                            onClick={() => handleDownload(doc.filename, doc.url)}
                            className="inline-flex items-center gap-1.5 text-xs text-brand-primary dark:text-brand-secondary hover:underline font-semibold flex-shrink-0"
                            aria-label={`Download ${doc.filename}`}
                          >
                            <Download size={13} />
                            Download
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}
