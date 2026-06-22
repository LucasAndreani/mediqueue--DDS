const { v4: uuidv4 } = require('uuid');

class TurnoRepository {
  constructor(db) {
    this.db = db;
  }

  existeTurnoReservado(profesionalId, fechaHora) {
    const row = this.db
      .prepare(`SELECT id FROM turnos WHERE profesional_id = ? AND fecha_hora = ? AND estado = 'reservado'`)
      .get(profesionalId, fechaHora);
    return !!row;
  }

  crear({ pacienteId, profesionalId, fechaHora }) {
    const id = uuidv4();
    this.db
      .prepare(
        `INSERT INTO turnos (id, paciente_id, profesional_id, fecha_hora, estado)
         VALUES (?, ?, ?, ?, 'reservado')`
      )
      .run(id, pacienteId, profesionalId, fechaHora);
    return this.obtenerPorId(id);
  }

  obtenerPorId(id) {
    return this.db.prepare('SELECT * FROM turnos WHERE id = ?').get(id);
  }

  listarPorPaciente(pacienteId) {
    return this.db
      .prepare('SELECT * FROM turnos WHERE paciente_id = ? ORDER BY fecha_hora DESC')
      .all(pacienteId);
  }

  listarPorProfesional(profesionalId, { desde, hasta } = {}) {
    if (desde && hasta) {
      return this.db
        .prepare(
          `SELECT * FROM turnos WHERE profesional_id = ? AND fecha_hora BETWEEN ? AND ?
           ORDER BY fecha_hora ASC`
        )
        .all(profesionalId, desde, hasta);
    }
    return this.db
      .prepare('SELECT * FROM turnos WHERE profesional_id = ? ORDER BY fecha_hora ASC')
      .all(profesionalId);
  }

  cancelar(id) {
    this.db.prepare(`UPDATE turnos SET estado = 'cancelado' WHERE id = ?`).run(id);
    return this.obtenerPorId(id);
  }

  reasignar(id, nuevoPacienteId) {
    this.db
      .prepare(`UPDATE turnos SET paciente_id = ?, estado = 'reservado' WHERE id = ?`)
      .run(nuevoPacienteId, id);
    return this.obtenerPorId(id);
  }
}

module.exports = TurnoRepository;
