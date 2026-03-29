import { createApi } from "./api";

export async function getUsers(token, params) {
  const api = createApi(token);
  const res = await api.get("/admin/users", { params });
  return res.data.data;
}

export async function createUser(token, payload) {
  const api = createApi(token);
  const res = await api.post("/admin/users", payload);
  return res.data.data;
}

export async function updateUser(token, id, payload) {
  const api = createApi(token);
  const res = await api.put(`/admin/users/${id}`, payload);
  return res.data.data;
}

export async function deleteUser(token, id) {
  const api = createApi(token);
  const res = await api.delete(`/admin/users/${id}`);
  return res.data.data;
}

export async function getDepartments(token) {
  const api = createApi(token);
  const res = await api.get("/admin/departments");
  return res.data.data;
}

export async function createDepartment(token, payload) {
  const api = createApi(token);
  const res = await api.post("/admin/departments", payload);
  return res.data.data;
}

export async function updateDepartment(token, id, payload) {
  const api = createApi(token);
  const res = await api.put(`/admin/departments/${id}`, payload);
  return res.data.data;
}

export async function deleteDepartment(token, id) {
  const api = createApi(token);
  const res = await api.delete(`/admin/departments/${id}`);
  return res.data.data;
}

export async function reorderDepartments(token, departmentIds) {
  const api = createApi(token);
  const res = await api.post("/admin/departments/reorder", { departmentIds });
  return res.data.data;
}

export async function moveDepartmentPhase(token, departmentId, phaseType, order) {
  const api = createApi(token);
  const res = await api.post("/admin/departments/phase/move", { departmentId, phaseType, order });
  return res.data.data;
}

export async function getAllClearances(token, params) {
  const api = createApi(token);
  const res = await api.get("/admin/clearance/all", { params });
  return res.data.data;
}

export async function overrideClearance(token, id, payload) {
  const api = createApi(token);
  const res = await api.put(`/admin/clearance/${id}/override`, payload);
  return res.data.data;
}

export async function getAuditLogs(token, params) {
  const api = createApi(token);
  const res = await api.get("/admin/audit-logs", { params });
  return res.data.data;
}

export async function getAnalytics(token) {
  const api = createApi(token);
  const res = await api.get("/admin/analytics");
  return res.data.data;
}

export async function updateSettings(token, payload) {
  const api = createApi(token);
  const res = await api.put("/admin/settings", payload);
  return res.data.data;
}

export async function getSettings(token, keys = []) {
  const api = createApi(token);
  const params = keys.length ? { keys: keys.join(",") } : undefined;
  const res = await api.get("/admin/settings", { params });
  return res.data.data;
}

export async function exportClearedStudents(token) {
  const api = createApi(token);
  const res = await api.get("/admin/reports/cleared-students", { responseType: "blob" });
  return res.data;
}

export async function exportSequentialProgress(token) {
  const api = createApi(token);
  const res = await api.get("/admin/reports/sequential-progress", { responseType: "blob" });
  return res.data;
}

export async function exportParallelProgress(token) {
  const api = createApi(token);
  const res = await api.get("/admin/reports/parallel-progress", { responseType: "blob" });
  return res.data;
}

