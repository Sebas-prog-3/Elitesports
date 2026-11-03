const { iniciarSesion, obtenerPerfil } = require('../services/auth.service');

const login = async (req, res) => {
  try {
    const { login: credencial, contrasena } = req.body;

    if (!credencial || !contrasena) {
      return res.status(400).json({ mensaje: 'Usuario/correo y contraseña son obligatorios' });
    }

    const resultado = await iniciarSesion(credencial.trim(), contrasena);

    if (!resultado) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }

    res.json(resultado);
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ mensaje: 'Error interno de autenticación' });
  }
};

const me = async (req, res) => {
  try {
    const perfil = await obtenerPerfil(req.usuario.id_usuario);

    if (!perfil) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }

    res.json(perfil);
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({ mensaje: 'Error al obtener perfil' });
  }
};

module.exports = { login, me };
