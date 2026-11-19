import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { protect } from '../middlewares/authMiddleware.js';
import { requireEquipeOficina } from '../middlewares/roleMiddleware.js';
import * as osController from '../controllers/osController.js';

const router = Router();
router.use(protect);

router.get('/', asyncHandler(osController.list));
router.get('/:id', asyncHandler(osController.get));
router.post('/', requireEquipeOficina, asyncHandler(osController.create));
router.put('/:id', requireEquipeOficina, asyncHandler(osController.update));
router.post('/:id/pecas', requireEquipeOficina, asyncHandler(osController.addPeca));
router.post('/:id/cancelar', requireEquipeOficina, asyncHandler(osController.cancel));
router.post('/:id/concluir', requireEquipeOficina, asyncHandler(osController.finalizar));

export default router;
