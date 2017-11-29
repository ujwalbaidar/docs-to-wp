const express = require('express');
const wordpressController = require('./wordpress.controller');
const router = express.Router();

router.get('/listWpUsers', wordpressController.listWpUsers);
router.get('/userInfo', wordpressController.getWpUserInfo);
router.post('/createWpUser', wordpressController.createWpUser);
router.put('/wpUser', wordpressController.updateWpUser);

module.exports = router;