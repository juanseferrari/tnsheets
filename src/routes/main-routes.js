var express = require('express');
var router = express.Router();

const mainController = require('../controllers/main-controller');

/* Tienda Nube */
router.get('/', mainController.tiendaNubeHome);
router.get('/instrucciones', mainController.instrucciones);

/* Future new home page. */

/*router.get('/home', mainController.home);**/
router.get('/pricing', mainController.pricing);


/* Contacto. */
router.get('/contacto', mainController.contacto);



/* AUTH DATA */

router.get('/oauth',mainController.oauth)
router.get('/getAccessToken/:Id', mainController.getToken)
router.get('/store_id', mainController.getStore)









module.exports = router;
