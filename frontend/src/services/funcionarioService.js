import api, { unwrap } from './api.js';

export const funcionarioService = {
  async list() {
    return unwrap(await api.get('/funcionarios'));
  },
  async create(payload) {
    return unwrap(await api.post('/funcionarios', payload));
  },
  async update(id, payload) {
    return unwrap(await api.put(`/funcionarios/${id}`, payload));
  },
  async remove(id) {
    return unwrap(await api.delete(`/funcionarios/${id}`));
  },
};

export default funcionarioService;
