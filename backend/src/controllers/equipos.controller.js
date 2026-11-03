const { obtenerEquipos, obtenerEquiposDeportista, obtenerEquiposDisponibles, asignarEquipoEntrenador, listarJugadoresEquipo, obtenerJugadoresDisponibles, asignarJugadorEquipo, crearEquipo, eliminarEquipo, eliminarCategoria, obtenerCategorias } = require('../services/equipos.service');

const listar = async (req, res) => {
  try { res.json(await obtenerEquipos(req.usuario)); }
  catch (error) { console.error(error); res.status(500).json({ mensaje: 'Error al obtener equipos' }); }
};

const misEquipos = async (req, res) => {
  try { res.json(await obtenerEquiposDeportista(req.usuario)); }
  catch (error) { console.error(error); res.status(500).json({ mensaje: 'Error al obtener tus equipos' }); }
};

const categorias = async (req, res) => {
  try { res.json(await obtenerCategorias()); }
  catch (error) { console.error(error); res.status(500).json({ mensaje: 'Error al obtener categorías' }); }
};

const crear = async (req, res) => {
  try {
    const { id_categoria, nombre } = req.body;
    if (!id_categoria || !nombre?.trim()) return res.status(400).json({ mensaje: 'Categoría y nombre son obligatorios' });
    res.status(201).json(await crearEquipo({ id_categoria, nombre: nombre.trim() }, req.usuario));
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ mensaje: 'Ya existe un equipo con ese nombre dentro de la categoría' });
    console.error(error); res.status(500).json({ mensaje: 'Error al crear equipo' });
  }
};

const borrarEquipo = async (req, res) => {
  try {
    const equipo = await eliminarEquipo(req.params.id);
    if (!equipo) return res.status(404).json({ mensaje: 'Equipo no encontrado.' });
    res.json({ mensaje: `Equipo "${equipo.nombre}" eliminado.` });
  } catch (error) {
    if (error.code === '23503') return res.status(409).json({ mensaje: 'No se puede eliminar este equipo porque tiene entrenamientos o partidos relacionados.' });
    console.error(error);
    res.status(500).json({ mensaje: 'Error al eliminar el equipo.' });
  }
};

const borrarCategoria = async (req, res) => {
  try {
    const categoria = await eliminarCategoria(req.params.id);
    if (!categoria) return res.status(404).json({ mensaje: 'Categoría no encontrada.' });
    res.json({ mensaje: `Categoría "${categoria.nombre}" eliminada.` });
  } catch (error) {
    if (error.code === '23503') return res.status(409).json({ mensaje: 'No se puede eliminar esta categoría porque tiene equipos relacionados.' });
    console.error(error);
    res.status(500).json({ mensaje: 'Error al eliminar la categoría.' });
  }
};

const disponibles = async (req, res) => {
  try { res.json(await obtenerEquiposDisponibles(req.usuario)); }
  catch (error) { console.error(error); res.status(500).json({ mensaje: 'Error al obtener equipos disponibles' }); }
};

const asignar = async (req, res) => {
  try { res.json(await asignarEquipoEntrenador(req.params.id, req.usuario)); }
  catch (error) { res.status(error.status || 500).json({ mensaje: error.message || 'Error al asignar equipo' }); }
};

const jugadores = async (req, res) => {
  try { res.json(await listarJugadoresEquipo(req.params.id, req.usuario)); }
  catch (error) { console.error(error); res.status(500).json({ mensaje: 'Error al obtener jugadores del equipo' }); }
};

const jugadoresDisponibles = async (req, res) => {
  try { res.json(await obtenerJugadoresDisponibles(req.params.id, req.usuario)); }
  catch (error) { console.error(error); res.status(500).json({ mensaje: 'Error al obtener jugadores disponibles' }); }
};

const asignarJugador = async (req, res) => {
  try {
    const { id_deportista } = req.body;
    if (!id_deportista) return res.status(400).json({ mensaje: 'Selecciona un jugador.' });
    res.status(201).json(await asignarJugadorEquipo(req.params.id, id_deportista, req.usuario));
  } catch (error) {
    if (error.code === '23505') return res.status(409).json({ mensaje: 'Este deportista ya pertenece a otro equipo.' });
    res.status(error.status || 500).json({ mensaje: error.message || 'Error al asignar jugador' });
  }
};

module.exports = { listar, misEquipos, categorias, crear, borrarEquipo, borrarCategoria, disponibles, asignar, jugadores, jugadoresDisponibles, asignarJugador };
