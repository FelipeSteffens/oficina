import api, { unwrap } from './api.js';

export const oficinaService = {
  async list() {
    return unwrap(await api.get('/oficinas'));
  },
  async get(id) {
    return unwrap(await api.get(`/oficinas/${id}`));
  },
  async create(payload) {
    return unwrap(await api.post('/oficinas', payload));
  },
  async update(id, payload) {
    return unwrap(await api.patch(`/oficinas/${id}`, payload));
  },
  async setActive(id, ativa) {
    return unwrap(await api.patch(`/oficinas/${id}/status`, { ativa }));
  },
};

export default oficinaService;
