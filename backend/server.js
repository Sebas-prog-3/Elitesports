const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const authRoutes = require('./src/routes/auth.routes');
const dashboardRoutes = require('./src/routes/dashboard.routes');
const deportesRoutes = require('./src/routes/deportes.routes');
const equiposRoutes = require('./src/routes/equipos.routes');
const entrenamientosRoutes = require('./src/routes/entrenamientos.routes');
const torneosRoutes = require('./src/routes/torneos.routes');
const usuariosRoutes = require('./src/routes/usuarios.routes');
const instalacionesRoutes = require('./src/routes/instalaciones.routes');

const app = express();
const PORT = Number(process.env.PORT || 4000);

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
}));
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.json({ mensaje: 'Backend de EliteSport funcionando' });
});

app.get('/api/health', (req, res) => {
  res.json({ estado: 'ok', servicio: 'EliteSport API' });
});

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/deportes', deportesRoutes);
app.use('/api/equipos', equiposRoutes);
app.use('/api/entrenamientos', entrenamientosRoutes);
app.use('/api/torneos', torneosRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/instalaciones', instalacionesRoutes);

app.use((req, res) => {
  res.status(404).json({ mensaje: 'Ruta no encontrada' });
});

app.listen(PORT, () => {
  console.log(`Servidor EliteSport ejecutándose en http://localhost:${PORT}`);
});
