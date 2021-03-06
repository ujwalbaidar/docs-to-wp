const express = require('express');
const billingsController = require('./billings.controller');
const router = express.Router();

router.get('/listUserBillings', billingsController.listUserBilling);
router.get('/listAdminBillings', billingsController.listAdminBillings);
router.get('/detail', billingsController.getSalesDetail);
router.get('/userBillingInfo', billingsController.getUserBillingInfo);
router.post('/saveUserBillings', billingsController.saveUserBillings);
router.post('/insInfo', billingsController.handleInsInfo);

module.exports = router;