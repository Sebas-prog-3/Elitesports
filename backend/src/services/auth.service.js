const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const obtenerUsuarioPorLogin = async (login) => {
  const resultado = await pool.query(`
    SELECT
      u.id_usuario,
      u.nombre_usuario,
      u.correo,
      u.contrasena,
      u.estado,
      r.id_rol,
      r.nombre AS rol
    FROM elitesport.usuarios u
    INNER JOIN elitesport.roles r ON r.id_rol = u.id_rol
    WHERE (LOWER(u.nombre_usuario) = LOWER($1) OR LOWER(u.correo) = LOWER($1));
  `, [login]);

  return resultado.rows[0];
};

const obtenerPerfil = async (idUsuario) => {
  const resultado = await pool.query(`
    SELECT
      u.id_usuario,
      u.nombre_usuario,
      u.correo,
      u.estado,
      r.id_rol,
      r.nombre AS rol,
      d.id_deportista,
      d.nombre AS nombre_deportista,
      d.apellido AS apellido_deportista,
      e.id_entrenador,
      e.nombre AS nombre_entrenador,
      e.apellido AS apellido_entrenador
    FROM elitesport.usuarios u
    INNER JOIN elitesport.roles r ON r.id_rol = u.id_rol
    LEFT JOIN elitesport.deportistas d ON d.id_usuario = u.id_usuario
    LEFT JOIN elitesport.entrenadores e ON e.id_usuario = u.id_usuario
    WHERE u.id_usuario = $1;
  `, [idUsuario]);

  return resultado.rows[0];
};

const iniciarSesion = async (login, contrasena) => {
  const usuario = await obtenerUsuarioPorLogin(login);

  if (!usuario || !usuario.estado) {
    return null;
  }

  const coincide = await bcrypt.compare(contrasena, usuario.contrasena);

  if (!coincide) {
    return null;
  }

  const token = jwt.sign(
    {
      id_usuario: usuario.id_usuario,
      nombre_usuario: usuario.nombre_usuario,
      rol: usuario.rol,
    },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );

  return {
    token,
    usuario: {
      id_usuario: usuario.id_usuario,
      nombre_usuario: usuario.nombre_usuario,
      correo: usuario.correo,
      rol: usuario.rol,
    },
  };
};

module.exports = {
  iniciarSesion,
  obtenerPerfil,
};
