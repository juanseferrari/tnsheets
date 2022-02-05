var express = require('express');
var router = express.Router();

const mainController = require('../controllers/main-controller');


router.get('/', mainController.viajes);

router.get('/bariloche', mainController.bariloche);








module.exports = router;
