const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const getToken = () => {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem('crm_token');
};

export const setToken = (token) => {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem('crm_token', token);
};

export const clearToken = () => {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem('crm_token');
};

export const getUser = () => {
  if (typeof localStorage === 'undefined') return null;
  const raw = localStorage.getItem('crm_user');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const setUser = (user) => {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem('crm_user', JSON.stringify(user));
};

export const clearUser = () => {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem('crm_user');
};

const parseJson = async (response) => {
  const text = await response.text();
  if (!text) return null;
  return JSON.parse(text);
};

export const apiFetch = async (path, options = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    const payload = await parseJson(response);
    const message = payload?.error || response.statusText;
    throw new Error(message);
  }

  return parseJson(response);
};
