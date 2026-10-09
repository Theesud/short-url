const express = require('express');
const { createUrl, listUrls } = require('./urls.controller');

const router = express.Router();

router.post('/', createUrl);
router.get('/', listUrls);

module.exports = router;