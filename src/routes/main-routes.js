var express = require('express');
var router = express.Router();

const mainController = require('../controllers/main-controller');
const tnController = require('../controllers/tn-controller');
const mpController = require('../controllers/mp-controller');
const paymentsController = require('../controllers/payments-controller');
const googleController = require('../controllers/google-controller');
const shController = require('../controllers/sh-controller');
const dtController = require('../controllers/dt-controller');
const woController = require('../controllers/wo-controller');

//a futuro un controller por servicio

/**
 * Nomenclatura general:
 * TODOOO kebab-case
 * TODOOO en ingles las urls
 * /tiendanube/ -> Esto indica el servicio que vamos a invocar
 * /tn/oauth -> Este es el redirect url a usar para cada servicio
 * /tn -> La home del servicio
 * /tn/instructions -> las instrucciones y ahi mostramos el token. A futuro puede estar todo englobado en un mismo servicio.
 * /api -> Apis publicas de sheets central. A futuro podemos hacer como una api que te devuelva los tokens.


/* Tiendanube */
router.get('/', tnController.tnHome); //deberia ser /tiendanube cuando tengamos la nueva home 
router.get('/tiendanube', tnController.tnHome);
router.get('/tiendanube/config', tnController.configuration);
router.get('/tiendanube/documentation', tnController.documentation);
router.get('/tiendanube/oauth',tnController.tnOauth) 
router.get('/tiendanube/premium',tnController.getPremium)  //hacerlo con todos los planes
router.get('/tiendanube/sheet',tnController.getSheet)  //TODO hacerlo con todos los planes para que te redirija al sheet. 


/* Drive to Tiendanube */
router.get('/drive-to-tiendanube', dtController.dtHome); 
router.get('/drive-to-tiendanube/oauth',dtController.dtOauth) 
router.get('/drive-to-tiendanube/documentation',dtController.documentation) 
router.get('/drive-to-tiendanube/config',dtController.configuration) //migrarlo


/* Mercado Pago */
router.get('/mercadopago', mpController.mpHome);
router.get('/mp-oauth', mpController.mpOauth); //todo a futuro que sea /mercadopago/oauth
router.get('/mercadopago/config', mpController.configuration); 

/* Shopify */
router.get('/shopify', shController.shHome);
router.get('/sh-oauth', shController.verifyRequest);
router.get('/shopify/oauth', shController.shOauth)
router.get('/shopify/config', shController.configuration);

/* Woocommerce */
router.get('/woocommerce', woController.woHome);
router.get('/woocommerce/oauth', woController.woRedirect)
router.post('/woocommerce/oauth', woController.woOauth)
router.get('/woocommerce/config', woController.configuration);

/* Future new home page. */
router.get('/home', mainController.home);
router.get('/pricing', mainController.pricing);
router.get('/error',mainController.errorPage)


/* Contacto. */
router.get('/contacto', mainController.contacto);

/* Legales. */
router.get('/privacy-policy', mainController.privacy);
router.get('/terms-and-conditions', mainController.terms);


/* PUBLIC APIS*/
//tienen que ser kebab-case
router.post('/tn/get-token', tnController.getTokenTN) //sheet-configuration -> esta funcion deberia ser la misma para todos los sheets usados.
router.get('/mp/getAccessToken/:Id', mpController.getTokenMP) //migrar a POST y que sea mp/get-token
router.post('/webhook-connection', mainController.webhookConnection)
router.post('/tn/uninstalled', mainController.appUninstalled)
router.post('/get-token', mainController.getTokenGeneric)

/* STRIPE APIS*/
//notificaciones de stripe
router.post('/payment-webhooks', paymentsController.notificationController)
router.get('/subscription-status', paymentsController.checkSubscription)


/* GOOGLE AUTH DATA */
router.post('/google-auth',googleController.googleoauth)
router.get('/google-auth',tnController.tnHome) //google login viejo, sacar
//router.get('/google-login',googleController.googleLink)


module.exports = router;
