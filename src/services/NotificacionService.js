// Implementación simplificada: en producción dispararía un mensaje real
// por Email/WhatsApp (ver Notif. Service en el diagrama de arquitectura del
// Primer Parcial). Para esta entrega solo registra el evento en consola/log.
class NotificacionService {
  constructor() {
    this.enviados = []; // útil para verificar en tests
  }

  notificarConfirmacion(turno) {
    const msg = `[Notificación] Turno ${turno.id} confirmado para ${turno.fecha_hora}`;
    this.enviados.push({ tipo: 'confirmacion', turnoId: turno.id, msg });
    return msg;
  }

  notificarTurnoDisponible(turno) {
    const msg = `[Notificación] Turno ${turno.id} reasignado, disponible para ${turno.fecha_hora}`;
    this.enviados.push({ tipo: 'reasignacion', turnoId: turno.id, msg });
    return msg;
  }
}

module.exports = NotificacionService;
