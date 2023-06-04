var express = require('express');
var router = express.Router();

const mainController = require('../controllers/main-controller');
const mpController = require('../controllers/mp-controller');
const paymentsController = require('../controllers/payments-controller');

/* Tienda Nube */
router.get('/', mainController.tiendaNubeHome);
router.get('/instrucciones', mainController.instrucciones);
router.get('/oauth',mainController.tnOauth)
router.get('/error',mainController.errorPage)


/* Mercado Pago */
router.get('/mercadopago', mpController.mpHome);
router.get('/mp-oauth', mpController.mpOauth);


/* Future new home page. */
router.get('/home', mainController.home);
router.get('/pricing', mainController.pricing);


/* Contacto. */
router.get('/contacto', mainController.contacto);

/* Legales. */
router.get('/privacy-policy', mainController.privacy);
router.get('/terms-and-conditions', mainController.terms);


/* PUBLIC APIS*/
//tienen que ser kebab-case
router.get('/getAccessToken/:Id', mainController.getTokenTN) //deprecar en el futuro
router.get('/tn/getAccessToken/:Id', mainController.getTokenTN)
router.post('/tn/getAccessToken', mainController.getTokenTN2) //sheet-configuration
router.get('/mp/getAccessToken/:Id', mainController.getTokenMP)

/* STRIPE APIS*/
//notificaciones de stripe
router.post('/payment-webhooks', paymentsController.notificationController)
router.get('/subscription-status', paymentsController.checkSubscription)

/* GOOGLE AUTH DATA */
//router.post('/google-auth',mainController.googleoauth)

/* GOOGLE AUTH DATA 2 */
//router.get('/google',mainController.google)
//router.get('/authenticate',mainController.authenticate)



module.exports = router;
