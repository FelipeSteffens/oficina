/**
 * Envolve handlers assíncronos do Express repassando erros ao middleware global.
 * Evita try/catch repetido em todos os controllers.
 */
export const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
