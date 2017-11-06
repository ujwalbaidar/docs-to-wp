const express = require('express');
const usersController = require('./users.controller');
const router = express.Router();

router.get('/oAuthUrl', usersController.getOAuthUrl);
router.post('/validateAuthCode', usersController.validateAuthCode);

module.exports = router;