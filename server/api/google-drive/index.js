const express = require('express');
const googleDriveController = require('./googleDrive.controller');
const router = express.Router();

router.get('/listFiles', googleDriveController.listDriveFiles);
router.post('/exportDriveFile', googleDriveController.exportDriveFile);
// router.get('/viewFile', googleDriveController.viewDriveFile);
module.exports = router;