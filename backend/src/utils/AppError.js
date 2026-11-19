export class AppError extends Error {
  constructor(message, statusCode = 400, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace?.(this, AppError);
  }
}

export const badRequest = (msg, details) => new AppError(msg, 400, details);
export const unauthorized = (msg = 'Autenticação necessária.') => new AppError(msg, 401);
export const forbidden = (msg = 'Você não tem permissão para esta ação.') => new AppError(msg, 403);
export const notFound = (msg = 'Recurso não encontrado.') => new AppError(msg, 404);
export const conflict = (msg = 'Conflito com o estado atual do recurso.') => new AppError(msg, 409);
