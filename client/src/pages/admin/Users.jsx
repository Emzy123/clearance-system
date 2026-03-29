import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import Loader from "../../components/common/Loader";
import { useAuth } from "../../hooks/useAuth";
import { createUser, deleteUser, getDepartments, getUsers } from "../../services/adminService";
import { useToast } from "../../components/common/Toast";

function UserTable({ title, description, isLoading, emptyHint, children }) {
  return (
    <Card className="min-h-[12rem]">
      <div className="mb-3">
        <h3 className="text-lg font-semibold">{title}</h3>
        {description ? <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{description}</p> : null}
      </div>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="overflow-auto -mx-1">
          {children}
          {!isLoading && emptyHint}
        </div>
      )}
    </Card>
  );
}

export default function Users() {
  const { token, user: currentUser } = useAuth();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    staffId: "",
    department: "",
    password: ""
  });

  const staffQ = useQuery({
    queryKey: ["admin-users", "staff"],
    queryFn: () => getUsers(token, { page: 1, pageSize: 200, role: "staff" }),
    enabled: Boolean(token)
  });

  const studentQ = useQuery({
    queryKey: ["admin-users", "student"],
    queryFn: () => getUsers(token, { page: 1, pageSize: 200, role: "student" }),
    enabled: Boolean(token)
  });

  const adminQ = useQuery({
    queryKey: ["admin-users", "admin"],
    queryFn: () => getUsers(token, { page: 1, pageSize: 50, role: "admin" }),
    enabled: Boolean(token)
  });

  const deptQ = useQuery({
    queryKey: ["admin-departments-for-staff"],
    queryFn: () => getDepartments(token),
    enabled: Boolean(token)
  });

  const invalidateUsers = () => queryClient.invalidateQueries({ queryKey: ["admin-users"] });

  const createM = useMutation({
    mutationFn: () =>
      createUser(token, {
        name: form.name,
        email: form.email,
        staffId: form.staffId,
        department: form.department,
        password: form.password || undefined
      }),
    onSuccess: () => {
      toast.push({ type: "success", message: "Staff user created" });
      setOpen(false);
      setForm({ name: "", email: "", staffId: "", department: "", password: "" });
      invalidateUsers();
    },
    onError: (err) => toast.push({ type: "error", message: err?.response?.data?.error?.message || "Failed" })
  });

  const deleteM = useMutation({
    mutationFn: (id) => deleteUser(token, id),
    onSuccess: () => {
      toast.push({ type: "success", message: "User deleted" });
      invalidateUsers();
    }
  });

  const staffItems = staffQ.data?.items || [];
  const studentItems = studentQ.data?.items || [];
  const adminItems = adminQ.data?.items || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-semibold">Users</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Staff and students are listed separately. Admins can add staff only and assign a department.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>Add staff</Button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 items-start">
        <UserTable
          title="Staff"
          description="Department-scoped accounts. Each staff member only sees clearances for their department."
          isLoading={staffQ.isLoading}
          emptyHint={
            staffItems.length === 0 ? (
              <p className="py-4 text-center text-sm text-slate-600 dark:text-slate-400">No staff users yet.</p>
            ) : null
          }
        >
          {staffItems.length > 0 ? (
            <table className="w-full text-sm">
              <thead className="text-left text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="py-2 pr-2">Name</th>
                  <th className="pr-2">Email</th>
                  <th className="pr-2">Staff ID</th>
                  <th className="pr-2">Department</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {staffItems.map((u) => (
                  <tr key={u._id} className="border-t border-slate-200/60 dark:border-slate-800">
                    <td className="py-3 font-medium pr-2">{u.name}</td>
                    <td className="pr-2 break-all">{u.email}</td>
                    <td className="pr-2">{u.staffId || "—"}</td>
                    <td className="text-slate-600 dark:text-slate-300 pr-2">{u.department || "—"}</td>
                    <td className="text-right">
                      <Button variant="ghost" onClick={() => deleteM.mutate(u._id)} disabled={deleteM.isPending}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
        </UserTable>

        <UserTable
          title="Students"
          description="Self-registered student accounts."
          isLoading={studentQ.isLoading}
          emptyHint={
            studentItems.length === 0 ? (
              <p className="py-4 text-center text-sm text-slate-600 dark:text-slate-400">No students yet.</p>
            ) : null
          }
        >
          {studentItems.length > 0 ? (
            <table className="w-full text-sm">
              <thead className="text-left text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="py-2 pr-2">Name</th>
                  <th className="pr-2">Email</th>
                  <th className="pr-2">Matric</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {studentItems.map((u) => (
                  <tr key={u._id} className="border-t border-slate-200/60 dark:border-slate-800">
                    <td className="py-3 font-medium pr-2">{u.name}</td>
                    <td className="pr-2 break-all">{u.email}</td>
                    <td className="pr-2">{u.matricNumber || "—"}</td>
                    <td className="text-right">
                      <Button variant="ghost" onClick={() => deleteM.mutate(u._id)} disabled={deleteM.isPending}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : null}
        </UserTable>
      </div>

      {adminQ.isLoading || adminItems.length > 0 ? (
        <UserTable
          title="Administrators"
          description="System administrators (not shown in Staff or Students)."
          isLoading={adminQ.isLoading}
          emptyHint={
            !adminQ.isLoading && adminItems.length === 0 ? (
              <p className="py-4 text-center text-sm text-slate-600 dark:text-slate-400">No administrators.</p>
            ) : null
          }
        >
          <table className="w-full text-sm">
            <thead className="text-left text-slate-600 dark:text-slate-300">
              <tr>
                <th className="py-2 pr-2">Name</th>
                <th className="pr-2">Email</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {adminItems.map((u) => (
                <tr key={u._id} className="border-t border-slate-200/60 dark:border-slate-800">
                  <td className="py-3 font-medium pr-2">{u.name}</td>
                  <td className="pr-2 break-all">{u.email}</td>
                  <td className="text-right">
                    <Button
                      variant="ghost"
                      onClick={() => deleteM.mutate(u._id)}
                      disabled={deleteM.isPending || String(u._id) === String(currentUser?._id || currentUser?.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </UserTable>
      ) : null}

      <Modal open={open} title="Add staff user" onClose={() => setOpen(false)}>
        <div className="grid grid-cols-1 gap-3">
          <Input label="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            required
          />
          <Input
            label="Staff ID"
            value={form.staffId}
            onChange={(e) => setForm((f) => ({ ...f, staffId: e.target.value }))}
            placeholder="e.g. STF-1001"
            required
          />
          <div>
            <label className="text-sm font-medium">Department</label>
            <select
              className="mt-1 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/60 px-3 py-2 outline-none focus:ring-2 focus:ring-brand-secondary"
              value={form.department}
              onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
              required
            >
              <option value="">Select department</option>
              {(deptQ.data?.items || []).map((d) => (
                <option key={d._id} value={d.name}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
            {deptQ.isLoading ? (
              <p className="mt-1 text-xs text-slate-500">Loading departments…</p>
            ) : (deptQ.data?.items || []).length === 0 ? (
              <p className="mt-1 text-xs text-amber-700 dark:text-amber-200">
                No departments found. Create departments first.
              </p>
            ) : null}
          </div>
          <Input
            label="Initial password (optional)"
            type="password"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            placeholder="Leave blank to auto-generate"
          />
          <Button
            onClick={() => createM.mutate()}
            disabled={createM.isPending || !form.name || !form.email || !form.staffId || !form.department}
          >
            {createM.isPending ? "Creating..." : "Create staff"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
