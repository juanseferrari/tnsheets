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
 */
const verifySessionToken = async (req, res, next) => {
  try {
    // Get the authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      console.log('No authorization header found');
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No authorization token provided'
      });
    }

    // Extract the token (format: "Bearer <token>")
    const token = authHeader.replace('Bearer ', '');

    if (!token) {
      console.log('No token found in authorization header');
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid authorization format'
      });
    }

    // Verify the session token
    try {
      const payload = await shopify.session.decodeSessionToken(token);

      // The payload contains:
      // - dest: shop domain (e.g., "example.myshopify.com")
      // - aud: API key
      // - sub: user ID
      // - exp: expiration timestamp
      // - nbf: not before timestamp
      // - iat: issued at timestamp
      // - jti: JWT ID
      // - sid: session ID

      console.log('Session token verified successfully');
      console.log('Shop:', payload.dest);
      console.log('Session ID:', payload.sid);

      // Attach shop information to the request for use in controllers
      req.shopify = {
        shop: payload.dest.replace('https://', ''),
        sessionId: payload.sid,
        userId: payload.sub,
        token: token
      };

      next();

    } catch (decodeError) {
      console.error('Error decoding session token:', decodeError);
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid session token',
        details: decodeError.message
      });
    }

  } catch (error) {
    console.error('Error in session token verification:', error);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Error verifying session token'
    });
  }
};

module.exports = { verifySessionToken, shopify };
