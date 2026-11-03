const permitirRoles = (...rolesPermitidos) => (req, res, next) => {
  if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol)) {
    return res.status(403).json({ mensaje: 'No tienes permisos para esta operación' });
  }
  next();
};

module.exports = { permitirRoles };
