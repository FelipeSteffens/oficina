import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { protect } from '../middlewares/authMiddleware.js';
import { requireCliente, requireEquipeOficina } from '../middlewares/roleMiddleware.js';
import * as veiculoController from '../controllers/veiculoController.js';

const router = Router();
router.use(protect);

// Rotas específicas ANTES de /:id para evitar captura de parâmetro.
router.get('/oficina', requireEquipeOficina, asyncHandler(veiculoController.listByOficina));
router.get('/oficinas-disponiveis', requireCliente, asyncHandler(veiculoController.listOficinasDisponiveis));

router.get('/', asyncHandler(veiculoController.list));
router.post('/', requireCliente, asyncHandler(veiculoController.create));

router.get('/:id', asyncHandler(veiculoController.get));
router.put('/:id', requireCliente, asyncHandler(veiculoController.update));
router.delete('/:id', requireCliente, asyncHandler(veiculoController.remove));
router.get('/:id/vinculos', requireCliente, asyncHandler(veiculoController.listVinculos));
router.put('/:id/vinculos/:oficinaId', requireCliente, asyncHandler(veiculoController.setVinculo));

export default router;
