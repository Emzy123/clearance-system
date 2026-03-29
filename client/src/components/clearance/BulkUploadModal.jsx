import { useState } from "react";
import Modal from "../common/Modal";
import Button from "../common/Button";

export default function BulkUploadModal({ open, onClose, departments = [], onSubmit, pending = false }) {
  const [selected, setSelected] = useState([]);
  const [files, setFiles] = useState([]);

  return (
    <Modal open={open} title="Bulk Upload (Parallel Phase)" onClose={onClose}>
      <div className="space-y-3">
        <div className="text-sm">Select departments</div>
        <div className="grid sm:grid-cols-2 gap-2">
          {departments.map((d) => {
            const id = String(d.departmentId?._id || d.departmentId);
            const checked = selected.includes(id);
            return (
              <label key={id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() =>
                    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
                  }
                />
                {d.departmentName || d.departmentId?.name}
              </label>
            );
          })}
        </div>
        <input type="file" multiple onChange={(e) => setFiles(Array.from(e.target.files || []))} />
        <Button disabled={pending || !selected.length || !files.length} onClick={() => onSubmit?.(selected, files)}>
          {pending ? "Submitting..." : "Submit"}
        </Button>
      </div>
    </Modal>
  );
}
