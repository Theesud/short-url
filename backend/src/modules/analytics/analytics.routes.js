const express = require('express');
const { getUrlStats } = require('./analytics.controller');
const { requireAuth } = require('../auth/auth.middleware');

const router = express.Router();

router.get('/:code/stats', requireAuth, getUrlStats);

module.exports = router;