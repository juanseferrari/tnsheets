/**
 * Shopify App Bridge Session Token Handler - CDN Version
 * =======================================================
 *
 * This script initializes Shopify App Bridge using the CDN version (required by Shopify)
 * and provides utilities for making authenticated requests with session tokens.
 *
 * IMPORTANT: This uses the CDN-loaded App Bridge, NOT npm packages.
 * The script is loaded from: https://cdn.shopify.com/shopifycloud/app-bridge.js
 *
 * REQUIREMENTS FOR SHOPIFY EMBEDDED APP CHECKS:
 * ----------------------------------------------
 * 1. ✅ Using the latest App Bridge script loaded from Shopify's CDN
 * 2. ✅ Using session tokens for user authentication
 *
 * These are auto-checked by Shopify every 2 hours.
 */

(function() {
  'use strict';

  // Global state
  let appBridgeInstance = null;
  let currentSessionToken = null;
  let tokenExpiry = null;
  let isRefreshingToken = false;
  let pendingTokenRequests = [];

  /**
   * Initialize App Bridge when DOM is ready
   */
  function initializeAppBridge() {
    console.log('[Shopify App Bridge] Initializing...');

    // Check if App Bridge library is loaded from CDN
    if (!window.shopify || !window.shopify.AppBridge) {
      console.error('[Shopify App Bridge] App Bridge library not loaded. Make sure the CDN script is included.');
      return null;
    }

    // Get configuration from server (injected in the page)
    const config = window.shopifyConfig || {};

    // For embedded context, get shop and host from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const shopParam = urlParams.get('shop');
    const hostParam = urlParams.get('host');

    // Determine if we're in embedded context
    const isEmbedded = !!(shopParam && hostParam);

    if (!isEmbedded) {
      console.log('[Shopify App Bridge] Not in embedded context (no shop/host parameters)');
      console.log('[Shopify App Bridge] This is normal for the initial OAuth flow');
      return null;
    }

    // Validate we have the API key
    if (!config.apiKey || config.apiKey === '') {
      console.error('[Shopify App Bridge] API key not found in configuration');
      return null;
    }

    try {
      // Create App Bridge instance using CDN API
      const app = window.shopify.AppBridge.createApp({
        apiKey: config.apiKey,
        host: hostParam,
      });

      console.log('[Shopify App Bridge] Initialized successfully');
      console.log('[Shopify App Bridge] Shop:', shopParam);
      console.log('[Shopify App Bridge] Host:', hostParam);

      // Subscribe to errors
      app.error((data) => {
        console.error('[Shopify App Bridge] Error:', data);
      });

      return app;
    } catch (error) {
      console.error('[Shopify App Bridge] Failed to initialize:', error);
      return null;
    }
  }

  /**
   * Get a valid session token
   * Handles caching and automatic refresh
   * @returns {Promise<string>} The session token
   */
  async function getSessionToken() {
    if (!appBridgeInstance) {
      throw new Error('App Bridge is not initialized. Make sure you are in an embedded context.');
    }

    // Check if we have a valid cached token
    if (currentSessionToken && isTokenValid()) {
      console.log('[Shopify Session Token] Using cached token');
      return currentSessionToken;
    }

    // If we're already refreshing, wait for that to complete
    if (isRefreshingToken) {
      console.log('[Shopify Session Token] Waiting for token refresh...');
      return waitForTokenRefresh();
    }

    // Refresh the token
    return refreshSessionToken();
  }

  /**
   * Check if the current token is still valid
   * @returns {boolean}
   */
  function isTokenValid() {
    if (!currentSessionToken || !tokenExpiry) {
      return false;
    }

    // Check if token expires in the next 30 seconds
    const now = Date.now();
    const timeUntilExpiry = tokenExpiry - now;
    const refreshThreshold = 30 * 1000; // 30 seconds

    return timeUntilExpiry > refreshThreshold;
  }

  /**
   * Refresh the session token
   * @returns {Promise<string>}
   */
  async function refreshSessionToken() {
    if (isRefreshingToken) {
      return waitForTokenRefresh();
    }

    isRefreshingToken = true;
    console.log('[Shopify Session Token] Refreshing token...');

    try {
      // Use App Bridge's utility to get session token
      // The CDN version provides this as: window.shopify.AppBridge.actions.SessionToken
      const SessionToken = window.shopify.AppBridge.actions.SessionToken;

      // Create a session token action
      const sessionTokenAction = SessionToken.create(appBridgeInstance);

      // Get the token - this returns a promise
      const token = await new Promise((resolve, reject) => {
        sessionTokenAction.dispatch(SessionToken.Action.GET, {
          resolve: resolve,
          reject: reject
        });
      });

      if (!token) {
        throw new Error('Failed to retrieve session token');
      }

      currentSessionToken = token;
      // Session tokens expire after 1 minute
      tokenExpiry = Date.now() + (60 * 1000);

      console.log('[Shopify Session Token] Token refreshed successfully');
      console.log('[Shopify Session Token] Token length:', token.length);

      // Resolve all pending requests
      resolvePendingTokenRequests(token);

      return token;
    } catch (error) {
      console.error('[Shopify Session Token] Failed to refresh token:', error);
      rejectPendingTokenRequests(error);
      throw error;
    } finally {
      isRefreshingToken = false;
    }
  }

  /**
   * Wait for an ongoing token refresh to complete
   * @returns {Promise<string>}
   */
  function waitForTokenRefresh() {
    return new Promise((resolve, reject) => {
      pendingTokenRequests.push({ resolve, reject });
    });
  }

  /**
   * Resolve all pending token requests
   * @param {string} token
   */
  function resolvePendingTokenRequests(token) {
    pendingTokenRequests.forEach(({ resolve }) => resolve(token));
    pendingTokenRequests = [];
  }

  /**
   * Reject all pending token requests
   * @param {Error} error
   */
  function rejectPendingTokenRequests(error) {
    pendingTokenRequests.forEach(({ reject }) => reject(error));
    pendingTokenRequests = [];
  }

  /**
   * Make an authenticated fetch request with session token
   * This is the main function you'll use to call your backend APIs
   *
   * @param {string} url - The API endpoint to call
   * @param {Object} options - Fetch options (method, body, headers, etc.)
   * @returns {Promise<Response>} The fetch response
   */
  async function authenticatedFetch(url, options = {}) {
    if (!appBridgeInstance) {
      throw new Error('App Bridge is not initialized. Cannot make authenticated requests.');
    }

    try {
      // Get a valid session token
      const token = await getSessionToken();

      // Prepare headers with session token
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      };

      // Make the request
      console.log(`[Shopify Authenticated Fetch] ${options.method || 'GET'} ${url}`);
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle 401 - token might be expired
      if (response.status === 401) {
        console.warn('[Shopify Authenticated Fetch] Got 401, token might be expired. Clearing token...');
        currentSessionToken = null;
        tokenExpiry = null;

        // Retry once with a fresh token
        console.log('[Shopify Authenticated Fetch] Retrying with fresh token...');
        const newToken = await getSessionToken();

        return fetch(url, {
          ...options,
          headers: {
            ...headers,
            'Authorization': `Bearer ${newToken}`,
          },
        });
      }

      return response;
    } catch (error) {
      console.error('[Shopify Authenticated Fetch] Error:', error);
      throw error;
    }
  }

  /**
   * Convenience method for GET requests
   * @param {string} url - The API endpoint
   * @returns {Promise<Object>} The response data
   */
  async function get(url) {
    const response = await authenticatedFetch(url, { method: 'GET' });
    if (!response.ok) {
      throw new Error(`GET ${url} failed with status ${response.status}`);
    }
    return response.json();
  }

  /**
   * Convenience method for POST requests
   * @param {string} url - The API endpoint
   * @param {Object} data - The data to send
   * @returns {Promise<Object>} The response data
   */
  async function post(url, data) {
    const response = await authenticatedFetch(url, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`POST ${url} failed with status ${response.status}`);
    }
    return response.json();
  }

  /**
   * Convenience method for PUT requests
   * @param {string} url - The API endpoint
   * @param {Object} data - The data to send
   * @returns {Promise<Object>} The response data
   */
  async function put(url, data) {
    const response = await authenticatedFetch(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(`PUT ${url} failed with status ${response.status}`);
    }
    return response.json();
  }

  /**
   * Convenience method for DELETE requests
   * @param {string} url - The API endpoint
   * @returns {Promise<Object>} The response data
   */
  async function deleteRequest(url) {
    const response = await authenticatedFetch(url, { method: 'DELETE' });
    if (!response.ok) {
      throw new Error(`DELETE ${url} failed with status ${response.status}`);
    }
    return response.json();
  }

  /**
   * Get information about the current session
   * Useful for debugging
   * @returns {Object}
   */
  function getSessionInfo() {
    return {
      isInitialized: !!appBridgeInstance,
      hasToken: !!currentSessionToken,
      isTokenValid: isTokenValid(),
      tokenExpiry: tokenExpiry,
      isRefreshing: isRefreshingToken,
      pendingRequests: pendingTokenRequests.length,
    };
  }

  /**
   * Clear the current session token
   * Forces a refresh on the next request
   */
  function clearToken() {
    console.log('[Shopify Session Token] Clearing token');
    currentSessionToken = null;
    tokenExpiry = null;
  }

  // Initialize App Bridge when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      appBridgeInstance = initializeAppBridge();
    });
  } else {
    appBridgeInstance = initializeAppBridge();
  }

  // Export API to global scope
  window.ShopifyAppBridge = {
    // Core functionality
    getApp: () => appBridgeInstance,
    getSessionToken: getSessionToken,
    authenticatedFetch: authenticatedFetch,

    // Convenience methods
    get: get,
    post: post,
    put: put,
    delete: deleteRequest,

    // Utilities
    getSessionInfo: getSessionInfo,
    clearToken: clearToken,
    isInitialized: () => !!appBridgeInstance,
  };

  console.log('[Shopify App Bridge] Module loaded successfully');
})();

