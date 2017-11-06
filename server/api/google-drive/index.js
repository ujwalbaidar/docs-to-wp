const express = require('express');
const googleDriveController = require('./googleDrive.controller');
const router = express.Router();

router.get('/listFiles', googleDriveController.listDriveFiles);
router.get('/viewFile', googleDriveController.viewDriveFile);
module.exports = router;