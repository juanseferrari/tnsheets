var express = require('express');
var router = express.Router();

const mainController = require('../controllers/main-controller');
const mpController = require('../controllers/mp-controller');
const paymentsController = require('../controllers/payments-controller');
const googleController = require('../controllers/google-controller');
//a futuro un controller por servicio

/**
 * Nomenclatura general:
 * TODOOO kebab-case
 * TODOOO en ingles las urls
 * /tn/ -> Esto indica el servicio que vamos a invocar
 * /tn/oauth -> Este es el redirect url a usar para cada servicio
 * /tn -> La home del servicio
 * /tn/instructions -> las instrucciones y ahi mostramos el token. A futuro puede estar todo englobado en un mismo servicio.
 * /api -> Apis publicas de sheets central. A futuro podemos hacer como una api que te devuelva los tokens.
 * 

/* Tienda Nube */
/** A futuro que sea /tn/xxx */
// pasar a tnController
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
router.post('/tn/get-token', mainController.getTokenTN) //sheet-configuration -> esta funcion deberia ser la misma para todos los sheets usados.
router.get('/mp/getAccessToken/:Id', mpController.getTokenMP) //migrar a POST
router.post('/webhook-connection', mainController.webhookConnection)
router.post('/tn/uninstalled', mainController.appUninstalled)


/* STRIPE APIS*/
//notificaciones de stripe
router.post('/payment-webhooks', paymentsController.notificationController)
router.get('/subscription-status', paymentsController.checkSubscription)


/* GOOGLE AUTH DATA */
router.post('/google-auth',googleController.googleoauth)
router.get('/google-auth',mainController.tiendaNubeHome)



module.exports = router;
