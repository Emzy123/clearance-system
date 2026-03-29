import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import Loader from "../../components/common/Loader";
import { getProfile, updateProfile } from "../../services/studentService";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../components/common/Toast";

export default function Profile() {
  const { token } = useAuth();
  const toast = useToast();
  const [name, setName] = useState("");
  const [profilePicture, setProfilePicture] = useState("");

  const q = useQuery({
    queryKey: ["student-profile"],
    queryFn: () => getProfile(token),
    enabled: Boolean(token),
    onSuccess: (data) => {
      setName(data.user?.name || "");
      setProfilePicture(data.user?.profilePicture || "");
    }
  });

  const m = useMutation({
    mutationFn: () => updateProfile(token, { name, profilePicture }),
    onSuccess: () => {
      toast.push({ type: "success", message: "Profile updated" });
      q.refetch();
    },
    onError: (err) =>
      toast.push({ type: "error", message: err?.response?.data?.error?.message || "Failed" })
  });

  if (q.isLoading) return <div className="p-6"><Loader /></div>;

  const user = q.data?.user;

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-semibold">Profile</h2>
      <Card>
        <div className="grid md:grid-cols-2 gap-4">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input
            label="Profile picture URL"
            value={profilePicture}
            onChange={(e) => setProfilePicture(e.target.value)}
            placeholder="https://..."
          />
          <div className="text-sm text-slate-600 dark:text-slate-300">
            <div><span className="font-medium">Email:</span> {user?.email}</div>
            <div><span className="font-medium">Role:</span> {user?.role}</div>
            <div><span className="font-medium">Matric:</span> {user?.matricNumber || "-"}</div>
          </div>
        </div>
        <div className="mt-4">
          <Button onClick={() => m.mutate()} disabled={m.isPending}>
            {m.isPending ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </Card>
    </div>
  );
}

