var express = require('express');
var router = express.Router();

const apiController = require('../controllers/api-controller');
const paymentsController = require('../controllers/payments-controller');
const googleController = require('../controllers/google-controller');
const mpController = require('../controllers/es/mp-controller');

// Middlewares
const checkAuth = require('../middlewares/check-auth');
const generalMid = require('../middlewares/general-mid');
const { verifySessionToken } = require('../middlewares/verify-session-token');

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

/* SHOPIFY SESSION TOKEN PROTECTED APIS */
// Example protected endpoint - get shop data using session token
router.get('/shopify/shop-data', verifySessionToken, (req, res) => {
  try {
    // req.shopify contains: shop, sessionId, userId, token
    res.json({
      success: true,
      shop: req.shopify.shop,
      message: 'Session token verified successfully'
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

// Example protected endpoint - update configuration using session token
router.post('/shopify/update-config', verifySessionToken, async (req, res) => {
  try {
    // req.shopify contains: shop, sessionId, userId, token
    const { shop } = req.shopify;
    const configData = req.body;

    console.log(`Updating configuration for shop: ${shop}`);
    console.log('Configuration data:', configData);

    // Here you would typically update your database with the configuration
    // For now, just return success
    res.json({
      success: true,
      message: 'Configuration updated successfully',
      shop: shop
    });
  } catch (error) {
    res.status(500).json({
      error: 'Internal Server Error',
      message: error.message
    });
  }
});

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
