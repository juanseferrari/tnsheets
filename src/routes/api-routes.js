var express = require('express');
var router = express.Router();

const apiController = require('../controllers/api-controller');

/* GET home page. */
router.get('/viajes', apiController.viajes);

router.get('/equipamiento', apiController.equipamiento);

module.exports = router;
