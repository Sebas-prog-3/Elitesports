const { listarInstalacionesDisponibles, crearInstalacion } = require('../services/instalaciones.service');

const listarDisponibles = async (req, res) => {
  try { res.json(await listarInstalacionesDisponibles()); }
  catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al obtener las instalaciones disponibles.' });
  }
};

const crear = async (req, res) => {
  try {
    const { nombre, tipo, ubicacion, capacidad } = req.body;
    const aforo = capacidad === '' || capacidad == null ? null : Number(capacidad);
    if (!nombre?.trim() || !tipo?.trim()) {
      return res.status(400).json({ mensaje: 'El nombre y el tipo de instalación son obligatorios.' });
    }
    if (nombre.trim().length > 80 || tipo.trim().length > 50 || (ubicacion && ubicacion.trim().length > 150)) {
      return res.status(400).json({ mensaje: 'Revisa la longitud del nombre, tipo y ubicación de la instalación.' });
    }
    if (aforo !== null && (!Number.isInteger(aforo) || aforo < 1)) {
      return res.status(400).json({ mensaje: 'La capacidad debe ser un número entero mayor que cero.' });
    }
    const instalacion = await crearInstalacion({
      nombre: nombre.trim(), tipo: tipo.trim(), ubicacion: ubicacion?.trim() || null, capacidad: aforo,
    });
    res.status(201).json(instalacion);
  } catch (error) {
    if (error.status === 409 || error.code === '23505') return res.status(409).json({ mensaje: 'Ya existe una instalación con ese nombre.' });
    console.error(error);
    res.status(500).json({ mensaje: 'Error al crear la instalación.' });
  }
};

module.exports = { listarDisponibles, crear };
