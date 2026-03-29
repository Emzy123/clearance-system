import { createApi } from "./api";

export async function login({ email, password }) {
  const api = createApi();
  const res = await api.post("/auth/login", { email, password });
  return res.data.data;
}

export async function register(payload) {
  const api = createApi();
  const res = await api.post("/auth/register", payload);
  return res.data.data;
}

export async function forgotPassword(email) {
  const api = createApi();
  const res = await api.post("/auth/forgot-password", { email });
  return res.data.data;
}

export async function resetPassword(token, password) {
  const api = createApi();
  const res = await api.post(`/auth/reset-password/${token}`, { password });
  return res.data.data;
}

export async function verifyToken(token) {
  const api = createApi(token);
  const res = await api.get("/auth/verify-token");
  return res.data.data;
}

