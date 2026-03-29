import { createApi } from "./api";

export async function getPending(token) {
  const api = createApi(token);
  const res = await api.get("/staff/pending");
  return res.data.data;
}

export async function getRequests(token) {
  const api = createApi(token);
  const res = await api.get("/staff/requests");
  return res.data.data;
}

export async function getRequestDetails(token, clearanceId) {
  const api = createApi(token);
  const res = await api.get(`/staff/requests/${clearanceId}`);
  return res.data.data;
}

export async function approveSequential(token, clearanceId, remarks) {
  const api = createApi(token);
  const res = await api.put(`/staff/sequential/approve/${clearanceId}`, { remarks });
  return res.data.data;
}

export async function rejectSequential(token, clearanceId, remarks) {
  const api = createApi(token);
  const res = await api.put(`/staff/sequential/reject/${clearanceId}`, { remarks });
  return res.data.data;
}

export async function approveParallel(token, clearanceId, remarks) {
  const api = createApi(token);
  const res = await api.put(`/staff/parallel/approve/${clearanceId}`, { remarks });
  return res.data.data;
}

export async function rejectParallel(token, clearanceId, remarks) {
  const api = createApi(token);
  const res = await api.put(`/staff/parallel/reject/${clearanceId}`, { remarks });
  return res.data.data;
}

export async function statistics(token) {
  const api = createApi(token);
  const res = await api.get("/staff/statistics");
  return res.data.data;
}

