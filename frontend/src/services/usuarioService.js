import api, { unwrap } from './api.js';

export const usuarioService = {
  async list() {
    return unwrap(await api.get('/usuarios'));
  },
  async update(id, payload) {
    return unwrap(await api.patch(`/usuarios/${id}`, payload));
  },
  async setActive(id, ativo) {
    return unwrap(await api.patch(`/usuarios/${id}/status`, { ativo }));
  },
};

export default usuarioService;
