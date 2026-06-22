class AppError extends Error {
  constructor(message, statusCode = 400, code = 'BAD_REQUEST') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

class ConflictoTurnoError extends AppError {
  constructor(message = 'El horario solicitado ya no está disponible') {
    super(message, 409, 'TURNO_CONFLICT');
  }
}

class TurnoNoEncontradoError extends AppError {
  constructor(message = 'El turno solicitado no existe') {
    super(message, 404, 'TURNO_NOT_FOUND');
  }
}

class CancelacionFueraDePlazoError extends AppError {
  constructor(message = 'No se puede cancelar con menos de 2 horas de anticipación') {
    super(message, 422, 'CANCELACION_FUERA_DE_PLAZO');
  }
}

class ValidacionError extends AppError {
  constructor(message) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

module.exports = {
  AppError,
  ConflictoTurnoError,
  TurnoNoEncontradoError,
  CancelacionFueraDePlazoError,
  ValidacionError,
};
