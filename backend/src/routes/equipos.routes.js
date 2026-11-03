const express = require('express');
const { listar, misEquipos, categorias, crear, borrarEquipo, borrarCategoria, disponibles, asignar, jugadores, jugadoresDisponibles, asignarJugador } = require('../controllers/equipos.controller');
const { autenticar } = require('../middleware/auth.middleware');
const { permitirRoles } = require('../middleware/role.middleware');

const router = express.Router();
router.get('/', autenticar, permitirRoles('Administrador', 'Entrenador'), listar);
router.get('/mis', autenticar, permitirRoles('Deportista'), misEquipos);
router.get('/categorias', autenticar, permitirRoles('Administrador', 'Entrenador'), categorias);
router.delete('/categorias/:id', autenticar, permitirRoles('Administrador'), borrarCategoria);
router.get('/disponibles', autenticar, permitirRoles('Entrenador'), disponibles);
router.post('/:id/asignar', autenticar, permitirRoles('Entrenador'), asignar);
router.get('/:id/jugadores', autenticar, permitirRoles('Entrenador'), jugadores);
router.get('/:id/jugadores-disponibles', autenticar, permitirRoles('Entrenador'), jugadoresDisponibles);
router.post('/:id/jugadores', autenticar, permitirRoles('Entrenador'), asignarJugador);
router.post('/', autenticar, permitirRoles('Administrador', 'Entrenador'), crear);
router.delete('/:id', autenticar, permitirRoles('Administrador'), borrarEquipo);

module.exports = router;
