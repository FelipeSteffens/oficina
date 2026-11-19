import api, { unwrap } from './api.js';

export const contatoService = {
  async send(payload) {
    return unwrap(await api.post('/contatos', payload));
  },
  async listAll() {
    return unwrap(await api.get('/contatos'));
  },
};

export default contatoService;
