import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import Loader from "../../components/common/Loader";
import { useAuth } from "../../hooks/useAuth";
import {
  createDepartment,
  deleteDepartment,
  getDepartments,
  moveDepartmentPhase,
  reorderDepartments
} from "../../services/adminService";
import { useToast } from "../../components/common/Toast";
import PhaseConfiguration from "../../components/admin/PhaseConfiguration";

export default function Departments() {
  const { token } = useAuth();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    code: "",
    clearanceOrder: 1,
    description: "",
    phaseType: "parallel"
  });

  const q = useQuery({
    queryKey: ["admin-departments"],
    queryFn: () => getDepartments(token),
    enabled: Boolean(token)
  });

  const createM = useMutation({
    mutationFn: () =>
      createDepartment(token, {
        ...form,
        phase: { type: form.phaseType, order: form.phaseType === "sequential" ? Number(form.clearanceOrder) : null },
        clearanceOrder: Number(form.clearanceOrder)
      }),
    onSuccess: () => {
      toast.push({ type: "success", message: "Department created" });
      setOpen(false);
      setForm({ name: "", code: "", clearanceOrder: 1, description: "", phaseType: "parallel" });
      q.refetch();
    },
    onError: (err) => toast.push({ type: "error", message: err?.response?.data?.error?.message || "Failed" })
  });

  const movePhaseM = useMutation({
    mutationFn: ({ departmentId, phaseType, order }) =>
      moveDepartmentPhase(token, departmentId, phaseType, order),
    onSuccess: () => q.refetch()
  });
  const reorderM = useMutation({
    mutationFn: (departmentIds) => reorderDepartments(token, departmentIds),
    onSuccess: () => q.refetch()
  });
  const [localSequential, setLocalSequential] = useState([]);
  const departments = q.data?.items || [];
  const sequential = localSequential.length
    ? localSequential
    : departments
        .filter((d) => d.phase?.type === "sequential")
        .sort((a, b) => (a.phase?.order || 999) - (b.phase?.order || 999));
  const parallel = departments.filter((d) => d.phase?.type !== "sequential");

  const deleteM = useMutation({
    mutationFn: (id) => deleteDepartment(token, id),
    onSuccess: () => {
      toast.push({ type: "success", message: "Department deleted" });
      q.refetch();
    }
  });

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Departments</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">Clearance order configuration.</p>
        </div>
        <Button onClick={() => setOpen(true)}>Add department</Button>
      </div>

      <Card>
        <PhaseConfiguration
          sequential={sequential}
          parallel={parallel}
          onMoveToPhase={(departmentId, phaseType) => {
            // If moving into sequential, default to appending at end unless user reorders.
            const order = phaseType === "sequential" ? sequential.length + 1 : undefined;
            movePhaseM.mutate({ departmentId, phaseType, order });
          }}
          onReorderUp={(idx) => {
            if (idx === 0) return;
            const copy = [...sequential];
            [copy[idx - 1], copy[idx]] = [copy[idx], copy[idx - 1]];
            setLocalSequential(copy);
          }}
          onReorderDown={(idx) => {
            if (idx >= sequential.length - 1) return;
            const copy = [...sequential];
            [copy[idx + 1], copy[idx]] = [copy[idx], copy[idx + 1]];
            setLocalSequential(copy);
          }}
          onSaveOrder={() => {
            reorderM.mutate(sequential.map((d) => d._id));
            setLocalSequential([]);
          }}
        />
      </Card>

      <Card>
        {q.isLoading ? (
          <Loader />
        ) : (
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="py-2">Order</th>
                  <th>Name</th>
                  <th>Code</th>
                  <th>Phase</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {(q.data?.items || []).map((d) => (
                  <tr key={d._id} className="border-t border-slate-200/60 dark:border-slate-800">
                    <td className="py-3 font-medium">{d.clearanceOrder}</td>
                    <td>{d.name}</td>
                    <td>{d.code}</td>
                    <td>{d.phase?.type || "parallel"}</td>
                    <td className="text-right">
                      <Button variant="ghost" onClick={() => deleteM.mutate(d._id)} disabled={deleteM.isPending}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
                {(q.data?.items || []).length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-600 dark:text-slate-300">
                      No departments
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal open={open} title="Add department" onClose={() => setOpen(false)}>
        <div className="grid grid-cols-1 gap-3">
          <Input label="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          <Input label="Code" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} />
          <Input
            label="Clearance order"
            value={form.clearanceOrder}
            onChange={(e) => setForm((f) => ({ ...f, clearanceOrder: e.target.value }))}
            type="number"
            min={1}
          />
          <Input
            label="Description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
          <label className="text-sm">
            Phase
            <select
              className="mt-1 w-full rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-2 bg-transparent"
              value={form.phaseType}
              onChange={(e) => setForm((f) => ({ ...f, phaseType: e.target.value }))}
            >
              <option value="parallel">Parallel</option>
              <option value="sequential">Sequential</option>
            </select>
          </label>
          <Button onClick={() => createM.mutate()} disabled={createM.isPending}>
            {createM.isPending ? "Saving..." : "Save"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}

