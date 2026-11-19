import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { protect } from '../middlewares/authMiddleware.js';
import { requireEquipeOficina } from '../middlewares/roleMiddleware.js';
import * as estoqueController from '../controllers/estoqueController.js';

const router = Router();
router.use(protect, requireEquipeOficina);

router.get('/movimentacoes', asyncHandler(estoqueController.movimentacoes));
router.get('/', asyncHandler(estoqueController.list));
router.get('/:id', asyncHandler(estoqueController.get));
router.post('/', asyncHandler(estoqueController.create));
router.put('/:id', asyncHandler(estoqueController.update));
router.delete('/:id', asyncHandler(estoqueController.remove));
router.post('/:id/entrada', asyncHandler(estoqueController.entrada));

export default router;
