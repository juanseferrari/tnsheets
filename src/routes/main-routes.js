var express = require('express');
var router = express.Router();

const mainController = require('../controllers/main-controller');

/* GET home page. */
router.get('/', mainController.home);

router.get('/contacto', mainController.contacto);

router.get('/instrucciones', mainController.instrucciones);

router.get('/instructivo', mainController.instructivo);


/* AUTH DATA */

router.get('/oauth',mainController.oauth)
router.get('/getAccessToken/:Id', mainController.getToken)
router.get('/store_id', mainController.getStore)









module.exports = router;
