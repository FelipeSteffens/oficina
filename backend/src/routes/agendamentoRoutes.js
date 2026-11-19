import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { protect } from '../middlewares/authMiddleware.js';
import * as agendamentoController from '../controllers/agendamentoController.js';

const router = Router();
router.use(protect);

router.get('/', asyncHandler(agendamentoController.list));
router.get('/:id', asyncHandler(agendamentoController.get));
router.post('/', asyncHandler(agendamentoController.create));
router.put('/:id', asyncHandler(agendamentoController.update));
router.delete('/:id', asyncHandler(agendamentoController.remove));

export default router;
