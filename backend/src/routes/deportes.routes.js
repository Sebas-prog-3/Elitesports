const express = require('express');
const {
  listarDeportes,
  buscarDeportePorId,
  registrarDeporte,
  editarDeporte,
  borrarDeporte,
  registrarCategoria,
} = require('../controllers/deportes.controller');
const { autenticar } = require('../middleware/auth.middleware');
const { permitirRoles } = require('../middleware/role.middleware');

const router = express.Router();
router.get('/', listarDeportes);
router.get('/:id', buscarDeportePorId);
router.post('/', autenticar, permitirRoles('Administrador'), registrarDeporte);
router.post('/categorias', autenticar, permitirRoles('Administrador'), registrarCategoria);
router.put('/:id', autenticar, permitirRoles('Administrador'), editarDeporte);
router.delete('/:id', autenticar, permitirRoles('Administrador'), borrarDeporte);

module.exports = router;
