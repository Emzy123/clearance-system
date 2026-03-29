import axios from "axios";

export function createApi(token) {
  const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const instance = axios.create({ baseURL });
  instance.interceptors.request.use((config) => {
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
  return instance;
}

