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
 * Helper function to extract session token from Authorization header
 */
function getSessionTokenFromHeader(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;

  const token = authHeader.replace('Bearer ', '').trim();
  return token !== authHeader ? token : null;
}

/**
 * Helper function to extract session token from URL parameter
 * Shopify adds id_token when initially loading your app
 */
function getSessionTokenFromUrlParam(req) {
  return req.query.id_token || null;
}

/**
 * Middleware to verify Shopify session tokens
 * This middleware validates JWT tokens sent from the Shopify embedded app
 * Based on Shopify's official documentation for session tokens
 *
 * Token sources (in order of preference):
 * 1. Authorization header (App Bridge adds this automatically)
 * 2. URL parameter 'id_token' (Shopify adds this on initial load)
 */
const verifySessionToken = async (req, res, next) => {
  try {
    // Try to get token from header first, then URL parameter
    let token = getSessionTokenFromHeader(req) || getSessionTokenFromUrlParam(req);

    if (!token) {
      console.log('[Session Token] No token found in header or URL parameters');

      // Check if this is a document request (initial page load vs XHR)
      const isDocumentRequest = !req.headers.authorization &&
                               req.headers.accept &&
                               req.headers.accept.includes('text/html');

      if (isDocumentRequest) {
        // For document requests, redirect to session token bounce page
        console.log('[Session Token] Document request without token, redirecting to bounce page');
        return res.redirect(`/shopify/session-token-bounce?${new URLSearchParams(req.query).toString()}`);
      }

      return res.status(401).json({
        error: 'Unauthorized',
        message: 'No authorization token provided'
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

      // Check if this is a document request
      const isDocumentRequest = !req.headers.authorization &&
                               req.headers.accept &&
                               req.headers.accept.includes('text/html');

      if (isDocumentRequest) {
        // For document requests, redirect to session token bounce page
        console.log('[Session Token] Invalid token on document request, redirecting to bounce page');
        return res.redirect(`/shopify/session-token-bounce?${new URLSearchParams(req.query).toString()}`);
      }

      // For XHR/fetch requests, tell App Bridge to retry with a new token
      res.setHeader('X-Shopify-Retry-Invalid-Session-Request', '1');

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
