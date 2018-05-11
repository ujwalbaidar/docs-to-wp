const express = require('express');
const packagesController = require('./packages.controller');
const router = express.Router();

router.get('/getCheckoutUrl', packagesController.getCheckoutUrl);
router.get('/list', packagesController.listPackages);
router.get('/billingPackages', packagesController.getBillingPackages);
router.post('/adminPackage', packagesController.saveAdminPackages);
router.put('/adminPackage', packagesController.updateAdminPackages);

router.get('/listBillingPlans', packagesController.listBillingPlans);
router.get('/createBillingPlans', packagesController.createBillingPlans);
router.get('/billingSuccess', packagesController.billingSuccess);
router.get('/billingCancel', packagesController.billingCancel);
module.exports = router;