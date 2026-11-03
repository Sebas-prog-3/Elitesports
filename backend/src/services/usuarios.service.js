const bcrypt = require('bcryptjs');
const pool = require('../config/database');

const listarUsuariosPorRol = async (rol) => {
  const tabla = rol === 'Entrenador' ? 'entrenadores' : 'deportistas';
  const idCampo = rol === 'Entrenador' ? 'id_entrenador' : 'id_deportista';
  const extra = rol === 'Entrenador'
    ? 'p.especialidad, p.fecha_contratacion'
    : 'p.fecha_nacimiento';
  const result = await pool.query(`
    SELECT p.${idCampo} AS id, p.nombre, p.apellido, p.documento,
           p.telefono, ${extra}, p.estado, u.id_usuario,
           u.nombre_usuario, u.correo, u.estado AS estado_usuario
    FROM elitesport.${tabla} p
    JOIN elitesport.usuarios u ON u.id_usuario = p.id_usuario
    ORDER BY p.apellido, p.nombre;
  `);
  return result.rows;
};

const crearUsuarioDeportivo = async (rol, datos) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const roleResult = await client.query(
      'SELECT id_rol FROM elitesport.roles WHERE nombre = $1',
      [rol]
    );
    if (!roleResult.rowCount) throw Object.assign(new Error('El rol solicitado no existe. Ejecuta el script de datos iniciales.'), { status: 400 });

    const hash = await bcrypt.hash(datos.contrasena, 12);
    const userResult = await client.query(`
      INSERT INTO elitesport.usuarios (id_rol, nombre_usuario, correo, contrasena, estado)
      VALUES ($1, $2, $3, $4, TRUE)
      RETURNING id_usuario, nombre_usuario, correo, estado;
    `, [roleResult.rows[0].id_rol, datos.nombre_usuario, datos.correo, hash]);
    const user = userResult.rows[0];

    let perfil;
    if (rol === 'Entrenador') {
      const result = await client.query(`
        INSERT INTO elitesport.entrenadores
          (id_usuario, nombre, apellido, documento, telefono, especialidad, fecha_contratacion, estado)
        VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE)
        RETURNING id_entrenador AS id, nombre, apellido, documento, telefono, especialidad, fecha_contratacion, estado;
      `, [user.id_usuario, datos.nombre, datos.apellido, datos.documento, datos.telefono || null, datos.especialidad || null, datos.fecha_contratacion]);
      perfil = result.rows[0];
    } else {
      const result = await client.query(`
        INSERT INTO elitesport.deportistas
          (id_usuario, nombre, apellido, fecha_nacimiento, documento, telefono, direccion, estado)
        VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE)
        RETURNING id_deportista AS id, nombre, apellido, fecha_nacimiento, documento, telefono, direccion, estado;
      `, [user.id_usuario, datos.nombre, datos.apellido, datos.fecha_nacimiento, datos.documento, datos.telefono || null, datos.direccion || null]);
      perfil = result.rows[0];
    }

    await client.query('COMMIT');
    return { ...perfil, nombre_usuario: user.nombre_usuario, correo: user.correo, id_usuario: user.id_usuario };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

module.exports = { listarUsuariosPorRol, crearUsuarioDeportivo };
