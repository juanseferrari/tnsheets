var express = require('express');
var router = express.Router();

const mainController = require('../controllers/main-controller');

/* GET home page. */
router.get('/', mainController.home);

router.get('/contacto', mainController.contacto);

router.get('/login', mainController.login);


/* AUTH DATA */

router.get('/oauth',mainController.oauth)
router.get('/getAccessToken/:mongoId', mainController.getToken)








module.exports = router;
