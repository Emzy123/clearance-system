import { useAuth } from "../../hooks/useAuth";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import {
  exportClearedStudents,
  exportSequentialProgress
} from "../../services/adminService";
import { downloadBlob } from "../../utils/helpers";
import { useToast } from "../../components/common/Toast";

export default function Reports() {
  const { token } = useAuth();
  const toast = useToast();

  async function onExport() {
    try {
      const blob = await exportClearedStudents(token);
      downloadBlob(blob, "cleared-students.xlsx");
    } catch (err) {
      toast.push({ type: "error", message: err?.response?.data?.error?.message || "Export failed" });
    }
  }
  async function onExportSequential() {
    try {
      const blob = await exportSequentialProgress(token);
      downloadBlob(blob, "sequential-progress.xlsx");
    } catch (err) {
      toast.push({ type: "error", message: err?.response?.data?.error?.message || "Export failed" });
    }
  }

  return (
    <div className="p-6 space-y-4">
      <div>
        <h2 className="text-xl font-semibold font-display text-slate-900 dark:text-white">Reports</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">Export operational reports.</p>
      </div>
      <Card>
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="font-medium text-slate-900 dark:text-white">Cleared students</div>
            <div className="text-sm text-slate-600 dark:text-slate-300">Download Excel report</div>
          </div>
          <Button onClick={onExport}>Export</Button>
        </div>
      </Card>
      <Card>
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="font-medium text-slate-900 dark:text-white">Sequential phase progress</div>
            <div className="text-sm text-slate-600 dark:text-slate-300">Download Excel report</div>
          </div>
          <Button onClick={onExportSequential}>Export</Button>
        </div>
      </Card>
    </div>
  );
}

