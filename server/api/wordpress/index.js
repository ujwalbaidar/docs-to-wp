const express = require('express');
const wordpressController = require('./wordpress.controller');
const router = express.Router();

router.get('/oAuthUrl', wordpressController.getOAuthUrl);
router.get('/action/:validate/loginType/:wp', wordpressController.validateWpCode);
router.get('/listPosts', wordpressController.getPosts);

module.exports = router;