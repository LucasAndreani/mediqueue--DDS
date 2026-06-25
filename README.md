# MediQueue - Modulo de Turnos 

Implementacion del modulo de gestion de turnos del sistema MediQueue, desarrollado para el
Segundo Parcial de Diseño de Sistemas, sobre el diseño definido en el Primer Parcial.

## Stack

Node.js 22 o superior, usando node:sqlite, el modulo nativo experimental de SQLite que no
requiere instalar ni compilar ningun motor de base de datos aparte. Express como framework web.
Jest y Supertest para testing.

## Estructura del proyecto

La carpeta src/controllers contiene la capa de presentacion HTTP. src/routes define los
endpoints. src/services contiene la logica de negocio, reglas y validaciones. src/repositories
contiene el acceso a datos en SQL. src/models contiene los errores de dominio. src/middlewares
contiene el manejo centralizado de errores. src/db contiene el schema.sql, la conexion y el
script de seed. La carpeta tests contiene las pruebas automatizadas con Jest y Supertest.

## Instalacion

Requiere Node.js 22.5 o superior, por el uso de node:sqlite.

```
npm install
```

## Cargar datos de prueba (seed)

```
npm run seed
```

Esto crea el archivo src/db/mediqueue.db con dos profesionales, tres pacientes y un turno ya
reservado, para poder probar manualmente el caso de conflicto de horario.

## Ejecutar el servidor

```
npm start
```

El servidor queda escuchando en [http://localhost:3000](http://localhost:3000).

### Endpoints disponibles

GET /health devuelve un chequeo de estado. POST /api/turnos reserva un turno y recibe
pacienteId, profesionalId y fechaHora. DELETE /api/turnos/:id cancela un turno, con reasignacion
automatica si hay alguien en lista de espera. GET /api/turnos/disponibilidad, con los parametros
profesionalId y fecha, consulta los horarios ocupados de un dia. GET
/api/turnos/paciente/:pacienteId lista los turnos de un paciente. POST /api/turnos/espera anota a
un paciente en lista de espera.

### Ejemplo de uso con curl

```
curl -X POST http://localhost:3000/api/turnos \
  -H "Content-Type: application/json" \
  -d '{"pacienteId":"<uuid>","profesionalId":"<uuid>","fechaHora":"2030-08-10T09:00:00"}'
```

## Ejecutar las pruebas

```
npm test
```

Corre 8 casos de prueba, entre flujo normal y flujos de error, usando una base de datos en
memoria, totalmente aislada del archivo mediqueue.db usado para la demo manual.

## Documentacion de la entrega

La carpeta docs contiene el detalle de alcance del modulo, el modelo de datos con su ERD, los
casos de prueba documentados y la tabla de trazabilidad entre el diseño y el codigo.

## Notas de diseño

La regla de negocio no trivial implementada es que no se puede cancelar un turno con menos de
dos horas de anticipacion; esta logica vive en TurnoService, en la constante
HORAS_MINIMAS_CANCELACION. El flujo de reasignacion automatica a lista de espera replica
exactamente el diagrama de secuencia de Cancelacion y reasignacion del Primer Parcial.