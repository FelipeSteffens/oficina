import { badRequest } from '../utils/AppError.js';

/**
 * Validação declarativa e leve de req.body.
 * rules: { campo: { required: true, type: 'string'|'number'|'integer'|'email'|'array', enum: [], min, max } }
 * O resultado validado fica em req.validated.
 */
export function validateBody(rules, { partial = false } = {}) {
  return (req, _res, next) => {
    const source = req.body || {};
    const errors = [];
    const clean = {};

    for (const [field, rule] of Object.entries(rules)) {
      const value = source[field];
      const missing = value === undefined || value === null || value === '';

      if (missing) {
        if (rule.required && !partial) errors.push(`${field} é obrigatório.`);
        continue;
      }

      if (rule.type === 'number' || rule.type === 'integer') {
        const num = Number(value);
        if (!Number.isFinite(num) || (rule.type === 'integer' && !Number.isInteger(num))) {
          errors.push(`${field} deve ser ${rule.type === 'integer' ? 'um número inteiro' : 'um número'}.`);
          continue;
        }
        if (rule.min !== undefined && num < rule.min) errors.push(`${field} deve ser >= ${rule.min}.`);
        if (rule.max !== undefined && num > rule.max) errors.push(`${field} deve ser <= ${rule.max}.`);
        clean[field] = num;
        continue;
      }

      if (rule.type === 'array') {
        if (!Array.isArray(value)) {
          errors.push(`${field} deve ser uma lista.`);
          continue;
        }
        if (rule.min !== undefined && value.length < rule.min) errors.push(`${field} deve ter ao menos ${rule.min} item(ns).`);
        clean[field] = value;
        continue;
      }

      const text = String(value).trim();
      if (rule.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(text)) {
        errors.push(`${field} deve ser um e-mail válido.`);
      }
      if (rule.type === 'date' && Number.isNaN(new Date(text).getTime())) {
        errors.push(`${field} deve ser uma data válida.`);
      }
      if (rule.min !== undefined && text.length < rule.min) errors.push(`${field} é muito curto.`);
      if (rule.max !== undefined && text.length > rule.max) errors.push(`${field} é muito longo.`);
      if (rule.enum && !rule.enum.includes(text)) errors.push(`${field} deve ser um de: ${rule.enum.join(', ')}.`);
      clean[field] = text;
    }

    if (errors.length) throw badRequest('Dados inválidos.', errors);
    req.validated = { ...source, ...clean };
    next();
  };
}
