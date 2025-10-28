/**
 * Shopify App Bridge Session Token Handler
 * This script sets up App Bridge and handles authenticated API requests using session tokens
 */

// Initialize App Bridge
function initializeAppBridge() {
  // Get shop and host from URL parameters (passed by Shopify)
  const urlParams = new URLSearchParams(window.location.search);
  const shop = urlParams.get('shop');
  const host = urlParams.get('host');

  if (!shop) {
    console.error('Shop parameter is missing from URL');
    return null;
  }

  // Create App Bridge instance
  const app = window['app-bridge'].createApp({
    apiKey: '75abca07b3318a56f4073ec4ccb16e90', // Your Shopify API key
    host: host,
  });

  console.log('App Bridge initialized successfully');
  return app;
}

/**
 * Get session token from App Bridge
 * @param {Object} app - App Bridge instance
 * @returns {Promise<string>} Session token
 */
async function getSessionToken(app) {
  if (!app) {
    throw new Error('App Bridge is not initialized');
  }

  try {
    const token = await window['app-bridge-utils'].getSessionToken(app);
    console.log('Session token retrieved successfully');
    return token;
  } catch (error) {
    console.error('Error getting session token:', error);
    throw error;
  }
}

/**
 * Make an authenticated API request with session token
 * @param {Object} app - App Bridge instance
 * @param {string} endpoint - API endpoint to call
 * @param {Object} options - Fetch options (method, body, etc.)
 * @returns {Promise<Object>} Response data
 */
async function authenticatedFetch(app, endpoint, options = {}) {
  if (!app) {
    throw new Error('App Bridge is not initialized');
  }

  try {
    // Get fresh session token
    const token = await getSessionToken(app);

    // Prepare headers
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Make the request
    const response = await fetch(endpoint, {
      ...options,
      headers,
    });

    // Handle response
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Request failed with status ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Authenticated fetch error:', error);
    throw error;
  }
}

/**
 * Example: Load shop data using session token
 * @param {Object} app - App Bridge instance
 */
async function loadShopData(app) {
  try {
    const data = await authenticatedFetch(app, '/api/shopify/shop-data', {
      method: 'GET',
    });
    console.log('Shop data:', data);
    return data;
  } catch (error) {
    console.error('Error loading shop data:', error);
    // Handle error (show message to user, etc.)
  }
}

/**
 * Example: Update shop configuration
 * @param {Object} app - App Bridge instance
 * @param {Object} configData - Configuration data to update
 */
async function updateConfiguration(app, configData) {
  try {
    const data = await authenticatedFetch(app, '/api/shopify/update-config', {
      method: 'POST',
      body: JSON.stringify(configData),
    });
    console.log('Configuration updated:', data);
    return data;
  } catch (error) {
    console.error('Error updating configuration:', error);
    // Handle error (show message to user, etc.)
  }
}

// Initialize when page loads
let appBridgeInstance = null;

document.addEventListener('DOMContentLoaded', () => {
  // Only initialize App Bridge if we're in an embedded context (has shop parameter)
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('shop')) {
    appBridgeInstance = initializeAppBridge();

    if (appBridgeInstance) {
      console.log('App is running in embedded context');

      // Example: Load shop data automatically
      // Uncomment the line below to load shop data on page load
      // loadShopData(appBridgeInstance);
    }
  } else {
    console.log('App is not running in embedded context (no shop parameter)');
  }
});

// Export functions for use in other scripts
window.shopifyAppBridge = {
  getApp: () => appBridgeInstance,
  getSessionToken: () => getSessionToken(appBridgeInstance),
  authenticatedFetch: (endpoint, options) => authenticatedFetch(appBridgeInstance, endpoint, options),
  loadShopData: () => loadShopData(appBridgeInstance),
  updateConfiguration: (configData) => updateConfiguration(appBridgeInstance, configData),
};
