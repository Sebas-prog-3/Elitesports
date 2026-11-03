const { listarEntrenamientos, obtenerRecursosEntrenamiento, crearEntrenamiento } = require('../services/entrenamientos.service');

const listar = async (req, res) => {
  try { res.json(await listarEntrenamientos(req.usuario)); }
  catch (error) { console.error(error); res.status(500).json({ mensaje: 'Error al obtener entrenamientos' }); }
};

const recursos = async (req, res) => {
  try { res.json(await obtenerRecursosEntrenamiento()); }
  catch (error) { console.error(error); res.status(500).json({ mensaje: 'Error al obtener recursos' }); }
};

const crear = async (req, res) => {
  try {
    const { id_equipo, id_entrenador, id_instalacion, dia_semana, hora_inicio, hora_fin, fecha, descripcion } = req.body;
    const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    const formatoHora = /^([01]\d|2[0-3]):[0-5]\d$/;
    if (!id_equipo || (req.usuario.rol === 'Administrador' && !id_entrenador) || !id_instalacion || !fecha ||
        !dias.includes(dia_semana) || !formatoHora.test(hora_inicio || '') || !formatoHora.test(hora_fin || '')) {
      return res.status(400).json({ mensaje: 'Equipo, entrenador, instalación, horario y fecha son obligatorios' });
    }
    if (hora_inicio >= hora_fin) return res.status(400).json({ mensaje: 'La hora de finalización debe ser posterior a la hora de inicio.' });
    res.status(201).json(await crearEntrenamiento({ id_equipo, id_entrenador, id_instalacion, dia_semana, hora_inicio, hora_fin, fecha, descripcion }, req.usuario));
  } catch (error) {
    if (error.status) return res.status(error.status).json({ mensaje: error.message });
    console.error(error); res.status(500).json({ mensaje: 'Error al crear entrenamiento' });
  }
};

module.exports = { listar, recursos, crear };
