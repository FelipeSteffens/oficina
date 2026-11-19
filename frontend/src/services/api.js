import axios from 'axios';

export const TOKEN_KEY = 'autotrack_token';
export const USER_KEY = 'autotrack_user';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 20000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 401 && !String(error.config?.url || '').includes('/auth/login')) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      if (window.location.pathname.startsWith('/app')) window.location.assign('/login');
    }
    return Promise.reject(error);
  },
);

export function getErrorMessage(error, fallback = 'Não foi possível concluir a operação.') {
  const data = error?.response?.data;
  if (Array.isArray(data?.details) && data.details.length) return data.details.join(' ');
  return data?.message || error?.message || fallback;
}

/** Extrai o payload `data` do envelope padrão da API. */
export function unwrap(response) {
  return response?.data?.data ?? null;
}

export default api;
