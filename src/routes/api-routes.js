var express = require('express');
var router = express.Router();

const apiController = require('../controllers/api-controller');
const paymentsController = require('../controllers/payments-controller');
const googleController = require('../controllers/google-controller');


/* PUBLIC APIS*/
//tienen que ser kebab-case
router.post('/webhook-connection', apiController.webhookConnection)
router.post('/sheet-configuration', apiController.sheetConfiguration)

/* STRIPE APIS*/
//notificaciones de stripe
router.post('/payment-webhooks', paymentsController.notificationController)
router.get('/subscription-status', paymentsController.checkSubscription)

/* GOOGLE AUTH DATA */
router.post('/google-auth',googleController.googleoauth)
//router.get('/google-login',googleController.googleLink)


module.exports = router;
