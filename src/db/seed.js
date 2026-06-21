const { v4: uuidv4 } = require('uuid');
const { getConnection } = require('./connection');

function seed() {
  const db = getConnection();

  // Limpiar datos existentes (idempotente para re-ejecutar la demo)
  db.exec('DELETE FROM lista_espera; DELETE FROM turnos; DELETE FROM pacientes; DELETE FROM profesionales;');

  const profesionales = [
    { id: uuidv4(), nombre: 'Dra. Lucía Fernández', especialidad: 'Cardiología', duracion_turno_min: 30 },
    { id: uuidv4(), nombre: 'Dr. Martín Gómez',      especialidad: 'Dermatología', duracion_turno_min: 20 },
  ];

  const insertProf = db.prepare(
    'INSERT INTO profesionales (id, nombre, especialidad, duracion_turno_min) VALUES (?, ?, ?, ?)'
  );
  profesionales.forEach(p => insertProf.run(p.id, p.nombre, p.especialidad, p.duracion_turno_min));

  const pacientes = [
    { id: uuidv4(), nombre: 'Juan Pérez',    email: 'juan.perez@example.com',    telefono: '+5491100000001' },
    { id: uuidv4(), nombre: 'María Gómez',   email: 'maria.gomez@example.com',   telefono: '+5491100000002' },
    { id: uuidv4(), nombre: 'Carlos Ruiz',   email: 'carlos.ruiz@example.com',   telefono: '+5491100000003' },
  ];

  const insertPac = db.prepare(
    'INSERT INTO pacientes (id, nombre, email, telefono) VALUES (?, ?, ?, ?)'
  );
  pacientes.forEach(p => insertPac.run(p.id, p.nombre, p.email, p.telefono));

  // Un turno ya reservado para probar el caso "sin disponibilidad"
  const insertTurno = db.prepare(
    `INSERT INTO turnos (id, paciente_id, profesional_id, fecha_hora, estado)
     VALUES (?, ?, ?, ?, 'reservado')`
  );
  insertTurno.run(
    uuidv4(),
    pacientes[0].id,
    profesionales[0].id,
    '2026-07-01T10:00:00'
  );

  console.log('Seed completado.');
  console.log('Profesionales:', profesionales.map(p => `${p.nombre} (${p.id})`));
  console.log('Pacientes:', pacientes.map(p => `${p.nombre} (${p.id})`));

  db.close();
  return { profesionales, pacientes };

}

if (require.main === module) {
  seed();
}

module.exports = { seed };
