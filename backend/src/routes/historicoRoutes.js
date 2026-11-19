import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { protect } from '../middlewares/authMiddleware.js';
import { requireCliente } from '../middlewares/roleMiddleware.js';
import * as historicoController from '../controllers/historicoController.js';

const router = Router();
router.use(protect);

router.get('/me', requireCliente, asyncHandler(historicoController.listForCliente));
router.get('/veiculo/:veiculoId', asyncHandler(historicoController.listByVeiculo));

export default router;
