var express = require('express');
var router = express.Router();

const apiController = require('../controllers/api-controller');
const paymentsController = require('../controllers/payments-controller');
const googleController = require('../controllers/google-controller');
const mpController = require('../controllers/es/mp-controller');

// Middlewares
const checkAuth = require('../middlewares/check-auth');
const generalMid = require('../middlewares/general-mid');

/* PUBLIC APIS*/
//tienen que ser kebab-case
router.post('/webhook-connection', apiController.webhookConnection)
router.post('/sheet-configuration', apiController.sheetConfiguration)
router.post('/sheet-logs', apiController.sheetLogs) //API for logging user data.

/* STRIPE APIS*/
//notificaciones de stripe
router.post('/payment-webhooks', paymentsController.notificationController)
router.get('/subscription-status', paymentsController.checkSubscription)
router.post('/redeem-payment', paymentsController.redeemPayment)

/* MERCADO PAGO APIS*/
router.post('/mercadopago/webhooks', mpController.mpWebooks)
router.post('/mercadopago/payment-webhooks', mpController.mpPaymentWebooks)

/* GOOGLE AUTH DATA */
router.post('/google-auth',generalMid,googleController.googleoauth)

//router.get('/google-login',googleController.googleLink)

router.use((req, res, next) => {
    let message = {
        "error": {
          "type": "URL_NOT_FOUND",
          "message": "The API you are trying to access does not exist."
        }
      }
    res.status(404).json(message)
  })

module.exports = router;
