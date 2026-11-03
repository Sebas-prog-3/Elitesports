const { listarTorneos, listarTorneosDisponibles, inscribirEquipoTorneo } = require('../services/torneos.service');

const listar = async (req, res) => {
  try { res.json(await listarTorneos()); }
  catch (error) { console.error(error); res.status(500).json({ mensaje: 'Error al obtener torneos' }); }
};

const disponibles = async (req, res) => {
  try { res.json(await listarTorneosDisponibles(req.usuario)); }
  catch (error) { console.error(error); res.status(500).json({ mensaje: 'Error al obtener torneos disponibles' }); }
};

const inscribir = async (req, res) => {
  try {
    const { id_equipo } = req.body;
    if (!id_equipo) return res.status(400).json({ mensaje: 'Selecciona un equipo.' });
    res.status(201).json(await inscribirEquipoTorneo(req.params.id, id_equipo, req.usuario));
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ mensaje: 'Este equipo ya está inscrito en el torneo.' });
    res.status(error.status || 500).json({ mensaje: error.message || 'Error al inscribir el equipo al torneo' });
  }
};

module.exports = { listar, disponibles, inscribir };
