const { v4: uuidv4 } = require('uuid');

class ListaEsperaRepository {
  constructor(db) {
    this.db = db;
  }

  agregar({ pacienteId, profesionalId, fechaHora }) {
    const id = uuidv4();
    this.db
      .prepare(
        `INSERT INTO lista_espera (id, paciente_id, profesional_id, fecha_hora)
         VALUES (?, ?, ?, ?)`
      )
      .run(id, pacienteId, profesionalId, fechaHora);
    return this.obtenerPorId(id);
  }

  obtenerPorId(id) {
    return this.db.prepare('SELECT * FROM lista_espera WHERE id = ?').get(id);
  }

  // Devuelve el primero en la fila (FIFO) para un profesional+horario
  primeroEnEspera(profesionalId, fechaHora) {
    return this.db
      .prepare(
        `SELECT * FROM lista_espera WHERE profesional_id = ? AND fecha_hora = ?
         ORDER BY creado_en ASC LIMIT 1`
      )
      .get(profesionalId, fechaHora);
  }

  eliminar(id) {
    this.db.prepare('DELETE FROM lista_espera WHERE id = ?').run(id);
  }

  listarPorPaciente(pacienteId) {
    return this.db
      .prepare('SELECT * FROM lista_espera WHERE paciente_id = ? ORDER BY creado_en DESC')
      .all(pacienteId);
  }
}

module.exports = ListaEsperaRepository;
