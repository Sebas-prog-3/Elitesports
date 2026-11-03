const express = require('express');
const { listar, disponibles, inscribir } = require('../controllers/torneos.controller');
const { autenticar } = require('../middleware/auth.middleware');
const { permitirRoles } = require('../middleware/role.middleware');

const router = express.Router();
router.get('/', autenticar, listar);
router.get('/disponibles', autenticar, permitirRoles('Entrenador'), disponibles);
router.post('/:id/equipos', autenticar, permitirRoles('Entrenador'), inscribir);

module.exports = router;
