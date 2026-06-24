class TurnoController {
  constructor(turnoService) {
    this.turnoService = turnoService;
  }

  // POST /api/turnos
  reservar = (req, res, next) => {
    try {
      const { pacienteId, profesionalId, fechaHora } = req.body;
      const turno = this.turnoService.reservarTurno({ pacienteId, profesionalId, fechaHora });
      res.status(201).json(turno);
    } catch (err) {
      next(err);
    }
  };

  // DELETE /api/turnos/:id
  cancelar = (req, res, next) => {
    try {
      const { id } = req.params;
      const resultado = this.turnoService.cancelarTurno(id);
      res.status(200).json(resultado);
    } catch (err) {
      next(err);
    }
  };

  // GET /api/turnos/disponibilidad?profesionalId=&fecha=
  disponibilidad = (req, res, next) => {
    try {
      const { profesionalId, fecha } = req.query;
      const resultado = this.turnoService.consultarDisponibilidad(profesionalId, fecha);
      res.status(200).json(resultado);
    } catch (err) {
      next(err);
    }
  };

  // GET /api/turnos/paciente/:pacienteId
  listarPorPaciente = (req, res, next) => {
    try {
      const { pacienteId } = req.params;
      const turnos = this.turnoService.listarTurnosPaciente(pacienteId);
      res.status(200).json(turnos);
    } catch (err) {
      next(err);
    }
  };

  // POST /api/turnos/espera
  anotarseEnEspera = (req, res, next) => {
    try {
      const { pacienteId, profesionalId, fechaHora } = req.body;
      const registro = this.turnoService.anotarseEnEspera({ pacienteId, profesionalId, fechaHora });
      res.status(201).json(registro);
    } catch (err) {
      next(err);
    }
  };
}

module.exports = TurnoController;
