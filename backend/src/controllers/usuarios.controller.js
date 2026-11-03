const { listarUsuariosPorRol, crearUsuarioDeportivo } = require('../services/usuarios.service');

const listar = (rol) => async (req, res) => {
  try {
    res.json(await listarUsuariosPorRol(rol));
  } catch (error) {
    console.error('Error listando perfiles:', error);
    res.status(500).json({ mensaje: 'No se pudieron cargar los registros.' });
  }
};

const crear = (rol) => async (req, res) => {
  const d = req.body || {};
  const comunes = ['nombre_usuario', 'correo', 'contrasena', 'nombre', 'apellido', 'documento'];
  const faltantes = comunes.filter((campo) => !String(d[campo] || '').trim());
  if (rol === 'Entrenador' && !d.fecha_contratacion) faltantes.push('fecha_contratacion');
  if (rol === 'Deportista' && !d.fecha_nacimiento) faltantes.push('fecha_nacimiento');
  if (String(d.contrasena || '').length < 8) {
    return res.status(400).json({ mensaje: 'La contraseña debe tener al menos 8 caracteres.' });
  }
  if (faltantes.length) {
    return res.status(400).json({ mensaje: `Completa los campos obligatorios: ${faltantes.join(', ')}.` });
  }
  const email = String(d.correo).trim().toLowerCase();
  const username = String(d.nombre_usuario).trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ mensaje: 'Introduce un correo electrónico válido.' });
  }
  try {
    const creado = await crearUsuarioDeportivo(rol, {
      ...d,
      correo: email,
      nombre_usuario: username,
      nombre: String(d.nombre).trim(),
      apellido: String(d.apellido).trim(),
      documento: String(d.documento).trim(),
    });
    res.status(201).json({ mensaje: `${rol} creado correctamente.`, usuario: creado });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ mensaje: 'El nombre de usuario, correo o documento ya está registrado.' });
    }
    if (error.status) return res.status(error.status).json({ mensaje: error.message });
    console.error('Error creando perfil:', error);
    res.status(500).json({ mensaje: `No se pudo crear el perfil de ${rol.toLowerCase()}.` });
  }
};

module.exports = {
  listarEntrenadores: listar('Entrenador'),
  crearEntrenador: crear('Entrenador'),
  listarDeportistas: listar('Deportista'),
  crearDeportista: crear('Deportista'),
};
