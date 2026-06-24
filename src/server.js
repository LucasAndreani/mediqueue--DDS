const createApp = require('./app');

const PORT = process.env.PORT || 3000;
const app = createApp();

app.listen(PORT, () => {
  console.log(`MediQueue - Modulo de Turnos escuchando en http://localhost:${PORT}`);
});
