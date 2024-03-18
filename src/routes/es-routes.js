var express = require('express');
var router = express.Router();

const mainController = require('../controllers/es/main-controller');

// Apps controllers
const tnController = require('../controllers/es/tn-controller');
const mpController = require('../controllers/es/mp-controller');
const shController = require('../controllers/es/sh-controller');
const dtController = require('../controllers/es/dt-controller');
const woController = require('../controllers/es/wo-controller');

// Middlewares
const checkAuth = require('../middlewares/check-auth');
const generalMid = require('../middlewares/general-mid');

const googleController = require('../controllers/google-controller');

/**
 * Nomenclatura general:
 * TODOOO kebab-case
 * /tiendanube/ -> Esto indica el servicio que vamos a invocar
 * /tiendanube/oauth -> Este es el redirect url a usar para cada servicio
 * /tiendanube -> La home del servicio
 * /tiendanube/config -> las instrucciones y ahi mostramos el token. A futuro puede estar todo englobado en un mismo servicio.
 * /tiendanube/documentation -> Documentacion del servicio
 * /tiendanube/documentation -> Documentacion del servicio

/* HOME . */
router.get('/', generalMid, mainController.home); 
router.get('/documentation', mainController.documentation); 
router.get('/account',generalMid,mainController.account);



/* Tiendanube */
router.get('/tiendanube',generalMid, tnController.tnHome);
router.get('/tiendanube/config', generalMid, tnController.configuration);
router.get('/tiendanube/documentation', tnController.documentation);
router.get('/tiendanube/oauth',generalMid,tnController.tnOauth) 
router.get('/tiendanube/premium',generalMid,tnController.getPremium)  //hacerlo con todos los planes
router.get('/tiendanube/sheet',generalMid,tnController.getSheet)  //TODO hacerlo con todos los planes para que te redirija al sheet. 
router.post('/tiendanube/uninstalled', tnController.appUninstalled)
router.post('/tn/uninstalled', tnController.appUninstalled) //TODO deprecar, cambiarle la url a todos

/* Tiendanube usando connId */
router.get('/tiendanube/:connId/config', generalMid, checkAuth.checkTN, tnController.configuration2)

/* Tiendanube usando Middlewares */
router.get('/tiendanube/error2',generalMid, tnController.tnHome)

/* Drive to Tiendanube */
router.get('/drive-to-tiendanube',generalMid, dtController.dtHome); 
router.get('/drive-to-tiendanube/config',generalMid,dtController.configuration) 
router.get('/drive-to-tiendanube/documentation',dtController.documentation) 
router.get('/drive-to-tiendanube/oauth',generalMid,dtController.dtOauth) 
router.post('/drive-to-tiendanube/uninstalled', dtController.appUninstalled)

router.get('/drive-to-tiendanube/:connId/config', generalMid, checkAuth.checkDT, dtController.configuration2)


/* Mercado Pago */
router.get('/mercadopago', generalMid, mpController.mpHome);
router.get('/mercadopago/config', generalMid, mpController.configuration); 
router.get('/mercadopago/oauth',generalMid, mpController.mpOauth);
router.get('/mercadopago/documentation', mpController.documentation); 
router.post('/mercadopago/uninstalled', mpController.appUninstalled)

/* Shopify */
router.get('/shopify', generalMid, shController.shHome);
router.get('/shopify/config', generalMid, shController.configuration);
router.get('/sh-oauth',generalMid, shController.verifyRequest);
router.get('/shopify/oauth',generalMid, shController.shOauth)
router.get('/shopify/documentation', shController.documentation);

/* Woocommerce */
router.get('/woocommerce', generalMid, woController.woHome);
router.get('/woocommerce/config', generalMid, woController.configuration);
router.get('/woocommerce/oauth',generalMid, woController.woRedirect)
router.post('/woocommerce/oauth',generalMid, woController.woOauth)
router.get('/woocommerce/documentation', woController.documentation);


/* GOOGLE AUTH DATA */
router.post('/google-auth',googleController.googleoauth)

/* Contacto. */
router.get('/contacto',generalMid, mainController.contacto);
router.get('/whatsapp',generalMid, mainController.whatsapp);

/* Legales. */
router.get('/privacy-policy', generalMid, mainController.privacy);
router.get('/terms-and-conditions', generalMid, mainController.terms);



module.exports = router;
