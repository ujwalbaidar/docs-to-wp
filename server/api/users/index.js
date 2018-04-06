const express = require('express');
const usersController = require('./users.controller');
const router = express.Router();

router.get('/list', usersController.listUsers);
router.get('/getUserInfo', usersController.getUserInfo);
router.get('/oAuthUrl', usersController.getOAuthUrl);
router.post('/adminUser', usersController.createAdminUser);
router.post('/adminLogin', usersController.adminLogin);
router.post('/validateAuthCode', usersController.validateAuthCode);
router.put('/updateUserInfo', usersController.updateUserInfo);
router.get('/listUserDomains', usersController.listUserDomains);
module.exports = router;