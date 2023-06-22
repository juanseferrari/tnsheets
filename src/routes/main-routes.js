var express = require('express');
var router = express.Router();

const mainController = require('../controllers/main-controller');
const mpController = require('../controllers/mp-controller');
const paymentsController = require('../controllers/payments-controller');
const googleController = require('../controllers/google-controller');

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
router.post('/tn/getAccessToken', mainController.getTokenTN2) //sheet-configuration -> esta funcion deberia ser la misma para todos los sheets usados.
router.get('/mp/getAccessToken/:Id', mpController.getTokenMP)
router.post('/webhook-connection', mainController.webhookConnection)


/* STRIPE APIS*/
//notificaciones de stripe
router.post('/payment-webhooks', paymentsController.notificationController)
router.get('/subscription-status', paymentsController.checkSubscription)


/* GOOGLE AUTH DATA */
//router.post('/google-auth',googleController.googleoauth)

/* GOOGLE AUTH DATA 2 */
//router.get('/google',googleController.google)
//router.get('/authenticate',googleController.authenticate)



module.exports = router;
