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

/* Legales. */
router.get('/privacy-policy', mainController.privacy);
router.get('/terms-and-conditions', mainController.terms);


/* AUTH DATA */

router.get('/oauth',mainController.oauth)
router.get('/getAccessToken/:Id', mainController.getToken)
router.get('/store_id', mainController.getStore)

/* GOOGLE AUTH DATA */
router.post('/google-auth',mainController.googleoauth)









module.exports = router;
