import { createApi } from "./api";

export async function getProfile(token) {
  const api = createApi(token);
  const res = await api.get("/students/profile");
  return res.data.data;
}

export async function updateProfile(token, payload) {
  const api = createApi(token);
  const res = await api.put("/students/profile", payload);
  return res.data.data;
}

export async function initiateClearance(token) {
  const api = createApi(token);
  const res = await api.post("/students/clearance/initiate", {});
  return res.data.data;
}

export async function getClearanceStatus(token) {
  const api = createApi(token);
  const res = await api.get("/students/clearance/status");
  return res.data.data;
}

export async function submitSequential(token, departmentId, file) {
  const api = createApi(token);
  const form = new FormData();
  form.append("file", file);
  const res = await api.post(`/students/clearance/sequential/submit/${departmentId}`, form);
  return res.data.data;
}

export async function submitParallelBulk(token, departmentIds, files) {
  const api = createApi(token);
  const form = new FormData();
  form.append("departmentIds", departmentIds.join(","));
  files.forEach((file) => form.append("files", file));
  const res = await api.post("/students/clearance/parallel/submit", form);
  return res.data.data;
}

export async function submitParallelSingle(token, departmentId, file) {
  const api = createApi(token);
  const form = new FormData();
  form.append("file", file);
  const res = await api.post(`/students/clearance/parallel/submit/single/${departmentId}`, form);
  return res.data.data;
}

export async function getEligibleParallelDepartments(token) {
  const api = createApi(token);
  const res = await api.get("/students/clearance/parallel/eligible-departments");
  return res.data.data;
}

export async function downloadCertificateUrl(token) {
  const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  // Let the browser download; backend expects Bearer token, so we fetch as blob.
  const api = createApi(token);
  const res = await api.get("/students/clearance/certificate", { responseType: "blob" });
  return res.data;
}

export async function getNotifications(token) {
  const api = createApi(token);
  const res = await api.get("/students/notifications");
  return res.data.data;
}

export async function markNotificationRead(token, id) {
  const api = createApi(token);
  const res = await api.put(`/students/notifications/${id}/read`, {});
  return res.data.data;
}

