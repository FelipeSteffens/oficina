import api, { unwrap } from './api.js';

export const orcamentoService = {
  async list(params = {}) {
    return unwrap(await api.get('/orcamentos', { params }));
  },
  async get(id) {
    return unwrap(await api.get(`/orcamentos/${id}`));
  },
  async create(payload) {
    return unwrap(await api.post('/orcamentos', payload));
  },
  async aprovar(id) {
    return unwrap(await api.post(`/orcamentos/${id}/aprovar`));
  },
  async recusar(id) {
    return unwrap(await api.post(`/orcamentos/${id}/recusar`));
  },
  async converter(id, payload = {}) {
    return unwrap(await api.post(`/orcamentos/${id}/converter`, payload));
  },
};

export default orcamentoService;
