const express = require('express');
const {
  listarEntrenadores, crearEntrenador,
  listarDeportistas, crearDeportista,
} = require('../controllers/usuarios.controller');
const { autenticar } = require('../middleware/auth.middleware');
const { permitirRoles } = require('../middleware/role.middleware');

const router = express.Router();
router.use(autenticar, permitirRoles('Administrador'));
router.get('/entrenadores', listarEntrenadores);
router.post('/entrenadores', crearEntrenador);
router.get('/deportistas', listarDeportistas);
router.post('/deportistas', crearDeportista);

module.exports = router;