/**
 * USAGE EXAMPLES:
 * ===============
 *
 * 1. Check if App Bridge is initialized:
 *    ```javascript
 *    if (window.ShopifyAppBridge.isInitialized()) {
 *      console.log('Ready to make authenticated requests');
 *    }
 *    ```
 *
 * 2. Make a GET request:
 *    ```javascript
 *    const shopData = await window.ShopifyAppBridge.get('/api/shopify/shop-data');
 *    console.log('Shop:', shopData);
 *    ```
 *
 * 3. Make a POST request:
 *    ```javascript
 *    const result = await window.ShopifyAppBridge.post('/api/shopify/update-config', {
 *      setting1: 'value1',
 *      setting2: 'value2'
 *    });
 *    console.log('Updated:', result);
 *    ```
 *
 * 4. Custom authenticated request:
 *    ```javascript
 *    const response = await window.ShopifyAppBridge.authenticatedFetch('/api/custom-endpoint', {
 *      method: 'PATCH',
 *      body: JSON.stringify({ data: 'value' })
 *    });
 *    const data = await response.json();
 *    ```
 *
 * 5. Debug session info:
 *    ```javascript
 *    const info = window.ShopifyAppBridge.getSessionInfo();
 *    console.log('Session status:', info);
 *    ```
 */
