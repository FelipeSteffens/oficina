import api, { unwrap } from './api.js';

export const osService = {
  async list(params = {}) {
    return unwrap(await api.get('/os', { params }));
  },
  async get(id) {
    return unwrap(await api.get(`/os/${id}`));
  },
  async create(payload) {
    return unwrap(await api.post('/os', payload));
  },
  async update(id, payload) {
    return unwrap(await api.put(`/os/${id}`, payload));
  },
  async addPeca(id, payload) {
    return unwrap(await api.post(`/os/${id}/pecas`, payload));
  },
  async cancel(id) {
    return unwrap(await api.post(`/os/${id}/cancelar`));
  },
  async finalizar(id, payload = {}) {
    return unwrap(await api.post(`/os/${id}/concluir`, payload));
  },
};

export default osService;
