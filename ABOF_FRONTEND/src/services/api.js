const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
const API_ORIGIN = new URL(API_URL, window.location.origin).origin;
const TOKEN_KEY = "abof_admin_token";

async function request(path, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers = { "Content-Type": "application/json", ...options.headers };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (response.status === 204) return null;
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error("The server returned an invalid response.");
  }
  if (!response.ok) {
    if (response.status === 401) localStorage.removeItem(TOKEN_KEY);
    throw new Error(data.detail || "The request could not be completed.");
  }
  return data;
}

export const api = {
  listPublic: (kind) => request(`/public/content/${kind}`),
  getPublic: (kind, slug) => request(`/public/content/${kind}/${slug}`),
  submit: (payload) =>
    request("/public/submissions", { method: "POST", body: JSON.stringify(payload) }),
  login: async (email, password) => {
    const result = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem(TOKEN_KEY, result.access_token);
    return result.user;
  },
  me: () => request("/auth/me"),
  logout: () => localStorage.removeItem(TOKEN_KEY),
  overview: () => request("/admin/overview"),
  listAdmin: (kind) => request(`/admin/content/${kind}`),
  create: (kind, payload) =>
    request(`/admin/content/${kind}`, { method: "POST", body: JSON.stringify(payload) }),
  update: (kind, id, payload) =>
    request(`/admin/content/${kind}/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  remove: (kind, id) => request(`/admin/content/${kind}/${id}`, { method: "DELETE" }),
  submissions: () => request("/admin/submissions"),
  updateSubmission: (id, status) =>
    request(`/admin/submissions/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  users: () => request("/admin/users"),
  createUser: (payload) =>
    request("/admin/users", { method: "POST", body: JSON.stringify(payload) }),
  updateUser: (id, payload) =>
    request(`/admin/users/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  uploadMedia: async (file) => {
    const token = localStorage.getItem(TOKEN_KEY);
    const form = new FormData();
    form.append("file", file);
    const response = await fetch(`${API_URL}/admin/media`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || "The image could not be uploaded.");
    return { ...data, url: `${API_ORIGIN}${data.url}` };
  },
};
