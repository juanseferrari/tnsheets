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
const { tokenExchangeMiddleware } = require('../services/shopify-token-exchange');

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
router.get('/shopify/shop-data', verifySessionToken, tokenExchangeMiddleware, (req, res) => {
  try {
    // req.shopify contains: shop, sessionId, userId, token, exchangeForAccessToken()
    res.json({
      success: true,
      shop: req.shopify.shop,
      userId: req.shopify.userId,
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
router.post('/shopify/update-config', verifySessionToken, tokenExchangeMiddleware, async (req, res) => {
  try {
    // req.shopify contains: shop, sessionId, userId, token, exchangeForAccessToken()
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

// Example endpoint demonstrating token exchange for Shopify API access
router.post('/shopify/get-access-token', verifySessionToken, tokenExchangeMiddleware, async (req, res) => {
  try {
    const { shop } = req.shopify;

    console.log(`[Token Exchange API] Exchanging token for shop: ${shop}`);

    // Exchange session token for access token
    // This token can be used to make Shopify Admin API calls
    const accessTokenResponse = await req.shopify.exchangeForAccessToken();

    console.log('[Token Exchange API] Successfully obtained access token');

    // In a real application, you would store this access token in your database
    // associated with the shop and use it for subsequent Shopify API calls

    res.json({
      success: true,
      shop: shop,
      message: 'Access token obtained successfully',
      tokenInfo: {
        expiresIn: accessTokenResponse.expires_in || 'never (offline token)',
        hasUserInfo: !!accessTokenResponse.associated_user,
        scopes: accessTokenResponse.scope
      }
      // NOTE: Never send the actual access token to the frontend
      // Store it securely in your backend database
    });
  } catch (error) {
    console.error('[Token Exchange API] Error:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to exchange token',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
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
