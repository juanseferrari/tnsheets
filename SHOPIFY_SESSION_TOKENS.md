# Shopify Session Tokens Implementation Guide

This document explains how to use Shopify session tokens in your app to meet Shopify marketplace requirements.

## Overview

Your app has been updated to support Shopify session token authentication for embedded apps. This is required for listing on the Shopify App Store.

## What Changed

### 1. Updated Dependencies

- Updated `@shopify/shopify-api` to v12.1.0
- Added `@shopify/shopify-app-session-storage-memory` for session management
- Added `@shopify/app-bridge` v3.7.10 for frontend session token handling

### 2. New Files Created

#### Backend Files

- **`src/middlewares/verify-session-token.js`**
  - Middleware for validating session tokens on API endpoints
  - Decodes and verifies JWT tokens from Shopify embedded apps
  - Attaches shop information to `req.shopify` for use in controllers

#### Frontend Files

- **`public/js/shopify-app-bridge.js`**
  - JavaScript helper for App Bridge integration
  - Handles session token retrieval
  - Provides `authenticatedFetch()` function for making authenticated API calls

### 3. Updated Files

- **`src/middlewares/shopify.js`** - Updated to use new Shopify API v12
- **`src/views/instructions/sh-instructions.ejs`** - Added App Bridge script tags
- **`src/routes/api-routes.js`** - Added example protected API endpoints
- **`package.json`** - Updated dependencies

## How to Use Session Tokens

### Backend: Protecting API Endpoints

Use the `verifySessionToken` middleware on any API endpoint that should only be accessible from your embedded Shopify app:

```javascript
const { verifySessionToken } = require('../middlewares/verify-session-token');

// Protected endpoint
router.get('/api/shopify/shop-data', verifySessionToken, (req, res) => {
  // Access shop information from req.shopify
  const { shop, sessionId, userId } = req.shopify;

  res.json({
    success: true,
    shop: shop,
    message: 'Authenticated successfully'
  });
});
```

The middleware adds the following to `req.shopify`:
- `shop` - Shop domain (e.g., "example.myshopify.com")
- `sessionId` - Session ID from the token
- `userId` - User ID from the token
- `token` - The raw JWT token

### Frontend: Making Authenticated Requests

#### Basic Usage

The `shopify-app-bridge.js` script automatically initializes when the page loads if it detects a `shop` parameter in the URL (indicating it's running in an embedded context).

#### Making API Calls

Use the `authenticatedFetch()` function to make authenticated API calls:

```javascript
// Example: Load shop data
async function loadData() {
  try {
    const data = await window.shopifyAppBridge.authenticatedFetch(
      '/api/shopify/shop-data',
      { method: 'GET' }
    );
    console.log('Shop data:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Example: Update configuration
async function updateConfig(configData) {
  try {
    const result = await window.shopifyAppBridge.authenticatedFetch(
      '/api/shopify/update-config',
      {
        method: 'POST',
        body: JSON.stringify(configData)
      }
    );
    console.log('Configuration updated:', result);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

#### Getting Session Token Directly

If you need the session token for other purposes:

```javascript
const token = await window.shopifyAppBridge.getSessionToken();
console.log('Session token:', token);
```

## Example API Endpoints

Two example protected endpoints have been created in `src/routes/api-routes.js`:

1. **GET `/api/shopify/shop-data`**
   - Returns shop information
   - Demonstrates session token verification

2. **POST `/api/shopify/update-config`**
   - Updates shop configuration
   - Demonstrates POST requests with session tokens

## Testing Session Tokens

### Local Testing

1. Start your app: `npm start` or `npm test`
2. Access your app through Shopify admin (must be embedded)
3. Open browser console to see session token logs
4. Test API calls using the browser console:

```javascript
// Test from browser console
window.shopifyAppBridge.loadShopData();
```

### Required Shopify App Configuration

In your Shopify Partner Dashboard, ensure:

1. **App URL** points to your app (e.g., `https://www.sheetscentral.com/shopify/config`)
2. **Allowed redirection URL(s)** includes your OAuth callback
3. **Embedded app** is enabled
4. **App Bridge** version is set to 3.x

## Migration Notes

### OAuth Flow Still Supported

The traditional OAuth flow with HMAC verification is still in place for initial installation:

- `/shopify/verify` - HMAC verification
- `/shopify/oauth` - OAuth callback

This is necessary for the initial app installation. After installation, session tokens are used for all subsequent API calls.

### When to Use Each Method

- **OAuth Flow**: Used once during app installation
- **Session Tokens**: Used for all API calls after installation in the embedded app

## Security Considerations

1. **Session tokens are short-lived** (typically 1 minute)
   - The App Bridge automatically handles token refresh
   - Always request a fresh token for each API call

2. **Tokens are signed by Shopify**
   - The middleware verifies the signature using your API secret
   - Invalid or expired tokens are rejected

3. **HTTPS Required**
   - Session tokens only work over HTTPS in production
   - Localhost is allowed for development

## Troubleshooting

### "No authorization header found" Error

Make sure you're:
- Using `authenticatedFetch()` instead of regular `fetch()`
- Running in an embedded context (has `shop` parameter in URL)
- Including the App Bridge scripts in your HTML

### "Invalid session token" Error

Check that:
- Your API key and secret are correct in `.env`
- The token hasn't expired (refresh by making a new request)
- Your app is properly configured in Shopify Partner Dashboard

### App Bridge Not Initializing

Verify that:
- The URL has a `shop` parameter (e.g., `?shop=example.myshopify.com`)
- App Bridge scripts are loaded in the correct order
- Your API key matches the one in Shopify Partner Dashboard

## Environment Variables

Ensure these are set in your `.env` file:

```
SH_CLIENT_ID=your_shopify_api_key
SH_CLIENT_SECRET=your_shopify_api_secret
SH_APP_HANDLE=your-app-handle
HOST=https://www.sheetscentral.com
```

**Important:** The `SH_APP_HANDLE` is the app handle/slug from your Shopify Partner Dashboard (e.g., "sheets-central"). This is used to redirect users back to your app after OAuth installation. You can find this in your Shopify Partner Dashboard under your app's settings.

## OAuth Redirect Fix

The OAuth callback now properly redirects to Shopify's admin interface after successful installation:
- Uses the `host` parameter to redirect to `https://admin.shopify.com/apps/your-app-handle`
- This is required for embedded apps to pass Shopify's installation requirements
- The app will automatically load in the embedded context after redirect

## Next Steps

1. **Test the implementation** in a development store
2. **Replace example endpoints** with your actual API logic
3. **Update your existing API endpoints** to use `verifySessionToken` middleware
4. **Submit for Shopify App Store review** once testing is complete

## Additional Resources

- [Shopify Session Token Documentation](https://shopify.dev/docs/apps/auth/oauth/session-tokens)
- [App Bridge Documentation](https://shopify.dev/docs/api/app-bridge-library)
- [Shopify API Library for Node](https://github.com/Shopify/shopify-api-js)

## Questions or Issues?

If you encounter any issues with session tokens, check the browser console and server logs for detailed error messages.
