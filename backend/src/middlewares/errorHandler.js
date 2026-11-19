import { config } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

function translateMysqlError(error) {
  switch (error.code) {
    case 'ER_DUP_ENTRY':
      return new AppError('Já existe um registro com este valor único (e-mail, placa, CNPJ ou código).', 409);
    case 'ER_NO_REFERENCED_ROW_2':
      return new AppError('Referência inválida: o registro relacionado não existe.', 400);
    case 'ER_ROW_IS_REFERENCED_2':
      return new AppError('Não é possível excluir: existem registros vinculados a este item.', 409);
    case 'ER_DATA_TOO_LONG':
      return new AppError('Um dos campos ultrapassa o tamanho permitido.', 400);
    case 'ER_TRUNCATED_WRONG_VALUE':
    case 'ER_INVALID_DATE':
      return new AppError('Data ou valor inválido informado.', 400);
    case 'PROTOCOL_CONNECTION_LOST':
    case 'ECONNREFUSED':
      return new AppError('Banco de dados indisponível. Tente novamente em instantes.', 503);
    default:
      return null;
  }
}

export function notFoundHandler(req, _res, next) {
  const error = new AppError(`Rota não encontrada: ${req.method} ${req.originalUrl}`, 404);
  next(error);
}

export function errorHandler(error, _req, res, _next) {
  let normalized = error;

  if (error instanceof AppError || error.isOperational) {
    normalized = error;
  } else {
    normalized = translateMysqlError(error) || new AppError(
      config.isProduction ? 'Erro interno do servidor.' : error.message || 'Erro interno do servidor.',
      error.statusCode || 500,
    );
  }

  if (!config.isProduction && normalized.statusCode >= 500) {
    console.error('[ERROR]', error);
  }

  return res.status(normalized.statusCode || 500).json({
    success: false,
    message: normalized.message || 'Erro inesperado.',
    ...(normalized.details ? { details: normalized.details } : {}),
    ...(!config.isProduction && normalized.statusCode >= 500 ? { stack: error.stack } : {}),
  });
}
