const {
  ConflictoTurnoError,
  TurnoNoEncontradoError,
  CancelacionFueraDePlazoError,
  ValidacionError,
} = require('../models/errors');

// Regla de negocio: plazo mínimo para cancelar sin penalización
const HORAS_MINIMAS_CANCELACION = 2;

class TurnoService {
  constructor({ turnoRepo, listaEsperaRepo, notificacionService }) {
    this.turnoRepo = turnoRepo;
    this.listaEsperaRepo = listaEsperaRepo;
    this.notificacionService = notificacionService;
  }

  // Validaciones de entrada
  _validarDatosReserva({ pacienteId, profesionalId, fechaHora }) {
    if (!pacienteId || !profesionalId || !fechaHora) {
      throw new ValidacionError('pacienteId, profesionalId y fechaHora son obligatorios');
    }
    const fecha = new Date(fechaHora);
    if (Number.isNaN(fecha.getTime())) {
      throw new ValidacionError('fechaHora inválida, se espera formato ISO 8601');
    }
    if (fecha.getTime() < Date.now()) {
      throw new ValidacionError('No se puede reservar un turno en una fecha pasada');
    }
  }

  // Operacion 1: reservar turno
  reservarTurno({ pacienteId, profesionalId, fechaHora }) {
    this._validarDatosReserva({ pacienteId, profesionalId, fechaHora });

    const ocupado = this.turnoRepo.existeTurnoReservado(profesionalId, fechaHora);
    if (ocupado) {
      throw new ConflictoTurnoError();
    }

    const turno = this.turnoRepo.crear({ pacienteId, profesionalId, fechaHora });
    this.notificacionService?.notificarConfirmacion(turno);
    return turno;
  }

  // Operacion 2: cancelar turno (incluye regla no trivial de plazo minimo)
  cancelarTurno(turnoId) {
    const turno = this.turnoRepo.obtenerPorId(turnoId);
    if (!turno) {
      throw new TurnoNoEncontradoError();
    }
    if (turno.estado === 'cancelado') {
      throw new TurnoNoEncontradoError('El turno ya se encuentra cancelado');
    }

    // Regla de negocio no trivial: no se puede cancelar con menos de 2hs de anticipación
    const horasRestantes = (new Date(turno.fecha_hora).getTime() - Date.now()) / (1000 * 60 * 60);
    if (horasRestantes < HORAS_MINIMAS_CANCELACION) {
      throw new CancelacionFueraDePlazoError();
    }

    const turnoCancelado = this.turnoRepo.cancelar(turnoId);

    // Reasignación automática a lista de espera (flujo alternativo del diagrama de secuencia)
    const siguienteEnEspera = this.listaEsperaRepo.primeroEnEspera(
      turno.profesional_id,
      turno.fecha_hora
    );

    if (siguienteEnEspera) {
      const turnoReasignado = this.turnoRepo.reasignar(turnoId, siguienteEnEspera.paciente_id);
      this.listaEsperaRepo.eliminar(siguienteEnEspera.id);
      this.notificacionService?.notificarTurnoDisponible(turnoReasignado);
      return { turno: turnoReasignado, reasignado: true };
    }

    return { turno: turnoCancelado, reasignado: false };
  }

  // Operacion 3: consultar disponibilidad
  consultarDisponibilidad(profesionalId, fecha) {
    if (!profesionalId || !fecha) {
      throw new ValidacionError('profesionalId y fecha son obligatorios');
    }
    const desde = `${fecha}T00:00:00`;
    const hasta = `${fecha}T23:59:59`;
    const turnosDelDia = this.turnoRepo.listarPorProfesional(profesionalId, { desde, hasta });
    const ocupados = new Set(
      turnosDelDia.filter(t => t.estado === 'reservado').map(t => t.fecha_hora)
    );
    return { profesionalId, fecha, horariosOcupados: Array.from(ocupados) };
  }

  // Operacion 4: listar turnos de un paciente
  listarTurnosPaciente(pacienteId) {
    if (!pacienteId) {
      throw new ValidacionError('pacienteId es obligatorio');
    }
    return this.turnoRepo.listarPorPaciente(pacienteId);
  }

  // Operacion 5: anotarse en lista de espera
  anotarseEnEspera({ pacienteId, profesionalId, fechaHora }) {
    this._validarDatosReserva({ pacienteId, profesionalId, fechaHora });
    const ocupado = this.turnoRepo.existeTurnoReservado(profesionalId, fechaHora);
    if (!ocupado) {
      throw new ValidacionError('El horario está disponible, no es necesario anotarse en espera');
    }
    return this.listaEsperaRepo.agregar({ pacienteId, profesionalId, fechaHora });
  }
}

module.exports = { TurnoService, HORAS_MINIMAS_CANCELACION };
