import api, { unwrap } from './api.js';

export const agendamentoService = {
  async list(params = {}) {
    return unwrap(await api.get('/agendamentos', { params }));
  },
  async get(id) {
    return unwrap(await api.get(`/agendamentos/${id}`));
  },
  async create(payload) {
    return unwrap(await api.post('/agendamentos', payload));
  },
  async update(id, payload) {
    return unwrap(await api.put(`/agendamentos/${id}`, payload));
  },
  async remove(id) {
    return unwrap(await api.delete(`/agendamentos/${id}`));
  },
};

export default agendamentoService;
