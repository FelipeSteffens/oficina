import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { protect } from '../middlewares/authMiddleware.js';
import { requireAdminGeral, requireCliente, requireEquipeOficina } from '../middlewares/roleMiddleware.js';
import * as dashboardController from '../controllers/dashboardController.js';

const router = Router();
router.use(protect);

router.get('/oficina', requireEquipeOficina, asyncHandler(dashboardController.oficina));
router.get('/cliente', requireCliente, asyncHandler(dashboardController.cliente));
router.get('/global', requireAdminGeral, asyncHandler(dashboardController.global));

export default router;
