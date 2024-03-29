var express = require('express');
var router = express.Router();

const mainController = require('../controllers/en/main-controller');
const tnController = require('../controllers/en/tn-controller');
const mpController = require('../controllers/en/mp-controller');
const shController = require('../controllers/en/sh-controller');
const dtController = require('../controllers/en/dt-controller');
const woController = require('../controllers/en/wo-controller');

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


//LOS DE AUTH EN DIFERENTES IDIOMAS DEBERIAMOS SACARALO DE ACA

/* Tiendanube */
router.get('/tiendanube', tnController.tnHome);
router.get('/tiendanube/config', tnController.configuration);
router.get('/tiendanube/documentation', tnController.documentation);
router.get('/tiendanube/premium',tnController.getPremium)  //hacerlo con todos los planes


/* Drive to Tiendanube */
router.get('/drive-to-tiendanube', dtController.dtHome); 
router.get('/drive-to-tiendanube/config',dtController.configuration) 
router.get('/drive-to-tiendanube/documentation',dtController.documentation) 


/* Mercado Pago */
router.get('/mercadopago', mpController.mpHome);
router.get('/mercadopago/config', mpController.configuration); 
router.get('/mercadopago/documentation', mpController.documentation); 

/* Shopify */
router.get('/shopify', shController.shHome);
router.get('/shopify/config', shController.configuration);
router.get('/shopify/documentation', shController.documentation);

/* Woocommerce */
router.get('/woocommerce', woController.woHome);
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
