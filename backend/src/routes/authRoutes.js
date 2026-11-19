import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { protect } from '../middlewares/authMiddleware.js';
import { validateBody } from '../middlewares/validateMiddleware.js';
import * as authController from '../controllers/authController.js';

const router = Router();

router.post('/login',
  validateBody({ email: { required: true, type: 'email' }, senha: { required: true, type: 'string', min: 4 } }),
  asyncHandler(authController.login));

router.post('/cadastro/cliente',
  validateBody({
    nome: { required: true, type: 'string', min: 2 },
    email: { required: true, type: 'email' },
    senha: { required: true, type: 'string', min: 6 },
    telefone: { required: true, type: 'string', min: 8 },
    cpf: { type: 'string' },
    endereco: { type: 'string' },
  }),
  asyncHandler(authController.registerCliente));

router.post('/cadastro/oficina',
  validateBody({
    nomeOficina: { required: true, type: 'string', min: 2 },
    cnpj: { required: true, type: 'string', min: 14 },
    emailResponsavel: { required: true, type: 'email' },
    senha: { required: true, type: 'string', min: 6 },
    responsavelNome: { type: 'string' },
    endereco: { type: 'string' },
    telefoneOficina: { type: 'string' },
    emailOficina: { type: 'email' },
  }),
  asyncHandler(authController.registerOficina));

router.get('/me', protect, asyncHandler(authController.me));

export default router;
