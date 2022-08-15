var express = require('express');
var router = express.Router();

const apiController = require('../controllers/api-controller');

/* GET home page. */
router.get('/viajes', apiController.viajes);

router.get('/equipamiento', apiController.equipamiento);

router.get('/mongousers/:userId', apiController.mongousers);

router.get('/mongo/check', apiController.mongouserscheck);


module.exports = router;
