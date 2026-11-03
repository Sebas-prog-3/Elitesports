const pool = require('../config/database');

const obtenerDeportes = async () => {
  const resultado = await pool.query(`
    SELECT id_deporte, nombre, descripcion, estado
    FROM elitesport.deportes
    ORDER BY id_deporte;
  `);
  return resultado.rows;
};

const obtenerDeportePorId = async (id) => {
  const resultado = await pool.query(`
    SELECT id_deporte, nombre, descripcion, estado
    FROM elitesport.deportes
    WHERE id_deporte = $1;
  `, [id]);
  return resultado.rows[0];
};

const crearDeporte = async (nombre, descripcion, estado = true) => {
  const resultado = await pool.query(`
    INSERT INTO elitesport.deportes (nombre, descripcion, estado)
    VALUES ($1, $2, $3)
    RETURNING id_deporte, nombre, descripcion, estado;
  `, [nombre, descripcion, estado]);
  return resultado.rows[0];
};

const actualizarDeporte = async (id, nombre, descripcion, estado) => {
  const resultado = await pool.query(`
    UPDATE elitesport.deportes
    SET nombre = $1, descripcion = $2, estado = $3
    WHERE id_deporte = $4
    RETURNING id_deporte, nombre, descripcion, estado;
  `, [nombre, descripcion, estado, id]);
  return resultado.rows[0];
};

const eliminarDeporte = async (id) => {
  const resultado = await pool.query(`
    DELETE FROM elitesport.deportes
    WHERE id_deporte = $1
    RETURNING id_deporte, nombre, descripcion, estado;
  `, [id]);
  return resultado.rows[0];
};

const crearCategoria = async ({ id_deporte, nombre, edad_minima, edad_maxima, descripcion }) => {
  const resultado = await pool.query(`
    INSERT INTO elitesport.categorias
      (id_deporte, nombre, edad_minima, edad_maxima, descripcion)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id_categoria, id_deporte, nombre, edad_minima, edad_maxima, descripcion;
  `, [id_deporte, nombre, edad_minima, edad_maxima, descripcion || null]);
  return resultado.rows[0];
};

module.exports = {
  obtenerDeportes,
  obtenerDeportePorId,
  crearDeporte,
  actualizarDeporte,
  eliminarDeporte,
  crearCategoria,
};
