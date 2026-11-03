const express = require('express');
const { listar, recursos, crear } = require('../controllers/entrenamientos.controller');
const { autenticar } = require('../middleware/auth.middleware');
const { permitirRoles } = require('../middleware/role.middleware');

const router = express.Router();
router.get('/', autenticar, permitirRoles('Administrador', 'Entrenador', 'Deportista'), listar);
router.get('/recursos', autenticar, permitirRoles('Administrador', 'Entrenador'), recursos);
router.post('/', autenticar, permitirRoles('Administrador', 'Entrenador'), crear);

module.exports = router;
