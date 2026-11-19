import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { protect } from '../middlewares/authMiddleware.js';
import { requireCliente, requireEquipeOficina } from '../middlewares/roleMiddleware.js';
import * as orcamentoController from '../controllers/orcamentoController.js';

const router = Router();
router.use(protect);

router.get('/', asyncHandler(orcamentoController.list));
router.get('/:id', asyncHandler(orcamentoController.get));
router.post('/', requireEquipeOficina, asyncHandler(orcamentoController.create));
router.post('/:id/aprovar', requireCliente, asyncHandler(orcamentoController.aprovar));
router.post('/:id/recusar', requireCliente, asyncHandler(orcamentoController.recusar));
router.post('/:id/converter', requireEquipeOficina, asyncHandler(orcamentoController.converter));

export default router;
