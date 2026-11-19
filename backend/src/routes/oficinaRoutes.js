import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { protect } from '../middlewares/authMiddleware.js';
import { requireAdminGeral, requireAdminOuEquipe } from '../middlewares/roleMiddleware.js';
import * as oficinaController from '../controllers/oficinaController.js';

const router = Router();
router.use(protect);

router.get('/', requireAdminOuEquipe, asyncHandler(oficinaController.list));
router.get('/:id', requireAdminOuEquipe, asyncHandler(oficinaController.get));
router.post('/', requireAdminGeral, asyncHandler(oficinaController.create));
router.patch('/:id', requireAdminGeral, asyncHandler(oficinaController.update));
router.patch('/:id/status', requireAdminGeral, asyncHandler(oficinaController.setActive));

export default router;
