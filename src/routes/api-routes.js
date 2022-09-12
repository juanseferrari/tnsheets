var express = require('express');
var router = express.Router();

const apiController = require('../controllers/api-controller');

/* GET home page. */
router.get('/viajes', apiController.viajes);

router.get('/equipamiento', apiController.equipamiento);

router.get('/mongousers/:userId', apiController.getData);

/* AUTH DATA */

router.get('/oauth',apiController.oauth)
router.get('/getAccessToken/:mongoId', apiController.getToken)

/* MONGO DATA */

router.post('/mongousers', apiController.addmongouser);

router.get('/mongo/check', apiController.mongouserscheck);


module.exports = router;
