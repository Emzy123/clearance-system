import { useQuery } from "@tanstack/react-query";
import Card from "../../components/common/Card";
import Loader from "../../components/common/Loader";
import { getRequests } from "../../services/staffService";
import { useAuth } from "../../hooks/useAuth";

export default function ApprovedRequests() {
  const { token } = useAuth();
  const q = useQuery({
    queryKey: ["staff-requests"],
    queryFn: () => getRequests(token),
    enabled: Boolean(token)
  });

  const items = (q.data?.items || []).filter((c) => c.status === "approved" || c.status === "rejected");

  return (
    <div className="p-6 space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Processed requests</h2>
        <p className="text-sm text-slate-600 dark:text-slate-300">Your department history.</p>
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
                  <th>Updated</th>
                </tr>
              </thead>
              <tbody>
                {items.map((c) => (
                  <tr key={c._id} className="border-t border-slate-200/60 dark:border-slate-800">
                    <td className="py-3 font-medium">{c.matricNumber}</td>
                    <td>{c.status}</td>
                    <td>{c.updatedAt ? new Date(c.updatedAt).toLocaleString() : ""}</td>
                  </tr>
                ))}
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-slate-600 dark:text-slate-300">
                      No processed requests
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

