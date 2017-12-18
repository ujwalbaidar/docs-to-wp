const express = require('express');
const exportsController = require('./exports.controller');
const router = express.Router();

router.get('/listExports', exportsController.getExportLists);
router.post('/exportDocToWp', exportsController.exportDocToWp);

module.exports = router;