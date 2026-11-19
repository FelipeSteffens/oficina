import api, { unwrap } from './api.js';

export const estoqueService = {
  async list(params = {}) {
    return unwrap(await api.get('/estoque', { params }));
  },
  async get(id) {
    return unwrap(await api.get(`/estoque/${id}`));
  },
  async create(payload) {
    return unwrap(await api.post('/estoque', payload));
  },
  async update(id, payload) {
    return unwrap(await api.put(`/estoque/${id}`, payload));
  },
  async remove(id) {
    return unwrap(await api.delete(`/estoque/${id}`));
  },
  async entrada(id, payload) {
    return unwrap(await api.post(`/estoque/${id}/entrada`, payload));
  },
  async movimentacoes(limit = 100) {
    return unwrap(await api.get('/estoque/movimentacoes', { params: { limit } }));
  },
};

export default estoqueService;
