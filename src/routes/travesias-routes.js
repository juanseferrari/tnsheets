var express = require('express');
var router = express.Router();

const travesiasController = require('../controllers/travesias-controller');


router.get('/info', travesiasController.travesias);

router.get('/laguna-negra', travesiasController.lagunanegra);

router.get('/laguna-cab', travesiasController.lagunacab);





module.exports = router;
