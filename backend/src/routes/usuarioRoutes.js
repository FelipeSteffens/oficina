import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { protect } from '../middlewares/authMiddleware.js';
import { requireAdminGeral } from '../middlewares/roleMiddleware.js';
import * as usuarioController from '../controllers/usuarioController.js';

const router = Router();
router.use(protect, requireAdminGeral);

router.get('/', asyncHandler(usuarioController.list));
router.get('/:id', asyncHandler(usuarioController.get));
router.patch('/:id', asyncHandler(usuarioController.update));
router.patch('/:id/status', asyncHandler(usuarioController.setActive));

export default router;
