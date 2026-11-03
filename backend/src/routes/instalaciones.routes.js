const express = require('express');
const { listarDisponibles, crear } = require('../controllers/instalaciones.controller');
const { autenticar } = require('../middleware/auth.middleware');
const { permitirRoles } = require('../middleware/role.middleware');

const router = express.Router();
router.get('/', autenticar, permitirRoles('Administrador', 'Entrenador'), listarDisponibles);
router.post('/', autenticar, permitirRoles('Administrador'), crear);

module.exports = router;
