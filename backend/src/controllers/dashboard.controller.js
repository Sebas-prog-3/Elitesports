const { obtenerDashboard } = require('../services/dashboard.service');

const dashboard = async (req, res) => {
  try {
    const resultado = await obtenerDashboard(req.usuario);
    res.json(resultado);
  } catch (error) {
    console.error('Error del dashboard:', error);
    res.status(500).json({ mensaje: 'Error al cargar el dashboard' });
  }
};

module.exports = { dashboard };
