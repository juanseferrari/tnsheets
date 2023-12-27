var express = require('express');
var router = express.Router();

const apiController = require('../controllers/api-controller');
const paymentsController = require('../controllers/payments-controller');
const googleController = require('../controllers/google-controller');


/* PUBLIC APIS*/
//tienen que ser kebab-case
router.post('/webhook-connection', apiController.webhookConnection)
router.post('/sheet-configuration', apiController.sheetConfiguration)
router.post('/sheet-log', apiController.sheetLog)

/* STRIPE APIS*/
//notificaciones de stripe
router.post('/payment-webhooks', paymentsController.notificationController)
router.get('/subscription-status', paymentsController.checkSubscription)
router.post('/redeem-payment', paymentsController.redeemPayment)

/* GOOGLE AUTH DATA */
router.post('/google-auth',googleController.googleoauth)
router.post('/google-auth2',googleController.googleoauth2)

//router.get('/google-login',googleController.googleLink)


module.exports = router;
