var express = require('express');
var router = express.Router();

const mainController = require('../controllers/main-controller');
const mpController = require('../controllers/mp-controller');

/* Tienda Nube */
router.get('/', mainController.tiendaNubeHome);
router.get('/instrucciones', mainController.instrucciones);
router.get('/oauth',mainController.tn_oauth)

/* Mercado Pago */
router.get('/mercadopago', mpController.mpHome);
router.get('/mp-oauth', mpController.mp_oauth);


/* Future new home page. */
router.get('/home', mainController.home);
router.get('/pricing', mainController.pricing);


/* Contacto. */
router.get('/contacto', mainController.contacto);

/* Legales. */
router.get('/privacy-policy', mainController.privacy);
router.get('/terms-and-conditions', mainController.terms);


/* PUBLIC APIS*/
router.get('/getAccessToken/:Id', mainController.getToken) //deprecar en el futuro
router.get('/tn/getAccessToken/:Id', mainController.getToken)
router.get('/mp/getAccessToken/:Id', mainController.getTokenMP)
router.get('/store_id', mainController.getStore)


/* GOOGLE AUTH DATA */
//router.post('/google-auth',mainController.googleoauth)

/* GOOGLE AUTH DATA 2 */
//router.get('/google',mainController.google)
//router.get('/authenticate',mainController.authenticate)



module.exports = router;
