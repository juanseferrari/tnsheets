const { shopifyApi, ApiVersion } = require('@shopify/shopify-api');
const { MemorySessionStorage } = require('@shopify/shopify-app-session-storage-memory');

// Shopify credentials
const sh_client_id = process.env.SH_CLIENT_ID;
const sh_client_secret = process.env.SH_CLIENT_SECRET;
const scopes = 'read_products,write_products,read_customers,read_orders,read_inventory,write_inventory';
const host = process.env.HOST || 'http://localhost:5001';

// Initialize Shopify API with session storage
const shopify = shopifyApi({
  apiKey: sh_client_id,
  apiSecretKey: sh_client_secret,
  scopes: scopes.split(','),
  hostName: host.replace(/https?:\/\//, ''),
  apiVersion: ApiVersion.October24, // Use explicit API version
  isEmbeddedApp: true,
  sessionStorage: new MemorySessionStorage(),
});

/**
 * Middleware to verify Shopify session tokens
 * This middleware validates JWT tokens sent from the Shopify embedded app
 * Based on Shopify's official documentation for session tokens
 */
const verifySessionToken = async (req, res, next) => {
  try {
    // Get the authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      console.log('[Session Token] No authorization header found');
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No authorization token provided'
      });
    }

    // Extract the token (format: "Bearer <token>")
    const token = authHeader.replace('Bearer ', '').trim();

    if (!token || token === authHeader) {
      console.log('[Session Token] No token found in authorization header');
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid authorization format. Expected: Bearer <token>'
      });
    }

    console.log('[Session Token] Attempting to decode token...');
    console.log('[Session Token] Token length:', token.length);

    // Verify the session token using Shopify's API
    try {
      // The decodeSessionToken method validates the signature and expiration
      const payload = await shopify.session.decodeSessionToken(token);

      // The payload contains:
      // - dest: shop domain (e.g., "https://example.myshopify.com")
      // - aud: API key (your app's client ID)
      // - sub: user ID
      // - exp: expiration timestamp (Unix timestamp)
      // - nbf: not before timestamp
      // - iat: issued at timestamp
      // - iss: issuer (shop admin domain)
      // - jti: JWT ID
      // - sid: session ID

      console.log('[Session Token] Token verified successfully');
      console.log('[Session Token] Payload:', {
        dest: payload.dest,
        iss: payload.iss,
        sub: payload.sub,
        sid: payload.sid,
        exp: new Date(payload.exp * 1000).toISOString()
      });

      // Extract shop domain from dest (remove https://)
      const shopDomain = payload.dest.replace('https://', '').replace('http://', '');

      // Attach shop information to the request for use in controllers
      req.shopify = {
        shop: shopDomain,
        sessionId: payload.sid,
        userId: payload.sub,
        token: token,
        payload: payload
      };

      next();

    } catch (decodeError) {
      console.error('[Session Token] Error decoding session token:', decodeError);
      console.error('[Session Token] Error details:', decodeError.message);

      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid or expired session token',
        details: process.env.NODE_ENV === 'development' ? decodeError.message : undefined
      });
    }

  } catch (error) {
    console.error('[Session Token] Unexpected error in session token verification:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Error verifying session token',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = { verifySessionToken, shopify };
