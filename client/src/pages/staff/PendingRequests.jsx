import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Loader from "../../components/common/Loader";
import Button from "../../components/common/Button";
import { getPending } from "../../services/staffService";
import { useAuth } from "../../hooks/useAuth";

export default function PendingRequests() {
  const { token } = useAuth();
  const nav = useNavigate();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("sequential");

  const q = useQuery({
    queryKey: ["staff-pending"],
    queryFn: () => getPending(token),
    enabled: Boolean(token)
  });

  const items = activeTab === "sequential" ? q.data?.sequentialPending || [] : q.data?.parallelPending || [];
  const filtered = useMemo(() => {
    if (!search) return items;
    const s = search.toLowerCase();
    return items.filter((c) => (c.matricNumber || "").toLowerCase().includes(s));
  }, [items, search]);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">Pending requests</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300">Requests awaiting action.</p>
          <div className="mt-3 flex items-center gap-2">
            <Button
              variant={activeTab === "sequential" ? "secondary" : "ghost"}
              onClick={() => setActiveTab("sequential")}
            >
              Sequential ({q.data?.sequentialPending?.length || 0})
            </Button>
            <Button
              variant={activeTab === "parallel" ? "secondary" : "ghost"}
              onClick={() => setActiveTab("parallel")}
            >
              Parallel ({q.data?.parallelPending?.length || 0})
            </Button>
          </div>
        </div>
        <div className="w-64">
          <Input label="Search (matric)" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <Card>
        {q.isLoading ? (
          <Loader />
        ) : (
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-slate-600 dark:text-slate-300">
                <tr>
                  <th className="py-2">Matric</th>
                  <th>Status</th>
                  <th>Stage</th>
                  <th className="text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c._id} className="border-t border-slate-200/60 dark:border-slate-800">
                    <td className="py-3 font-medium">{c.matricNumber}</td>
                    <td>{c.status}</td>
                    <td>{activeTab === "sequential" ? (c?.sequentialPhase?.currentStage ?? "-") : "-"}</td>
                    <td className="text-right">
                      <Button variant="ghost" onClick={() => nav(`/staff/request/${c._id}`)}>
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-600 dark:text-slate-300">
                      No pending requests
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

