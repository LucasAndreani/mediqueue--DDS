const express = require('express');

function turnoRoutes(turnoController) {
  const router = express.Router();

  router.post('/', turnoController.reservar);
  router.delete('/:id', turnoController.cancelar);
  router.get('/disponibilidad', turnoController.disponibilidad);
  router.get('/paciente/:pacienteId', turnoController.listarPorPaciente);
  router.post('/espera', turnoController.anotarseEnEspera);

  return router;
}

module.exports = turnoRoutes;
