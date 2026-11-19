import api, { unwrap } from './api.js';

export const authService = {
  async login(email, senha) {
    return unwrap(await api.post('/auth/login', { email, senha }));
  },
  async registerCliente(payload) {
    return unwrap(await api.post('/auth/cadastro/cliente', payload));
  },
  async registerOficina(payload) {
    return unwrap(await api.post('/auth/cadastro/oficina', payload));
  },
  async me() {
    return unwrap(await api.get('/auth/me'));
  },
};

export default authService;
