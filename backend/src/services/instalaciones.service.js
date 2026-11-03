const pool = require('../config/database');

const listarInstalacionesDisponibles = async () => {
  const resultado = await pool.query(`
    SELECT id_instalacion, nombre, tipo, ubicacion, capacidad
    FROM elitesport.instalaciones
    WHERE estado = TRUE
    ORDER BY nombre;
  `);
  return resultado.rows;
};

const crearInstalacion = async ({ nombre, tipo, ubicacion, capacidad }) => {
  const resultado = await pool.query(`
    INSERT INTO elitesport.instalaciones (nombre, tipo, ubicacion, capacidad, estado)
    SELECT $1::varchar, $2::varchar, $3::varchar, $4::integer, TRUE
    WHERE NOT EXISTS (
      SELECT 1 FROM elitesport.instalaciones WHERE LOWER(nombre) = LOWER($1::varchar)
    )
    RETURNING id_instalacion, nombre, tipo, ubicacion, capacidad, estado;
  `, [nombre, tipo, ubicacion || null, capacidad || null]);
  if (!resultado.rowCount) throw Object.assign(new Error('Ya existe una instalación con ese nombre.'), { status: 409 });
  return resultado.rows[0];
};

module.exports = { listarInstalacionesDisponibles, crearInstalacion };
