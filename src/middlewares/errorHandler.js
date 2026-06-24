const { AppError } = require('../models/errors');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.code, message: err.message });
  }
  console.error('Error inesperado:', err);
  return res.status(500).json({ error: 'INTERNAL_ERROR', message: 'Error interno del servidor' });
}

module.exports = errorHandler;
