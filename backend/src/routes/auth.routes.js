const express = require('express');
const { login, me } = require('../controllers/auth.controller');
const { autenticar } = require('../middleware/auth.middleware');

const router = express.Router();
router.post('/login', login);
router.get('/me', autenticar, me);

module.exports = router;
