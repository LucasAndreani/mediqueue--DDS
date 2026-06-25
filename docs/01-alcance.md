# 1. Seleccion y alcance del modulo

## Modulo elegido

Booking Module (Gestion de Turnos) del sistema MediQueue.

## Justificacion

Es el modulo mas representativo del sistema porque concentra el problema central que MediQueue
resuelve: la mala organizacion de agendas y las cancelaciones de ultimo momento. Ademas conecta
directamente con los dos diagramas de secuencia definidos en el Primer Parcial, Reserva de turno
y Cancelacion y reasignacion, y es el modulo que mas interactua con el resto de la arquitectura
(Notification Service, Schedule Service), por lo que su implementacion permite validar en la
practica las decisiones de arquitectura tomadas anteriormente.

## Operaciones que incluye la entrega

Reservar turno, validando disponibilidad antes de crear el registro. Cancelar turno, liberando el
horario y, si corresponde, reasignando automaticamente al primer paciente en lista de espera, que
es la regla de negocio no trivial de esta entrega. Consultar disponibilidad, devolviendo los
horarios ocupados de un profesional en una fecha dada. Listar los turnos de un paciente.
Anotarse en lista de espera, cuando el horario solicitado ya esta ocupado.

## Fuera de alcance

Queda fuera de esta entrega la autenticacion y autorizacion de usuarios: se asume un pacienteId
y un profesionalId ya validos, resueltos por un modulo de Auth que no forma parte de este
parcial. Tambien queda fuera el envio real de notificaciones por WhatsApp o email, que se simula
con un servicio mock que solo registra el evento, respetando el contrato definido con el
Notification Service en el diagrama de arquitectura del Primer Parcial. La videoconsulta y el
panel de reportes tampoco forman parte del modulo de turnos. El frontend completo no se incluye
en la entrega obligatoria, ya que corresponde a la seccion opcional.

## Tecnologias elegidas

Se uso Node.js 22 como runtime, en linea con la arquitectura propuesta en el Primer Parcial  
(Node.js sobre contenedores Docker). Como framework web se elige Express, por ser liviano y no  
imponer una estructura rigida, lo que facilita separar rutas, controladores y servicios. Como  
base de datos se uso SQLite a traves del modulo nativo node:sqlite, que no requiere instalar ni  
levantar un servidor de base de datos aparte, ideal para una demo reproducible; en un entorno de  
produccion se reemplazaria por PostgreSQL sin tener que modificar la capa de servicios, ya que el  
acceso a datos esta aislado en repositorios. Para testing se eligio Jest junto con Supertest, el  
estandar de facto en proyectos Node.js, que permite probar la API de punta a punta sin necesidad  
de mockear Express.

