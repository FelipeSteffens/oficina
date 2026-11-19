import api, { unwrap } from './api.js';

export const dashboardService = {
  async cliente() {
    return unwrap(await api.get('/dashboard/cliente'));
  },
  async oficina() {
    return unwrap(await api.get('/dashboard/oficina'));
  },
  async global() {
    return unwrap(await api.get('/dashboard/global'));
  },
};

export default dashboardService;
