import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { protect } from '../middlewares/authMiddleware.js';
import { requireEquipeOficina, requireGestorOficina } from '../middlewares/roleMiddleware.js';
import * as funcionarioController from '../controllers/funcionarioController.js';

const router = Router();
router.use(protect, requireEquipeOficina);

router.get('/', asyncHandler(funcionarioController.list));
router.get('/:id', asyncHandler(funcionarioController.get));
router.post('/', requireGestorOficina, asyncHandler(funcionarioController.create));
router.put('/:id', requireGestorOficina, asyncHandler(funcionarioController.update));
router.delete('/:id', requireGestorOficina, asyncHandler(funcionarioController.remove));

export default router;
