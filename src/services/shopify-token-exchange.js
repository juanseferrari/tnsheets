const { shopify } = require('../middlewares/verify-session-token');

/**
 * Shopify Token Exchange Service
 * ===============================
 *
 * Session tokens are for authentication only and cannot be used to make
 * Shopify API requests. This service exchanges session tokens for access tokens
 * that can be used to call Shopify's Admin API.
 *
 * Best Practices:
 * - Don't exchange tokens on every request (affects performance)
 * - Check for valid access token in storage before exchanging
 * - Store access tokens after exchange for reuse
 */

/**
 * Token types for token exchange
 */
const RequestedTokenType = {
  OnlineAccessToken: 'urn:shopify:params:oauth:token-type:online-access-token',
  OfflineAccessToken: 'urn:shopify:params:oauth:token-type:offline-access-token',
};

/**
 * Exchange a session token for an access token
 *
 * @param {string} shop - The shop domain (e.g., "example.myshopify.com")
 * @param {string} sessionToken - The encoded session token from App Bridge
 * @param {string} tokenType - Type of token to request (online or offline)
 * @returns {Promise<Object>} Access token response
 *
 * Response format:
 * {
 *   access_token: "shpat_xxxxx",
 *   scope: "read_products,write_products,...",
 *   expires_in: 86400, // For online tokens only
 *   associated_user_scope: "read_products,...", // For online tokens only
 *   associated_user: { // For online tokens only
 *     id: 123456,
 *     first_name: "John",
 *     last_name: "Doe",
 *     email: "john@example.com",
 *     account_owner: true,
 *     locale: "en",
 *     collaborator: false
 *   }
 * }
 */
async function exchangeSessionTokenForAccessToken(shop, sessionToken, tokenType = RequestedTokenType.OnlineAccessToken) {
  try {
    console.log('[Token Exchange] Exchanging session token for access token');
    console.log('[Token Exchange] Shop:', shop);
    console.log('[Token Exchange] Token Type:', tokenType);

    // Use Shopify's token exchange API
    const accessToken = await shopify.auth.tokenExchange({
      shop,
      sessionToken: sessionToken,
      requestedTokenType: tokenType,
    });

    console.log('[Token Exchange] Successfully exchanged token');
    console.log('[Token Exchange] Token expires in:', accessToken.expires_in || 'never (offline token)');

    return accessToken;

  } catch (error) {
    console.error('[Token Exchange] Error exchanging session token:', error);
    throw new Error(`Failed to exchange session token: ${error.message}`);
  }
}

/**
 * Exchange session token for an online access token
 * Online tokens are short-lived (24 hours) and tied to a specific user
 *
 * @param {string} shop - The shop domain
 * @param {string} sessionToken - The session token
 * @returns {Promise<Object>} Access token response with user info
 */
async function getOnlineAccessToken(shop, sessionToken) {
  return exchangeSessionTokenForAccessToken(shop, sessionToken, RequestedTokenType.OnlineAccessToken);
}

/**
 * Exchange session token for an offline access token
 * Offline tokens are long-lived and used for background operations
 *
 * @param {string} shop - The shop domain
 * @param {string} sessionToken - The session token
 * @returns {Promise<Object>} Access token response
 */
async function getOfflineAccessToken(shop, sessionToken) {
  return exchangeSessionTokenForAccessToken(shop, sessionToken, RequestedTokenType.OfflineAccessToken);
}

/**
 * Middleware to add token exchange capability to requests
 * Attaches exchange function to req.shopify for easy use in controllers
 */
function tokenExchangeMiddleware(req, res, next) {
  if (req.shopify && req.shopify.token) {
    // Add convenience method to request object
    req.shopify.exchangeForAccessToken = async (tokenType = RequestedTokenType.OnlineAccessToken) => {
      return exchangeSessionTokenForAccessToken(req.shopify.shop, req.shopify.token, tokenType);
    };
  }
  next();
}

module.exports = {
  exchangeSessionTokenForAccessToken,
  getOnlineAccessToken,
  getOfflineAccessToken,
  tokenExchangeMiddleware,
  RequestedTokenType,
};
