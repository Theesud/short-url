const express = require('express');
const { getUrlStats } = require('./analytics.controller');

const router = express.Router();

router.get('/:code/stats', getUrlStats);

module.exports = router;