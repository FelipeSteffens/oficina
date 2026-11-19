import api, { unwrap } from './api.js';

export const historicoService = {
  async byVeiculo(veiculoId) {
    return unwrap(await api.get(`/historico/veiculo/${veiculoId}`));
  },
  async mine() {
    return unwrap(await api.get('/historico/me'));
  },
};

export default historicoService;
