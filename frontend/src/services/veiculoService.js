import api, { unwrap } from './api.js';

export const veiculoService = {
  async list() {
    return unwrap(await api.get('/veiculos'));
  },
  async get(id) {
    return unwrap(await api.get(`/veiculos/${id}`));
  },
  async create(payload) {
    return unwrap(await api.post('/veiculos', payload));
  },
  async update(id, payload) {
    return unwrap(await api.put(`/veiculos/${id}`, payload));
  },
  async remove(id) {
    return unwrap(await api.delete(`/veiculos/${id}`));
  },
  async listVinculos(id) {
    return unwrap(await api.get(`/veiculos/${id}/vinculos`));
  },
  async setVinculo(id, oficinaId, status) {
    return unwrap(await api.put(`/veiculos/${id}/vinculos/${oficinaId}`, { status }));
  },
  async listOficinasDisponiveis() {
    return unwrap(await api.get('/veiculos/oficinas-disponiveis'));
  },
  async listByOficina(search = '') {
    return unwrap(await api.get('/veiculos/oficina', { params: { search } }));
  },
};

export default veiculoService;
