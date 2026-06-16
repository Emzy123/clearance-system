import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
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
  const [department, setDepartment] = useState("");
  const [faculty, setFaculty] = useState("");
  const [matricNumber, setMatricNumber] = useState("");
  const [yearOfAdmission, setYearOfAdmission] = useState("");
  const [yearOfGraduation, setYearOfGraduation] = useState("");
  const [classOfDegree, setClassOfDegree] = useState("");

  const q = useQuery({
    queryKey: ["student-profile"],
    queryFn: () => getProfile(token),
    enabled: Boolean(token)
  });

  useEffect(() => {
    if (q.data) {
      setName(q.data.user?.name || "");
      setProfilePicture(q.data.user?.profilePicture || "");
      setDepartment(q.data.user?.department || "");
      setFaculty(q.data.user?.faculty || "");
      setMatricNumber(q.data.user?.matricNumber || "");
      setYearOfAdmission(q.data.user?.yearOfAdmission || "");
      setYearOfGraduation(q.data.user?.yearOfGraduation || "");
      setClassOfDegree(q.data.user?.classOfDegree || "");
    }
  }, [q.data]);

  const m = useMutation({
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
      toast.push({ type: "success", message: "Profile updated successfully" });
      q.refetch();
    },
    onError: (err) =>
      toast.push({ type: "error", message: err?.response?.data?.error?.message || "Failed to save profile" })
  });

  if (q.isLoading) return <div className="p-6"><Loader /></div>;

  const user = q.data?.user;

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white">Profile Details</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your student profile credentials and academic records.
        </p>
      </div>
      <Card className="p-6">
        <div className="grid md:grid-cols-2 gap-6">
          <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Matric Number" value={matricNumber} onChange={(e) => setMatricNumber(e.target.value)} />
          <Input label="Faculty" value={faculty} onChange={(e) => setFaculty(e.target.value)} />
          <Input label="Department" value={department} onChange={(e) => setDepartment(e.target.value)} />
          <Input label="Year of Admission" value={yearOfAdmission} onChange={(e) => setYearOfAdmission(e.target.value)} placeholder="e.g. 2022" />
          <Input label="Year of Graduation" value={yearOfGraduation} onChange={(e) => setYearOfGraduation(e.target.value)} placeholder="e.g. 2026" />
          <Input label="Class of Degree" value={classOfDegree} onChange={(e) => setClassOfDegree(e.target.value)} placeholder="e.g. First Class Honours" />
          <Input
            label="Profile picture URL"
            value={profilePicture}
            onChange={(e) => setProfilePicture(e.target.value)}
            placeholder="https://..."
          />
        </div>
        
        <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
            <div><span className="font-semibold text-slate-700 dark:text-slate-300">Email:</span> {user?.email}</div>
            <div><span className="font-semibold text-slate-700 dark:text-slate-300">Role:</span> {user?.role}</div>
          </div>
          <Button onClick={() => m.mutate()} disabled={m.isPending} className="px-6">
            {m.isPending ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </Card>
    </div>
  );
}

