/**
 * SHOPIFY SESSION TOKENS MANAGEMENT - COMPREHENSIVE SYSTEM
 * ========================================================
 * 
 * This file provides a complete session token management system for Shopify App Bridge.
 * It's designed to work with the Sheets Central Shopify integration.
 * 
 * INTEGRATION WITH EXISTING CODEBASE:
 * -----------------------------------
 * This session manager works alongside your existing Shopify controller (sh-controller.js) 
 * and middleware (shopify.js). It handles client-side session tokens while your backend
 * handles OAuth flow and access tokens.
 * 
 * CONFIGURATION REQUIRED:
 * ----------------------
 * 1. Update the default configuration with your actual Shopify app credentials:
 *    - apiKey: Your Shopify app's API key (from SH_CLIENT_ID env var)
 *    - shopOrigin: The shop's domain (e.g., 'your-shop.myshopify.com')
 * 
 * 2. Ensure your Shopify app has the required scopes:
 *    - read_products, write_products, read_customers, read_orders, read_inventory, write_inventory
 * 
 * 3. Set up your app in Shopify Partner Dashboard with:
 *    - App URL: https://www.sheetscentral.com/shopify
 *    - Allowed redirection URLs: https://www.sheetscentral.com/shopify/oauth
 * 
 * USAGE EXAMPLES:
 * ---------------
 * 
 * 1. Basic Usage (using default instance):
 *    ```javascript
 *    import { shopifySession } from './sh-session-tokens.js';
 *    
 *    // Get products from Shopify
 *    const products = await shopifySession.get('/admin/api/2023-07/products.json');
 *    
 *    // Create a new product
 *    const newProduct = await shopifySession.post('/admin/api/2023-07/products.json', {
 *       product: { title: 'New Product', body_html: 'Product description' }
 *    });
 *    ```
 * 
 * 2. Custom Configuration:
 *    ```javascript
 *    import { ShopifySessionManager } from './sh-session-tokens.js';
 *    
 *    const customSession = new ShopifySessionManager({
 *       apiKey: 'your-actual-api-key',
 *       shopOrigin: 'your-shop.myshopify.com',
 *       tokenRefreshThreshold: 300000, // 5 minutes
 *       maxRetries: 3
 *    });
 *    ```
 * 
 * 3. Integration with your existing Shopify pages:
 *    ```javascript
 *    // In your shopify.ejs or shopify-login.js
 *    import { shopifySession } from './sh-session-tokens.js';
 *    
 *    // After user authenticates, you can make API calls
 *    async function loadShopData() {
 *       try {
 *           const shopInfo = await shopifySession.get('/admin/api/2023-07/shop.json');
 *           const products = await shopifySession.get('/admin/api/2023-07/products.json');
 *           console.log('Shop:', shopInfo.shop);
 *           console.log('Products:', products.products);
 *       } catch (error) {
 *           console.error('Error loading shop data:', error);
 *       }
 *    }
 *    ```
 * 
 * 4. Error Handling:
 *    ```javascript
 *    import { ShopifySessionUtils } from './sh-session-tokens.js';
 *    
 *    // Check if session is valid
 *    if (!ShopifySessionUtils.isSessionValid()) {
 *       // Redirect to login or show error
 *       window.location.href = '/shopify';
 *    }
 *    
 *    // Get session information
 *    const sessionInfo = ShopifySessionUtils.getSessionInfo();
 *    console.log('Session status:', sessionInfo);
 *    ```
 * 
 * INTEGRATION WITH YOUR ROUTES:
 * -----------------------------
 * This session manager works with your existing routes:
 * - /shopify - Main Shopify page
 * - /shopify/config - Configuration page
 * - /shopify/oauth - OAuth callback
 * - /shopify/protected - Protected route (uses session validation)
 * 
 * The session manager automatically handles:
 * - Token refresh when expired
 * - Retry logic for failed requests
 * - Error handling and logging
 * - Concurrent request management
 * 
 * SECURITY CONSIDERATIONS:
 * ------------------------
 * - Session tokens are automatically validated
 * - Tokens are refreshed before expiry
 * - Failed requests are retried with exponential backoff
 * - Sensitive data is not logged
 * 
 * DEPENDENCIES:
 * -------------
 * - @shopify/app-bridge
 * - @shopify/app-bridge-utils
 * 
 * Make sure these are installed in your package.json
 */

/** SESSION TOKENS DE SHOPIFY - COMPREHENSIVE MANAGEMENT */
import { getSessionToken, validateSessionToken } from '@shopify/app-bridge-utils';
import createApp from '@shopify/app-bridge';

