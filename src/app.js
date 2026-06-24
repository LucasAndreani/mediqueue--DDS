const express = require('express');
const { getConnection } = require('./db/connection');

const TurnoRepository = require('./repositories/TurnoRepository');
const ListaEsperaRepository = require('./repositories/ListaEsperaRepository');
const { TurnoService } = require('./services/TurnoService');
const NotificacionService = require('./services/NotificacionService');
const TurnoController = require('./controllers/TurnoController');
const turnoRoutes = require('./routes/turnoRoutes');
const errorHandler = require('./middlewares/errorHandler');

function createApp(db = getConnection()) {
  const app = express();
  app.use(express.json());

  // Composición de capas (Repository -> Service -> Controller)
  const turnoRepo = new TurnoRepository(db);
  const listaEsperaRepo = new ListaEsperaRepository(db);
  const notificacionService = new NotificacionService();
  const turnoService = new TurnoService({ turnoRepo, listaEsperaRepo, notificacionService });
  const turnoController = new TurnoController(turnoService);

  app.get('/health', (req, res) => res.json({ status: 'ok' }));
  app.use('/api/turnos', turnoRoutes(turnoController));

  app.use(errorHandler);

  // Exponer instancias para tests/inspección
  app.locals.turnoService = turnoService;
  app.locals.notificacionService = notificacionService;
  app.locals.db = db;

  return app;
}

module.exports = createApp;
