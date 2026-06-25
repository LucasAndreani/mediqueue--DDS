# 4. Pruebas

automatizado con Jest y Supertest, ejecutable con npm test. Resultado real de la ultima corrida (capturado directamente de la consola): 8 de 8 casos pasaron.

Salida de la consola:

PASS tests/turno.test.js
  Modulo de Turnos - MediQueue
    CP01 - Reserva un turno disponible correctamente (201) (68 ms)
    CP02 - Rechaza la reserva si el horario ya esta ocupado (409) (8 ms)
    CP03 - Rechaza la reserva con datos incompletos (400) (5 ms)
    CP04 - Cancela un turno con anticipacion suficiente y lo libera (6 ms)
    CP05 - Cancela y reasigna automaticamente al primero en lista de espera (10 ms)
    CP06 - Rechaza la cancelacion con menos de 2 horas de anticipacion (5 ms)
    CP07 - Devuelve 404 al cancelar un turno que no existe (3 ms)
    CP08 - Consulta de disponibilidad devuelve los horarios ocupados del dia (7 ms)

Test Suites: 1 passed, 1 total
Tests: 8 passed, 8 total

## Detalle de cada caso

CP01. Precondicion: el profesional y el paciente existen y el horario esta libre. Entrada: POST
/api/turnos con pacienteId, profesionalId y fechaHora 2030-01-15T10:00:00. Resultado esperado:
201 con el turno creado en estado reservado. Resultado obtenido: 201, estado "reservado".

CP02. Precondicion: ya existe un turno reservado para ese profesional y ese horario. Entrada:
POST /api/turnos con el mismo profesionalId y fechaHora, pero otro paciente. Resultado esperado:
409 TURNO_CONFLICT. Resultado obtenido: 409, error "TURNO_CONFLICT".

CP03. Precondicion: ninguna en particular. Entrada: POST /api/turnos sin profesionalId ni
fechaHora. Resultado esperado: 400 VALIDATION_ERROR. Resultado obtenido: 400, error
"VALIDATION_ERROR".

CP04. Precondicion: turno reservado con fecha futura lejana y sin nadie en lista de espera.
Entrada: DELETE /api/turnos/:id. Resultado esperado: 200, turno cancelado, reasignado false.
Resultado obtenido: 200, reasignado false.

CP05. Precondicion: turno reservado mas un paciente anotado en lista de espera para el mismo
horario. Entrada: DELETE /api/turnos/:id. Resultado esperado: 200, turno reasignado al paciente
en espera, reasignado true. Resultado obtenido: 200, reasignado true, pacienteId actualizado al
del paciente en espera.

CP06. Precondicion: turno reservado para dentro de 1 hora (la regla exige un minimo de 2 horas
de anticipacion para cancelar). Entrada: DELETE /api/turnos/:id. Resultado esperado: 422
CANCELACION_FUERA_DE_PLAZO. Resultado obtenido: 422, error "CANCELACION_FUERA_DE_PLAZO".

CP07. Precondicion: el turno no existe en la base. Entrada: DELETE /api/turnos/:id-inexistente.
Resultado esperado: 404 TURNO_NOT_FOUND. Resultado obtenido: 404, error "TURNO_NOT_FOUND".

CP08. Precondicion: existe un turno reservado en una fecha dada. Entrada: GET
/api/turnos/disponibilidad con profesionalId y fecha 2030-03-05. Resultado esperado: 200 con el
horario ocupado incluido en la respuesta. Resultado obtenido: 200, el horario aparece en
horariosOcupados.

## Evidencia manual adicional (smoke test sobre servidor real)

Ademas de los tests automatizados, se levanto el servidor con npm start tras correr el seed y se
probo manualmente con curl. Una reserva contra un horario libre devolvio 201 con el turno
creado correctamente. Una segunda reserva contra el mismo profesional y horario devolvio 409
TURNO_CONFLICT. La consulta de disponibilidad sobre esa misma fecha reflejo el horario como
ocupado. Esto confirma que el comportamiento validado en los tests automatizados coincide con el
comportamiento real de la API servida sobre Express y node:sqlite.