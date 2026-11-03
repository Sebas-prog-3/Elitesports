const express = require('express');
const { dashboard } = require('../controllers/dashboard.controller');
const { autenticar } = require('../middleware/auth.middleware');

const router = express.Router();
router.get('/', autenticar, dashboard);

module.exports = router;
