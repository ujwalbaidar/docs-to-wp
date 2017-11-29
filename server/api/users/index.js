const express = require('express');
const usersController = require('./users.controller');
const router = express.Router();

router.post('/adminUser', usersController.createAdminUser);
router.post('/adminLogin', usersController.adminLogin);
router.get('/getUserInfo', usersController.getUserInfo);
router.get('/oAuthUrl', usersController.getOAuthUrl);
router.post('/validateAuthCode', usersController.validateAuthCode);
router.put('/updateUserInfo', usersController.updateUserInfo);

module.exports = router;