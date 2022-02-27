var express = require('express');
var router = express.Router();

const mainController = require('../controllers/main-controller');

/* GET home page. */
router.get('/', mainController.home);


router.get('/equipamiento', mainController.equipamiento);

router.get('/contacto', mainController.contacto);

router.get('/travesias', mainController.travesias);

router.get('/login', mainController.login);










module.exports = router;
