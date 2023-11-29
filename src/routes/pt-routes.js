var express = require('express');
var router = express.Router();

const mainController = require('../controllers/pt/main-controller');
const tnController = require('../controllers/pt/tn-controller');
const mpController = require('../controllers/pt/mp-controller');
const shController = require('../controllers/pt/sh-controller');
const dtController = require('../controllers/pt/dt-controller');
const woController = require('../controllers/pt/wo-controller');

//a futuro un controller por servicio

/**
 * Nomenclatura general:
 * TODOOO kebab-case
 * /tiendanube/ -> Esto indica el servicio que vamos a invocar
 * /tiendanube/oauth -> Este es el redirect url a usar para cada servicio
 * /tiendanube -> La home del servicio
 * /tiendanube/config -> las instrucciones y ahi mostramos el token. A futuro puede estar todo englobado en un mismo servicio.
 * /tiendanube/documentation -> Documentacion del servicio
 * /tiendanube/documentation -> Documentacion del servicio



/* Tiendanube */
router.get('/tiendanube', tnController.tnHome);
router.get('/tiendanube/config', tnController.configuration);
router.get('/tiendanube/documentation', tnController.documentation);
router.get('/tiendanube/oauth',tnController.tnOauth) 
router.get('/tiendanube/premium',tnController.getPremium)  //hacerlo con todos los planes
router.get('/tiendanube/sheet',tnController.getSheet)  //TODO hacerlo con todos los planes para que te redirija al sheet. 
router.post('/tn/uninstalled', tnController.appUninstalled)


/* Drive to Tiendanube */
router.get('/drive-to-tiendanube', dtController.dtHome); 
router.get('/drive-to-tiendanube/oauth',dtController.dtOauth) 
router.get('/drive-to-tiendanube/config',dtController.configuration) 
router.get('/drive-to-tiendanube/documentation',dtController.documentation) 


/* Mercado Pago */
router.get('/mercadopago', mpController.mpHome);
router.get('/mp-oauth', mpController.mpOauth); //todo a futuro que sea /mercadopago/oauth
router.get('/mercadopago/config', mpController.configuration); 
router.get('/mercadopago/documentation', mpController.documentation); 

/* Shopify */
router.get('/shopify', shController.shHome);
router.get('/sh-oauth', shController.verifyRequest);
router.get('/shopify/oauth', shController.shOauth)
router.get('/shopify/config', shController.configuration);
router.get('/shopify/documentation', shController.documentation);

/* Woocommerce */
router.get('/woocommerce', woController.woHome);
router.get('/woocommerce/oauth', woController.woRedirect)
router.post('/woocommerce/oauth', woController.woOauth)
router.get('/woocommerce/config', woController.configuration);
router.get('/woocommerce/documentation', woController.documentation);

/* Future new home page. */
router.get('/', mainController.home); 
router.get('/home', mainController.home);
router.get('/documentation', mainController.documentation); 
router.get('/account',mainController.account);


/* Contacto. */
router.get('/contacto', mainController.contacto);

/* Legales. */
router.get('/privacy-policy', mainController.privacy);
router.get('/terms-and-conditions', mainController.terms);


module.exports = router;
