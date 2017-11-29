const express = require('express');
const billingsController = require('./billings.controller');
const router = express.Router();

router.get('/listUserBillings', billingsController.listUserBilling);
router.get('/detail', billingsController.getSalesDetail);
router.post('/saveUserBillings', billingsController.saveUserBillings);

module.exports = router;