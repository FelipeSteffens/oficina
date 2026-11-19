import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { protect } from '../middlewares/authMiddleware.js';
import { requireAdminGeral, requireCliente } from '../middlewares/roleMiddleware.js';
import * as clienteController from '../controllers/clienteController.js';

const router = Router();
router.use(protect);

router.get('/perfil', requireCliente, asyncHandler(clienteController.perfil));
router.patch('/perfil', requireCliente, asyncHandler(clienteController.updatePerfil));
router.get('/', requireAdminGeral, asyncHandler(clienteController.listAll));

export default router;
