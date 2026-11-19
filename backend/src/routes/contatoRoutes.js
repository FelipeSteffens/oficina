import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { protect } from '../middlewares/authMiddleware.js';
import { requireAdminGeral } from '../middlewares/roleMiddleware.js';
import * as contatoController from '../controllers/contatoController.js';

const router = Router();

router.post('/', asyncHandler(contatoController.create));
router.get('/', protect, requireAdminGeral, asyncHandler(contatoController.listAll));

export default router;
