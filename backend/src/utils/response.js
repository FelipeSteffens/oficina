/** Padroniza todas as respostas de sucesso da API. */
export function ok(res, data = null, message = null, status = 200) {
  return res.status(status).json({
    success: true,
    ...(message ? { message } : {}),
    ...(data !== null ? { data } : {}),
  });
}

export function created(res, data = null, message = 'Registro criado com sucesso.') {
  return ok(res, data, message, 201);
}

export function noContent(res) {
  return res.status(204).send();
}

export function paginated(res, rows, { page, limit, total }, message = null) {
  return res.status(200).json({
    success: true,
    ...(message ? { message } : {}),
    data: rows,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: Number(total),
      totalPages: Math.max(1, Math.ceil(Number(total) / Number(limit))),
    },
  });
}