/**
 * Shopify Session Manager Class
 * Handles all aspects of Shopify session token management
 */
class ShopifySessionManager {
  constructor(config = {}) {
    this.config = {
      apiKey: config.apiKey || 'your-api-key',
      shopOrigin: config.shopOrigin || 'your-shop.myshopify.com',
      forceRedirect: config.forceRedirect !== false,
      tokenRefreshThreshold: config.tokenRefreshThreshold || 300000, // 5 minutes
      maxRetries: config.maxRetries || 3,
      retryDelay: config.retryDelay || 1000,
      ...config
    };

    this.app = null;
    this.currentToken = null;
    this.tokenExpiry = null;
    this.isRefreshing = false;
    this.pendingRequests = [];
    this.retryCount = 0;

    this.init();
  }

  /**
   * Initialize the Shopify App Bridge
   * This sets up the connection to Shopify's embedded app framework
   */
  init() {
    try {
      this.app = createApp({
        apiKey: this.config.apiKey,
        shopOrigin: this.config.shopOrigin,
        forceRedirect: this.config.forceRedirect,
      });

      // Set up error handling for App Bridge
      this.app.subscribe('error', (error) => {
        console.error('Shopify App Bridge Error:', error);
        this.handleError(error);
      });

      console.log('Shopify Session Manager initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Shopify Session Manager:', error);
      throw error;
    }
  }

  /**
   * Get a valid session token
   * This method ensures you always have a valid token for API requests
   * @returns {Promise<string>} The session token
   */
  async getValidToken() {
    try {
      // Check if we have a cached token that's still valid
      if (this.currentToken && this.isTokenValid()) {
        return this.currentToken;
      }

      // If we're already refreshing, wait for the current refresh
      if (this.isRefreshing) {
        return this.waitForTokenRefresh();
      }

      // Get a new token
      return await this.refreshToken();
    } catch (error) {
      console.error('Error getting valid token:', error);
      throw error;
    }
  }

  /**
   * Check if the current token is still valid
   * @returns {boolean}
   */
  isTokenValid() {
    if (!this.currentToken || !this.tokenExpiry) {
      return false;
    }

    // Check if token expires within the refresh threshold
    const now = Date.now();
    const timeUntilExpiry = this.tokenExpiry - now;
    
    return timeUntilExpiry > this.config.tokenRefreshThreshold;
  }

  /**
   * Refresh the session token
   * This is called automatically when tokens are expired or invalid
   * @returns {Promise<string>} The new session token
   */
  async refreshToken() {
    if (this.isRefreshing) {
      return this.waitForTokenRefresh();
    }

    this.isRefreshing = true;

    try {
      const token = await getSessionToken(this.app);
      
      // Validate the token
      const isValid = await this.validateToken(token);
      if (!isValid) {
        throw new Error('Invalid session token received');
      }

      this.currentToken = token;
      this.tokenExpiry = this.calculateTokenExpiry();
      this.retryCount = 0;

      // Resolve pending requests
      this.resolvePendingRequests(token);

      console.log('Session token refreshed successfully');
      return token;
    } catch (error) {
      console.error('Error refreshing token:', error);
      this.handleTokenError(error);
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Wait for the current token refresh to complete
   * This prevents multiple simultaneous token refresh attempts
   * @returns {Promise<string>} The refreshed token
   */
  waitForTokenRefresh() {
    return new Promise((resolve, reject) => {
      this.pendingRequests.push({ resolve, reject });
    });
  }

  /**
   * Resolve all pending requests with the new token
   * @param {string} token - The new session token
   */
  resolvePendingRequests(token) {
    this.pendingRequests.forEach(({ resolve }) => {
      resolve(token);
    });
    this.pendingRequests = [];
  }

  /**
   * Reject all pending requests
   * @param {Error} error - The error to reject with
   */
  rejectPendingRequests(error) {
    this.pendingRequests.forEach(({ reject }) => {
      reject(error);
    });
    this.pendingRequests = [];
  }

  /**
   * Validate a session token
   * @param {string} token - The token to validate
   * @returns {Promise<boolean>} Whether the token is valid
   */
  async validateToken(token) {
    try {
      const isValid = await validateSessionToken(this.app, token);
      return isValid;
    } catch (error) {
      console.error('Token validation error:', error);
      return false;
    }
  }

  /**
   * Calculate token expiry time (tokens typically last 48 hours)
   * @returns {number} Expiry timestamp
   */
  calculateTokenExpiry() {
    // Shopify session tokens typically last 48 hours
    return Date.now() + (48 * 60 * 60 * 1000);
  }

  /**
   * Make an authenticated request with automatic token management
   * This is the core method that handles all HTTP requests to Shopify API
   * @param {string} url - The URL to request
   * @param {Object} options - Fetch options
   * @returns {Promise<Response>} The fetch response
   */
  async authenticatedRequest(url, options = {}) {
    const maxRetries = this.config.maxRetries;
    let lastError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const token = await this.getValidToken();
        
        const requestOptions = {
          ...options,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...options.headers,
          },
        };

        const response = await fetch(url, requestOptions);

        // Handle 401 Unauthorized - token might be expired
        if (response.status === 401) {
          console.warn('Token expired, refreshing...');
          this.currentToken = null; // Force token refresh
          continue;
        }

        // Handle other errors
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response;
      } catch (error) {
        lastError = error;
        console.error(`Request attempt ${attempt + 1} failed:`, error);

        if (attempt < maxRetries) {
          // Wait before retrying with exponential backoff
          await this.delay(this.config.retryDelay * Math.pow(2, attempt));
        }
      }
    }

