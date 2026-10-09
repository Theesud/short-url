const express = require('express');
const { createUrl, listUrls } = require('./urls.controller');
const { optionalAuth, requireAuth } = require('../auth/auth.middleware');

const router = express.Router();

router.post('/', optionalAuth, createUrl);
router.get('/', requireAuth, listUrls);

module.exports = router;