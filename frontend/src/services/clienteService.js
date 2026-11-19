import api, { unwrap } from './api.js';

export const clienteService = {
  async getPerfil() {
    return unwrap(await api.get('/clientes/perfil'));
  },
  async updatePerfil(payload) {
    return unwrap(await api.patch('/clientes/perfil', payload));
  },
  async listAll() {
    return unwrap(await api.get('/clientes'));
  },
};

export default clienteService;
