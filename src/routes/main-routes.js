var express = require('express');
var router = express.Router();

const mainController = require('../controllers/main-controller');

/* GET home page. */
router.get('/', mainController.home);

router.get('/viajes', mainController.viajes);

router.get('/travesias', mainController.travesias);

router.get('/equipamiento', mainController.equipamiento);

router.get('/contacto', mainController.contacto);




module.exports = router;
