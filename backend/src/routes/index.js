import { Router } from 'express';
import authRoutes from './authRoutes.js';
import usuarioRoutes from './usuarioRoutes.js';
import oficinaRoutes from './oficinaRoutes.js';
import funcionarioRoutes from './funcionarioRoutes.js';
import clienteRoutes from './clienteRoutes.js';
import veiculoRoutes from './veiculoRoutes.js';
import estoqueRoutes from './estoqueRoutes.js';
import agendamentoRoutes from './agendamentoRoutes.js';
import orcamentoRoutes from './orcamentoRoutes.js';
import osRoutes from './osRoutes.js';
import historicoRoutes from './historicoRoutes.js';
import contatoRoutes from './contatoRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';

const router = Router();

router.get('/health', (_req, res) => res.json({ success: true, service: 'AutoTrack Pro API', version: '1.0.0' }));

router.use('/auth', authRoutes);
router.use('/usuarios', usuarioRoutes);
router.use('/oficinas', oficinaRoutes);
router.use('/funcionarios', funcionarioRoutes);
router.use('/clientes', clienteRoutes);
router.use('/veiculos', veiculoRoutes);
router.use('/estoque', estoqueRoutes);
router.use('/agendamentos', agendamentoRoutes);
router.use('/orcamentos', orcamentoRoutes);
router.use('/os', osRoutes);
router.use('/historico', historicoRoutes);
router.use('/contatos', contatoRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
