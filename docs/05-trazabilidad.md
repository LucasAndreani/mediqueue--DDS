# 5. Trazabilidad: diseño (Primer Parcial) a código (Segundo Parcial)

El diagrama de secuencia de Reserva de turno, con sus actores Paciente, Frontend, API Gateway,
Base de datos y Notif. Service, se implementa en TurnoController (metodo reservar), en
TurnoService (metodo reservarTurno), en TurnoRepository y en NotificacionService. El unico
desvio respecto del diseño original es que el "Frontend" del diagrama no se implementa como capa
separada en esta entrega, ya que la interfaz de usuario queda en la seccion opcional; el
controller asume directamente el rol de punto de entrada HTTP. Esto se justifica porque la
consigna del Segundo Parcial permite reducir el alcance al backend.

El diagrama de secuencia de Cancelacion y reasignacion se implementa en TurnoController (metodo
cancelar), en TurnoService (metodo cancelarTurno) y en ListaEsperaRepository. Aqui se agrego una
validacion de plazo minimo de cancelacion, de dos horas, que no estaba explicita en el diagrama
de secuencia original. Este agregado corresponde a la regla de negocio no trivial pedida en la
consigna del Segundo Parcial, y es coherente con el flujo alternativo ya definido en el diagrama,
sin contradecirlo.

El diagrama de arquitectura en tres capas, presentacion, logica y datos, se replica en la
estructura de carpetas del proyecto: controllers y routes para presentacion, services para
logica de negocio, y repositories junto con db para datos. El diagrama original definia
PostgreSQL y Redis como motor de datos; en esta entrega se usa SQLite a traves de node:sqlite,
como simplificacion para tener un entorno de demo reproducible sin infraestructura externa. Como
el acceso a datos esta encapsulado en los repositorios, migrar a PostgreSQL en el futuro no
requeriria modificar la capa de servicios.

El componente Booking Module del diagrama de componentes se implementa sin desvios en
TurnoService. El componente Notification Module se implementa en NotificacionService, pero solo
simula el envio de notificaciones, sin integrar Twilio o SendGrid reales; el contrato que
TurnoService consume si respeta el diseño original, y el envio real queda fuera de alcance segun
lo indicado en la seccion 1. El componente API Gateway, que en el diseño original incluia
autenticacion, ruteo y rate limiting, se implementa parcialmente en app.js solo en su rol de
composicion de rutas, sin autenticacion ni rate limiting, ya que ambos quedan excluidos del
alcance de esta entrega y se asumen responsabilidad de un modulo de Auth no incluido.

Finalmente, el diagrama Entidad-Relacion del Primer Parcial se implementa en
src/db/schema.sql, con las entidades profesionales, pacientes, turnos y lista_espera. Se agrego
la entidad lista_espera con un detalle relacional explicito que en el Primer Parcial estaba
implicita en el flujo de secuencia; fue necesaria para poder persistir el flujo alternativo de
reasignacion automatica descripto en el diagrama de secuencia de cancelacion.
