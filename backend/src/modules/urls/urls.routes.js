const express = require('express');
const { createUrl } = require('./urls.controller');

const router = express.Router();

router.post('/', createUrl);

module.exports = router;