    throw lastError;
  }

  /**
   * Make a GET request with session token
   * @param {string} url - The URL to request
   * @param {Object} headers - Additional headers
   * @returns {Promise<Object>} The response data
   */
  async get(url, headers = {}) {
    const response = await this.authenticatedRequest(url, {
      method: 'GET',
      headers,
    });
    return response.json();
  }

  /**
   * Make a POST request with session token
   * @param {string} url - The URL to request
   * @param {Object} data - The data to send
   * @param {Object} headers - Additional headers
   * @returns {Promise<Object>} The response data
   */
  async post(url, data = {}, headers = {}) {
    const response = await this.authenticatedRequest(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    return response.json();
  }

  /**
   * Make a PUT request with session token
   * @param {string} url - The URL to request
   * @param {Object} data - The data to send
   * @param {Object} headers - Additional headers
   * @returns {Promise<Object>} The response data
   */
  async put(url, data = {}, headers = {}) {
    const response = await this.authenticatedRequest(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    return response.json();
  }

  /**
   * Make a DELETE request with session token
   * @param {string} url - The URL to request
   * @param {Object} headers - Additional headers
   * @returns {Promise<Object>} The response data
   */
  async delete(url, headers = {}) {
    const response = await this.authenticatedRequest(url, {
      method: 'DELETE',
      headers,
    });
    return response.json();
  }

  /**
   * Clear the current session token
   * Use this when logging out or when you need to force a new token
   */
  clearToken() {
    this.currentToken = null;
    this.tokenExpiry = null;
    this.rejectPendingRequests(new Error('Token cleared'));
  }

  /**
   * Get session information for debugging and monitoring
   * @returns {Object} Session information
   */
  getSessionInfo() {
    return {
      hasToken: !!this.currentToken,
      isTokenValid: this.isTokenValid(),
      tokenExpiry: this.tokenExpiry,
      isRefreshing: this.isRefreshing,
      pendingRequests: this.pendingRequests.length,
      retryCount: this.retryCount,
    };
  }

  /**
   * Handle token-related errors
   * @param {Error} error - The error to handle
   */
  handleTokenError(error) {
    this.retryCount++;
    this.rejectPendingRequests(error);

    // If we've exceeded max retries, clear the token
    if (this.retryCount >= this.config.maxRetries) {
      console.error('Max retries exceeded, clearing token');
      this.clearToken();
    }
  }

  /**
   * Handle general errors from App Bridge
   * @param {Error} error - The error to handle
   */
  handleError(error) {
    console.error('Shopify Session Manager Error:', error);
    
    // Handle specific error types
    if (error.message.includes('unauthorized') || error.message.includes('401')) {
      this.clearToken();
    }
  }

  /**
   * Utility function to delay execution
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise} Promise that resolves after the delay
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Create a default instance for easy use
const shopifySession = new ShopifySessionManager();

// Export the class and default instance
export { ShopifySessionManager, shopifySession };

// Legacy function for backward compatibility
export async function fetchWithSessionToken(url, options = {}) {
  return shopifySession.authenticatedRequest(url, options);
}

// Utility functions for easy access to common operations
export const ShopifySessionUtils = {
  /**
   * Create a new session manager instance with custom configuration
   * @param {Object} config - Configuration options
   * @returns {ShopifySessionManager} New session manager instance
   */
  createManager: (config) => new ShopifySessionManager(config),

  /**
   * Check if the current session is valid
   * @returns {boolean} Whether the session is valid
   */
  isSessionValid: () => shopifySession.isTokenValid(),

  /**
   * Get current session info for debugging
   * @returns {Object} Session information
   */
  getSessionInfo: () => shopifySession.getSessionInfo(),

  /**
   * Clear the current session
   */
  clearSession: () => shopifySession.clearToken(),
};

/**
 * INTEGRATION EXAMPLES FOR SHEETS CENTRAL:
 * ========================================
 * 
 * 1. In your shopify.ejs template:
 *    ```javascript
 *    <script type="module">
 *      import { shopifySession } from '/js/sh-session-tokens.js';
 *      
 *      // Load shop data when page loads
 *      document.addEventListener('DOMContentLoaded', async () => {
 *        try {
 *          const shopInfo = await shopifySession.get('/admin/api/2023-07/shop.json');
 *          document.getElementById('shop-name').textContent = shopInfo.shop.name;
 *        } catch (error) {
 *          console.error('Failed to load shop info:', error);
 *        }
 *      });
 *    </script>
 *    ```
 * 
 * 2. In your shopify-login.js:
 *    ```javascript
 *    import { shopifySession } from './sh-session-tokens.js';
 *    
 *    // After successful login, test the connection
 *    async function testConnection() {
 *      try {
 *        const products = await shopifySession.get('/admin/api/2023-07/products.json?limit=5');
 *        console.log('Connection successful, found', products.products.length, 'products');
 *      } catch (error) {
 *        console.error('Connection failed:', error);
 *      }
 *    }
 *    ```
 * 
 * 3. For your configuration page (sh-instructions.ejs):
 *    ```javascript
 *    import { shopifySession, ShopifySessionUtils } from './sh-session-tokens.js';
 *    
 *    // Check session status
 *    function checkSessionStatus() {
 *      const sessionInfo = ShopifySessionUtils.getSessionInfo();
 *      if (!sessionInfo.isTokenValid) {
 *        // Show re-authentication message
 *        document.getElementById('auth-status').textContent = 'Session expired. Please re-authenticate.';
 *      } else {
 *        document.getElementById('auth-status').textContent = 'Session valid!';
 *      }
 *    }
 *    ```
 * 
 * 4. For your protected routes (/shopify/protected):
 *    ```javascript
 *    import { ShopifySessionUtils } from './sh-session-tokens.js';
 *    
 *    // Validate session before allowing access
 *    if (!ShopifySessionUtils.isSessionValid()) {
 *      window.location.href = '/shopify';
 *    }
 *    ```
 * 
 * CONFIGURATION FOR PRODUCTION:
 * =============================
 * 
 * 1. Update the default configuration in the constructor:
 *    ```javascript
 *    const shopifySession = new ShopifySessionManager({
 *      apiKey: '75abca07b3318a56f4073ec4ccb16e90', // Your actual API key
 *      shopOrigin: window.location.hostname, // Dynamic shop origin
 *      tokenRefreshThreshold: 300000, // 5 minutes
 *      maxRetries: 3
 *    });
 *    ```
 * 
 * 2. Add error handling for production:
 *    ```javascript
 *    window.addEventListener('unhandledrejection', (event) => {
 *      if (event.reason.message.includes('Shopify')) {
 *        console.error('Shopify session error:', event.reason);
 *        // Redirect to login or show error message
 *      }
 *    });
 *    ```
 * 
 * 3. Monitor session status:
 *    ```javascript
 *    setInterval(() => {
 *      const sessionInfo = ShopifySessionUtils.getSessionInfo();
 *      if (!sessionInfo.isTokenValid && sessionInfo.hasToken) {
 *        console.warn('Session token expired, will refresh on next request');
 *      }
 *    }, 60000); // Check every minute
 *    ```
 */

// Example usage (commented out for production):
// const sessionManager = new ShopifySessionManager({
//   apiKey: 'your-actual-api-key',
//   shopOrigin: 'your-shop.myshopify.com',
//   tokenRefreshThreshold: 300000, // 5 minutes
//   maxRetries: 3
// });

// // Make authenticated requests
// sessionManager.get('/admin/api/2023-07/products.json').then(data => console.log(data));
// sessionManager.post('/admin/api/2023-07/products.json', { product: { title: 'New Product' } }).then(data => console.log(data));