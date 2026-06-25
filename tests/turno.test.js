const request = require('supertest');
const { v4: uuidv4 } = require('uuid');
const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');
const createApp = require('../src/app');

// Base de datos en memoria para aislar cada corrida de tests
function getTestDb() {
  const db = new DatabaseSync(':memory:');
  db.exec('PRAGMA foreign_keys = ON;');
  const schema = fs.readFileSync(path.join(__dirname, '../src/db/schema.sql'), 'utf8');
  db.exec(schema);
  return db;
}

function seedBasico(db) {
  const profesionalId = uuidv4();
  const pacienteId = uuidv4();
  const pacienteId2 = uuidv4();

  db.prepare(
    'INSERT INTO profesionales (id, nombre, especialidad, duracion_turno_min) VALUES (?, ?, ?, ?)'
  ).run(profesionalId, 'Dra. Test', 'Clínica médica', 30);

  db.prepare('INSERT INTO pacientes (id, nombre, email, telefono) VALUES (?, ?, ?, ?)').run(
    pacienteId,
    'Paciente Uno',
    'uno@test.com',
    '+5491111111111'
  );
  db.prepare('INSERT INTO pacientes (id, nombre, email, telefono) VALUES (?, ?, ?, ?)').run(
    pacienteId2,
    'Paciente Dos',
    'dos@test.com',
    '+5491122222222'
  );

  return { profesionalId, pacienteId, pacienteId2 };
}

describe('Módulo de Turnos - MediQueue', () => {
  let app;
  let db;
  let ids;

  beforeEach(() => {
    db = getTestDb();
    ids = seedBasico(db);
    app = createApp(db);
  });

  afterEach(() => {
    db.close();
  });

  // Caso 1: flujo normal - reserva exitosa
  test('CP01 - Reserva un turno disponible correctamente (201)', async () => {
    const fechaHora = '2030-01-15T10:00:00';
    const res = await request(app).post('/api/turnos').send({
      pacienteId: ids.pacienteId,
      profesionalId: ids.profesionalId,
      fechaHora,
    });

    expect(res.status).toBe(201);
    expect(res.body.estado).toBe('reservado');
    expect(res.body.fecha_hora).toBe(fechaHora);
  });

  // Caso 2: flujo de error - conflicto de horario (409)
  test('CP02 - Rechaza la reserva si el horario ya está ocupado (409)', async () => {
    const fechaHora = '2030-01-15T11:00:00';
    await request(app).post('/api/turnos').send({
      pacienteId: ids.pacienteId,
      profesionalId: ids.profesionalId,
      fechaHora,
    });

    const res = await request(app).post('/api/turnos').send({
      pacienteId: ids.pacienteId2,
      profesionalId: ids.profesionalId,
      fechaHora,
    });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe('TURNO_CONFLICT');
  });

  // Caso 3: flujo de error - datos invalidos (400)
  test('CP03 - Rechaza la reserva con datos incompletos (400)', async () => {
    const res = await request(app).post('/api/turnos').send({
      pacienteId: ids.pacienteId,
      // falta profesionalId y fechaHora
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('VALIDATION_ERROR');
  });

  // Caso 4: flujo normal - cancelacion libera el turno
  test('CP04 - Cancela un turno con anticipación suficiente y lo libera', async () => {
    const fechaHora = '2030-01-20T09:00:00';
    const creado = await request(app).post('/api/turnos').send({
      pacienteId: ids.pacienteId,
      profesionalId: ids.profesionalId,
      fechaHora,
    });

    const res = await request(app).delete(`/api/turnos/${creado.body.id}`);

    expect(res.status).toBe(200);
    expect(res.body.reasignado).toBe(false);
    expect(res.body.turno.estado).toBe('cancelado');
  });

  // Caso 5: flujo alternativo - cancelacion con reasignacion a lista de espera
  test('CP05 - Cancela y reasigna automáticamente al primero en lista de espera', async () => {
    const fechaHora = '2030-02-01T10:00:00';

    const creado = await request(app).post('/api/turnos').send({
      pacienteId: ids.pacienteId,
      profesionalId: ids.profesionalId,
      fechaHora,
    });

    // Paciente 2 se anota en espera porque el horario está ocupado
    await request(app).post('/api/turnos/espera').send({
      pacienteId: ids.pacienteId2,
      profesionalId: ids.profesionalId,
      fechaHora,
    });

    const res = await request(app).delete(`/api/turnos/${creado.body.id}`);

    expect(res.status).toBe(200);
    expect(res.body.reasignado).toBe(true);
    expect(res.body.turno.paciente_id).toBe(ids.pacienteId2);
    expect(res.body.turno.estado).toBe('reservado');
  });

  // Caso 6: regla de negocio no trivial - cancelacion fuera de plazo (422)
  test('CP06 - Rechaza la cancelación con menos de 2 horas de anticipación', async () => {
    const fechaHoraCercana = new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 19); // +1h

    const creado = await request(app).post('/api/turnos').send({
      pacienteId: ids.pacienteId,
      profesionalId: ids.profesionalId,
      fechaHora: fechaHoraCercana,
    });

    const res = await request(app).delete(`/api/turnos/${creado.body.id}`);

    expect(res.status).toBe(422);
    expect(res.body.error).toBe('CANCELACION_FUERA_DE_PLAZO');
  });

  // Caso 7 (extra): flujo de error - cancelar turno inexistente (404)
  test('CP07 - Devuelve 404 al cancelar un turno que no existe', async () => {
    const res = await request(app).delete(`/api/turnos/${uuidv4()}`);
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('TURNO_NOT_FOUND');
  });

  // Caso 8 (extra): flujo normal - consultar disponibilidad
  test('CP08 - Consulta de disponibilidad devuelve los horarios ocupados del día', async () => {
    const fechaHora = '2030-03-05T15:00:00';
    await request(app).post('/api/turnos').send({
      pacienteId: ids.pacienteId,
      profesionalId: ids.profesionalId,
      fechaHora,
    });

    const res = await request(app)
      .get('/api/turnos/disponibilidad')
      .query({ profesionalId: ids.profesionalId, fecha: '2030-03-05' });

    expect(res.status).toBe(200);
    expect(res.body.horariosOcupados).toContain(fechaHora);
  });
});
